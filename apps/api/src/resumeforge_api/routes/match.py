from fastapi import APIRouter
from pydantic import BaseModel, Field

from resumeforge_analyzer import match_job_description

from ..models import Resume


router = APIRouter(
    prefix="/api/v1/match",
    tags=["job matching"],
)


class MatchRequest(BaseModel):
    resume: Resume
    job_description: str = Field(min_length=30, max_length=20_000)


@router.post("")
def match_resume(
    request: MatchRequest,
) -> dict:
    return match_job_description(
        request.resume,
        request.job_description,
    )