"""Seed sample data for the Unknown CRUD Library FastAPI backend."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend_py import settings, storage
from backend_py.models import (
    Commentary,
    CommentaryTarget,
    OriginEntry,
    ReviewBlock,
    ReviewHistoryEntry,
    Verse,
    Work,
)


def seed_work() -> Work:
    """Create the sample work definition."""
    return Work(
        work_id="satyanusaran",
        title={"bn": "সত্যানুসরণ", "en": "Satyanusaran"},
        author="Sree Sree Thakur",
        canonical_lang="bn",
        langs=["bn", "en"],
        structure={"unit": "verse", "numbering": "sequential"},
        source_editions=[
            {"id": "ED-PDF-BN-01", "lang": "bn", "type": "pdf", "provenance": "personal_copy"},
            {"id": "ED-PDF-EN-01", "lang": "en", "type": "pdf", "provenance": "personal_copy"},
        ],
        policy={
            "sacred": True,
            "monetization": "forbidden",
            "truthfulness": "never attribute words to Thakur without source",
        },
    )


def seed_verses(work_id: str) -> list[Verse]:
    """Create two illustrative verses for the sample work."""
    segments = {lang: [] for lang in ["bn", "en"]}
    hash_block = {lang: None for lang in ["bn", "en"]}
    return [
        Verse(
            work_id=work_id,
            verse_id="V0001",
            number_manual="1",
            order=1,
            texts={
                "bn": "মানব হৃদয়ে সত্যের অনুসন্ধানেই জীবনের সার্থকতা।",
                "en": "The fulfillment of life is the quest for truth within the human heart.",
            },
            segments=segments,
            origin=[
                OriginEntry(edition="ED-PDF-BN-01", page=1, para_index=1),
                OriginEntry(edition="ED-PDF-EN-01", page=1, para_index=1),
            ],
            tags=["philosophy", "intro"],
            hash=hash_block,
            meta={"entered_by": "seed@unknown-crud.local"},
            review=ReviewBlock(
                state="approved",
                history=[
                    ReviewHistoryEntry(
                        ts=datetime.now(timezone.utc),
                        actor="seed@unknown-crud.local",
                        action="state_change",
                        **{"from": "draft", "to": "approved"},
                    )
                ],
            ),
        ),
        Verse(
            work_id=work_id,
            verse_id="V0002",
            number_manual="2",
            order=2,
            texts={
                "bn": "যে প্রেম সত্যে স্থিত, সে প্রেমেই সকলের মুক্তি।",
                "en": "Only love rooted in truth can liberate all beings.",
            },
            segments=segments,
            origin=[
                OriginEntry(edition="ED-PDF-BN-01", page=1, para_index=2),
                OriginEntry(edition="ED-PDF-EN-01", page=1, para_index=2),
            ],
            tags=["love"],
            hash=hash_block,
            meta={"entered_by": "seed@unknown-crud.local"},
            review=ReviewBlock(state="review_pending"),
        ),
    ]


def seed_commentary(work_id: str) -> Commentary:
    """Create a verse-level commentary entry."""
    return Commentary(
        work_id=work_id,
        verse_id="V0001",
        commentary_id="C-SATYA-V0001-0001",
        targets=[CommentaryTarget(kind="verse", ids=["V0001"])],
        speaker="P-DESC-05",
        source="S-FOREWORD-2022",
        date={"iso": "2022-08-15"},
        genre="interpretation",
        tags=["reflection"],
        texts={
            "bn": "সত্যের পথ প্রেমেই উন্মোচিত হয়, তাই হৃদয়কে প্রেমে পূর্ণ করো।",
            "en": "Let the heart be filled with love, for truth reveals itself through love.",
        },
        authenticity={"status": "attested", "confidence": 0.9},
        priority={"lineage_bias": 1.0},
        review=ReviewBlock(state="review_pending"),
    )


def main() -> None:
    work = seed_work()
    storage.save_work(work)

    for verse in seed_verses(work.work_id):
        storage.save_verse(verse)

    commentary = seed_commentary(work.work_id)
    storage.save_commentary(commentary)

    print(f"Seeded sample data in {settings.DATA_ROOT / work.work_id}")


if __name__ == "__main__":
    main()
