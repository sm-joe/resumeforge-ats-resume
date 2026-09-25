from fastapi import APIRouter
from resumeforge_analyzer import match_job_description

from ..models import Resume

router = APIRouter(
    prefix="/api/v1/match",
    tags=["job matching"],
)


@router.post("")
def match_resume(
    resume: Resume,
    job_description: str,
) -> dict:
    return match_job_description(
        resume,
        job_description,
    )