import os
from pathlib import Path
from typing import Final


def _resolve_data_root() -> Path:
    override = os.getenv("DATA_ROOT")
    if override:
        root = Path(override).expanduser().resolve()
    else:
        root = (
            Path(__file__)
            .resolve()
            .parent.parent.joinpath("data", "library")
        )
    root.mkdir(parents=True, exist_ok=True)
    return root


DATA_ROOT: Final[Path] = _resolve_data_root()
