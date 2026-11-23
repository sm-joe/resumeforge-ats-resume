"""Capability-key isolation for self-hosted, browser-local resume storage.

This is not a user-account system. Every browser owns only records created with
its random, locally stored resume key. Never share keys between browsers.
"""
import hashlib
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException
from sqlalchemy import select, update

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


def _resume_from_record(record: ResumeRecord) -> Resume:
    resume = Resume.model_validate(record.resume_json)
    resume.metadata.revision = record.revision
    return resume


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
        return [_resume_from_record(record) for record in records]


@router.post("", response_model=Resume, status_code=201)
def create_resume(
    resume: Resume,
    owner_key: str = Header(default="", alias="X-Resume-Key"),
) -> Resume:
    if resume.metadata.id == DEMO_RESUME_ID:
        raise HTTPException(status_code=403, detail="Demo resume is read-only")
    owner = _owner_hash(owner_key)
    now = datetime.now(timezone.utc)
    resume.metadata.revision = 1
    with SessionLocal() as session:
        if session.get(ResumeRecord, resume.metadata.id) is not None:
            raise HTTPException(status_code=409, detail="Resume already exists")
        session.add(ResumeRecord(
            id=resume.metadata.id,
            owner_key_hash=owner,
            revision=1,
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
        return _resume_from_record(_private_record(session, resume_id, owner))


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
        expected = resume.metadata.revision
        if expected is None:
            raise HTTPException(status_code=428, detail="Resume revision required")
        if expected != record.revision:
            raise HTTPException(status_code=409, detail="Resume changed in another session")
        # Atomic conditional update: only one writer can advance a revision.
        next_revision = expected + 1
        resume.metadata.revision = next_revision
        result = session.execute(
            update(ResumeRecord)
            .where(
                ResumeRecord.id == resume_id,
                ResumeRecord.owner_key_hash == owner,
                ResumeRecord.revision == expected,
            )
            .values(
                title=resume.metadata.title,
                schema_version=resume.schemaVersion,
                resume_json=resume.model_dump(),
                revision=next_revision,
                updated_at=datetime.now(timezone.utc),
            )
        )
        if result.rowcount != 1:
            session.rollback()
            raise HTTPException(status_code=409, detail="Resume changed in another session")
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
