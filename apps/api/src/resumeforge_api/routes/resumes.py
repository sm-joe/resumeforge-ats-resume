"""Capability-key isolation for self-hosted, browser-local resume storage.

This is not a user-account system. Every browser owns only records created with
its random, locally stored resume key. Never share keys between browsers.
"""
import hashlib
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException
from sqlalchemy import select

from resumeforge_api.db import ResumeRecord, SessionLocal
from resumeforge_api.models import Resume

DEMO_RESUME_ID = "demo-resume-001"
router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])


def _owner_hash(owner_key: str) -> str:
    if not isinstance(owner_key, str) or not re.fullmatch(r"[0-9a-f]{64}", owner_key):
        raise HTTPException(status_code=401, detail="A valid resume ownership key is required")
    return hashlib.sha256(owner_key.encode("ascii")).hexdigest()


def _private_record(session, resume_id: str, owner_hash: str) -> ResumeRecord:
    record = session.get(ResumeRecord, resume_id)
    if record is None or record.owner_key_hash != owner_hash:
        raise HTTPException(status_code=404, detail="Resume not found")
    return record


@router.get("", response_model=list[Resume])
def list_resumes(
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> list[Resume]:
    owner = _owner_hash(owner_key)
    with SessionLocal() as session:
        records = session.scalars(
            select(ResumeRecord)
            .where(ResumeRecord.owner_key_hash == owner)
            .order_by(ResumeRecord.updated_at.desc())
        ).all()
        return [Resume.model_validate(record.resume_json) for record in records]


@router.post("", response_model=Resume, status_code=201)
def create_resume(
    resume: Resume,
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> Resume:
    if resume.metadata.id == DEMO_RESUME_ID:
        raise HTTPException(status_code=403, detail="Demo resume is read-only")
    owner = _owner_hash(owner_key)
    now = datetime.now(timezone.utc)
    with SessionLocal() as session:
        if session.get(ResumeRecord, resume.metadata.id) is not None:
            raise HTTPException(status_code=409, detail="Resume already exists")
        session.add(ResumeRecord(
            id=resume.metadata.id,
            owner_key_hash=owner,
            title=resume.metadata.title,
            schema_version=resume.schemaVersion,
            resume_json=resume.model_dump(),
            created_at=now,
            updated_at=now,
        ))
        session.commit()
    return resume


@router.get("/{resume_id}", response_model=Resume)
def get_resume(
    resume_id: str,
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> Resume:
    owner = _owner_hash(owner_key)
    with SessionLocal() as session:
        return Resume.model_validate(_private_record(session, resume_id, owner).resume_json)


@router.put("/{resume_id}", response_model=Resume)
def update_resume(
    resume_id: str,
    resume: Resume,
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> Resume:
    if resume_id == DEMO_RESUME_ID:
        raise HTTPException(status_code=403, detail="Demo resume is read-only")
    if resume.metadata.id != resume_id:
        raise HTTPException(status_code=400, detail="Resume ID does not match metadata.id")
    owner = _owner_hash(owner_key)
    with SessionLocal() as session:
        record = _private_record(session, resume_id, owner)
        record.title = resume.metadata.title
        record.schema_version = resume.schemaVersion
        record.resume_json = resume.model_dump()
        record.updated_at = datetime.now(timezone.utc)
        session.commit()
    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str,
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> None:
    if resume_id == DEMO_RESUME_ID:
        raise HTTPException(status_code=403, detail="Demo resume is read-only")
    owner = _owner_hash(owner_key)
    with SessionLocal() as session:
        record = _private_record(session, resume_id, owner)
        session.delete(record)
        session.commit()
