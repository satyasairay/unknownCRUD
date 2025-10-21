import importlib
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    data_root = tmp_path / "library"
    monkeypatch.setenv("DATA_ROOT", str(data_root))

    import backend_py.settings as settings

    importlib.reload(settings)

    import backend_py.storage as storage  # noqa: WPS433

    importlib.reload(storage)

    import backend_py.app as app_module  # noqa: WPS433
    importlib.reload(app_module)

    return TestClient(app_module.create_app())


def test_register_login_create_verse_approve_export(client: TestClient, tmp_path):
    work_payload = {
        "work_id": "satyanusaran",
        "title": {"en": "Satyanusaran", "bn": "Satyanusaran (BN)"},
        "author": "Sree Sree Thakur",
        "canonical_lang": "bn",
        "langs": ["bn", "en"],
        "structure": {"unit": "verse", "numbering": "sequential"},
        "source_editions": [
            {"id": "ED-PDF-BN-01", "lang": "bn", "type": "pdf", "provenance": "personal_copy"}
        ],
        "policy": {
            "sacred": True,
            "monetization": "forbidden",
            "truthfulness": "never attribute words to Thakur without source",
        },
    }
    register_payload = {
        "email": "author@example.com",
        "password": "supersecurepassword",
        "roles": ["author"],
    }
    response = client.post("/auth/register", json=register_payload)
    assert response.status_code == 201

    login_payload = {
        "email": "author@example.com",
        "password": "supersecurepassword",
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "session_id" in response.cookies

    response = client.put("/works/satyanusaran", json=work_payload)
    assert response.status_code == 200

    verse_payload = {
        "number_manual": "1",
        "texts": {"bn": "Verse BN 1", "en": "Verse EN 1"},
        "origin": [{"edition": "ED-PDF-BN-01", "page": 1, "para_index": 1}],
        "tags": ["intro"],
    }
    response = client.post("/works/satyanusaran/verses", json=verse_payload)
    assert response.status_code == 201
    created = response.json()
    verse_id = created["verse_id"]

    response = client.post(
        f"/review/verse/{verse_id}/approve",
        json={"work_id": "satyanusaran"},
    )
    assert response.status_code == 200
    assert response.json()["review"]["state"] == "approved"

    response = client.post("/export/train", json={"work_id": "satyanusaran"})
    assert response.status_code == 200
    output_path = Path(response.json()["output"])
    assert output_path.exists()
    content = output_path.read_text(encoding="utf-8").strip().splitlines()
    assert any(json.loads(line)["type"] == "verse" for line in content)
