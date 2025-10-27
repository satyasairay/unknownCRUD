from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import settings
from models import Commentary, User, Verse, Work

WORK_JSON = "work.json"
VERSES_DIR = "verses"
COMMENTARY_DIR = "commentary"
TRASH_DIR = "trash"
USERS_FILE = "_users.json"
LOGS_DIR = settings.DATA_ROOT.parent / "logs"
REVIEW_LOG_DIR = LOGS_DIR / "review"

VERSE_ID_PATTERN = re.compile(r"^V(\d{4})([a-z]?)$")
COMMENTARY_ID_PATTERN = re.compile(r"^C-[A-Z0-9]+-V\d{4}-\d{4}$")


def read_json(path: Path) -> Dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _default_encoder(value):
    if isinstance(value, datetime):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value)} is not JSON serializable")


def write_json(path: Path, payload: Dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, default=_default_encoder)


def list_work_ids() -> List[str]:
    root = settings.DATA_ROOT
    if not root.exists():
        return []
    return sorted(
        item.name
        for item in root.iterdir()
        if item.is_dir() and (item / WORK_JSON).exists()
    )


def work_dir(work_id: str) -> Path:
    return settings.DATA_ROOT / work_id


def work_path(work_id: str) -> Path:
    return work_dir(work_id) / WORK_JSON


def verse_path(work_id: str, verse_id: str) -> Path:
    return work_dir(work_id) / VERSES_DIR / f"{verse_id}.json"


def commentary_path(work_id: str, commentary_id: str, verse_id: Optional[str]) -> Path:
    base = work_dir(work_id) / COMMENTARY_DIR
    if verse_id:
        base = base / verse_id
    else:
        base = base / "work"
    return base / f"{commentary_id}.json"


def load_work(work_id: str) -> Work:
    return Work.parse_obj(read_json(work_path(work_id)))


def save_work(work: Work) -> None:
    write_json(work_path(work.work_id), work.dict(by_alias=True))


def list_verses(work_id: str) -> List[Verse]:
    verses_dir = work_dir(work_id) / VERSES_DIR
    if not verses_dir.exists():
        return []
    verses: List[Verse] = []
    for file_path in sorted(verses_dir.glob("V*.json")):
        verses.append(Verse.parse_obj(read_json(file_path)))
    verses.sort(key=lambda v: v.order)
    return verses


def load_verse(work_id: str, verse_id: str) -> Verse:
    return Verse.parse_obj(read_json(verse_path(work_id, verse_id)))


def save_verse(verse: Verse) -> None:
    write_json(
        verse_path(verse.work_id, verse.verse_id), verse.dict(by_alias=True)
    )


def _tombstone_path(kind: str, identifier: str, work_id: str) -> Path:
    return (
        work_dir(work_id)
        / TRASH_DIR
        / "tombstones"
        / kind
        / f"{identifier}.json"
    )


def _create_tombstone(kind: str, identifier: str, work_id: str, actor: str, original: Path, dest: Path) -> None:
    tombstone = {
        "type": kind,
        "work_id": work_id,
        "id": identifier,
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "actor": actor,
        "original_path": str(original.relative_to(work_dir(work_id))),
        "trashed_path": str(dest.relative_to(work_dir(work_id))),
    }
    path = _tombstone_path(kind, identifier, work_id)
    write_json(path, tombstone)


def manual_number_exists(work_id: str, number_manual: Optional[str], exclude: Optional[str] = None) -> bool:
    if not number_manual:
        return False
    for verse in list_verses(work_id):
        if verse.number_manual == number_manual and verse.verse_id != exclude:
            return True
    return False


def delete_verse(work_id: str, verse_id: str, actor: str) -> None:
    src = verse_path(work_id, verse_id)
    if not src.exists():
        return
    dest = work_dir(work_id) / TRASH_DIR / VERSES_DIR / src.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    src.replace(dest)
    _create_tombstone("verses", verse_id, work_id, actor, src, dest)


def list_commentary(work_id: str) -> List[Commentary]:
    base = work_dir(work_id) / COMMENTARY_DIR
    if not base.exists():
        return []
    items: List[Commentary] = []
    for json_path in base.glob("**/*.json"):
        data = read_json(json_path)
        commentary = Commentary.parse_obj(data)
        items.append(commentary)
    return items


def list_commentary_for_verse(work_id: str, verse_id: str) -> List[Commentary]:
    results: List[Commentary] = []
    for commentary in list_commentary(work_id):
        if commentary.verse_id == verse_id:
            results.append(commentary)
            continue
        targets = commentary.targets or []
        if any(verse_id in target.ids for target in targets):
            results.append(commentary)
    return results


def load_commentary(work_id: str, commentary_id: str) -> Commentary:
    base = work_dir(work_id) / COMMENTARY_DIR
    if not base.exists():
        raise FileNotFoundError(commentary_id)
    matches = list(base.glob(f"**/{commentary_id}.json"))
    if not matches:
        raise FileNotFoundError(commentary_id)
    data = read_json(matches[0])
    return Commentary.parse_obj(data)


def save_commentary(commentary: Commentary) -> None:
    verse_id = commentary.verse_id
    path = commentary_path(commentary.work_id, commentary.commentary_id, verse_id)
    write_json(path, commentary.dict(by_alias=True))


def delete_commentary(work_id: str, commentary_id: str, actor: str) -> None:
    base = work_dir(work_id) / COMMENTARY_DIR
    matches = list(base.glob(f"**/{commentary_id}.json"))
    if not matches:
        return
    src = matches[0]
    rel = src.relative_to(work_dir(work_id))
    dest = work_dir(work_id) / TRASH_DIR / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    src.replace(dest)
    _create_tombstone(
        "commentary",
        commentary_id,
        work_id,
        actor,
        work_dir(work_id) / rel,
        dest,
    )


def _existing_verse_ids(work_id: str) -> Iterable[str]:
    verses_dir = work_dir(work_id) / VERSES_DIR
    if not verses_dir.exists():
        return []
    return (path.stem for path in verses_dir.glob("V*.json"))


def generate_verse_id(work_id: str) -> Tuple[str, int]:
    max_index = 0
    suffixes: Dict[int, List[str]] = {}
    for verse_id in _existing_verse_ids(work_id):
        match = VERSE_ID_PATTERN.match(verse_id)
        if not match:
            continue
        number = int(match.group(1))
        max_index = max(max_index, number)
        suffixes.setdefault(number, []).append(match.group(2))
    next_number = max_index + 1
    suffix = ""
    existing_suffixes = set(suffixes.get(next_number, []))
    alphabet = [chr(code) for code in range(ord("a"), ord("z") + 1)]
    for candidate in [""] + alphabet:
        if candidate not in existing_suffixes:
            suffix = candidate
            break
    verse_id = f"V{next_number:04d}{suffix}"
    return verse_id, next_number


def generate_commentary_id(work_id: str, verse_id: str) -> str:
    base = work_dir(work_id) / COMMENTARY_DIR / verse_id
    if not base.exists():
        index = 1
    else:
        indices = []
        for path in base.glob("C-*.json"):
            match = COMMENTARY_ID_PATTERN.match(path.stem)
            if match:
                indices.append(int(path.stem.split("-")[-1]))
        index = max(indices, default=0) + 1
    work_code = work_id.replace("-", "").upper()[:6]
    commentary_id = f"C-{work_code}-" f"{verse_id}-{index:04d}"
    return commentary_id


def users_path() -> Path:
    return settings.DATA_ROOT / USERS_FILE


def load_users() -> List[User]:
    path = users_path()
    if not path.exists():
        return []
    data = read_json(path)
    return [User.parse_obj(item) for item in data]


def save_users(users: List[User]) -> None:
    write_json(users_path(), [user.dict(by_alias=True) for user in users])


def append_review_log(kind: str, work_id: str, identifier: str, payload: Dict) -> None:
    REVIEW_LOG_DIR.mkdir(parents=True, exist_ok=True)
    date_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = REVIEW_LOG_DIR / f"{date_key}.jsonl"
    entry = {
        "ts": payload.get("ts") or datetime.now(timezone.utc).isoformat(),
        "kind": kind,
        "work_id": work_id,
        "id": identifier,
        "actor": payload.get("actor"),
        "action": payload.get("action"),
        "from": payload.get("from"),
        "to": payload.get("to"),
        "issues": payload.get("issues", []),
    }
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False))
        handle.write("\n")
