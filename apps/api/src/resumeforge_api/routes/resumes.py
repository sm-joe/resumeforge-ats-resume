from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from resumeforge_api.db import ResumeRecord, SessionLocal
from resumeforge_api.models import Resume


router = APIRouter(
    prefix="/api/v1/resumes",
    tags=["resumes"],
)


@router.get("", response_model=list[Resume])
def list_resumes() -> list[Resume]:
    with SessionLocal() as session:
        records = session.scalars(
            select(ResumeRecord).order_by(
                ResumeRecord.updated_at.desc(),
            ),
        ).all()

        return [
            Resume.model_validate(record.resume_json)
            for record in records
        ]


@router.post("", response_model=Resume, status_code=201)
def create_resume(resume: Resume) -> Resume:
    now = datetime.now(timezone.utc)

    record = ResumeRecord(
        id=resume.metadata.id,
        title=resume.metadata.title,
        schema_version=resume.schemaVersion,
        resume_json=resume.model_dump(),
        created_at=now,
        updated_at=now,
    )

    with SessionLocal() as session:
        existing = session.get(
            ResumeRecord,
            resume.metadata.id,
        )

        if existing is not None:
            raise HTTPException(
                status_code=409,
                detail="Resume already exists",
            )

        session.add(record)
        session.commit()

    return resume


@router.get("/{resume_id}", response_model=Resume)
def get_resume(resume_id: str) -> Resume:
    with SessionLocal() as session:
        record = session.get(
            ResumeRecord,
            resume_id,
        )

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        return Resume.model_validate(
            record.resume_json,
        )


@router.put("/{resume_id}", response_model=Resume)
def update_resume(
    resume_id: str,
    resume: Resume,
) -> Resume:
    if resume.metadata.id != resume_id:
        raise HTTPException(
            status_code=400,
            detail="Resume ID does not match metadata.id",
        )

    with SessionLocal() as session:
        record = session.get(
            ResumeRecord,
            resume_id,
        )

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        record.title = resume.metadata.title
        record.schema_version = resume.schemaVersion
        record.resume_json = resume.model_dump()
        record.updated_at = datetime.now(timezone.utc)

        session.commit()

    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: str) -> None:
    with SessionLocal() as session:
        record = session.get(
            ResumeRecord,
            resume_id,
        )

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        session.delete(record)
        session.commit()