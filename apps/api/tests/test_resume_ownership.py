"""M1 regression: owner keys cannot expose another browser's private resumes."""

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from resumeforge_api.db import Base
from resumeforge_api.models import Resume
from resumeforge_api.routes import resumes as routes

OWNER_A = "a" * 64
OWNER_B = "b" * 64


@pytest.fixture(autouse=True)
def isolated_resume_db(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    monkeypatch.setattr(routes, "SessionLocal", sessionmaker(bind=engine))
    yield
    engine.dispose()


def resume(resume_id="owned-001", title="Private"):
    return Resume.model_validate({
        "schemaVersion": "1.0",
        "metadata": {"id": resume_id, "title": title, "updatedAt": "2026-01-01"},
        "profile": {"name": "Private Candidate"},
        "skills": {"categories": []},
    })


def test_owner_key_is_required():
    with pytest.raises(HTTPException) as error:
        routes.list_resumes(owner_key="")
    assert error.value.status_code == 401


def test_each_browser_can_only_list_its_own_resumes():
    routes.create_resume(resume("alpha"), owner_key=OWNER_A)
    routes.create_resume(resume("beta"), owner_key=OWNER_B)
    assert [r.metadata.id for r in routes.list_resumes(owner_key=OWNER_A)] == ["alpha"]
    assert [r.metadata.id for r in routes.list_resumes(owner_key=OWNER_B)] == ["beta"]


@pytest.mark.parametrize("action", ["read", "update", "delete"])
def test_other_owner_cannot_access_resume(action):
    routes.create_resume(resume(), owner_key=OWNER_A)
    with pytest.raises(HTTPException) as error:
        if action == "read":
            routes.get_resume("owned-001", owner_key=OWNER_B)
        elif action == "update":
            routes.update_resume("owned-001", resume(), owner_key=OWNER_B)
        else:
            routes.delete_resume("owned-001", owner_key=OWNER_B)
    assert error.value.status_code == 404
    assert routes.get_resume("owned-001", owner_key=OWNER_A).profile.name == "Private Candidate"


def test_owner_can_update_and_delete():
    routes.create_resume(resume(), owner_key=OWNER_A)
    routes.update_resume("owned-001", resume(title="Revised"), owner_key=OWNER_A)
    assert routes.get_resume("owned-001", owner_key=OWNER_A).metadata.title == "Revised"
    routes.delete_resume("owned-001", owner_key=OWNER_A)
    assert routes.list_resumes(owner_key=OWNER_A) == []


def test_invalid_key_is_rejected():
    with pytest.raises(HTTPException) as error:
        routes.create_resume(resume(), owner_key="guessable")
    assert error.value.status_code == 401


def test_design_fields_survive_api_round_trip():
    value = resume("styled-001")
    value.design.template = "modern"
    value.design.pageSize = "LETTER"
    value.design.accentColor = "#123456"
    routes.create_resume(value, owner_key=OWNER_A)
    loaded = routes.get_resume("styled-001", owner_key=OWNER_A)
    assert loaded.design.pageSize == "LETTER"
    assert loaded.design.accentColor == "#123456"


def test_legacy_resume_without_design_receives_defaults():
    payload = resume("legacy-001").model_dump()
    payload.pop("design", None)
    loaded = Resume.model_validate(payload)
    assert loaded.design.template == "modern"
    assert loaded.design.pageSize == "A4"
