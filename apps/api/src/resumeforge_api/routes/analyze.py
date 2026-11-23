from fastapi import APIRouter

from resumeforge_analyzer import analyze_resume

from ..models import Resume

router = APIRouter(
    prefix="/api/v1/analyze",
    tags=["analyzer"],
)


@router.post("")
def analyze(resume: Resume) -> dict:
    result = analyze_resume(resume)

    return {
        "score_kind": "resume_quality",
        "score_version": "1.0",
        "method": "deterministic_rule_based",
        "disclaimer": (
            "This score measures resume content and completeness against published "
            "ResumeForge rules. It is not an employer ATS acceptance probability."
        ),
        "overall_score": result.overall_score,
        "category_scores": [
            {
                "category": category.category,
                "score": category.score,
                "max_score": category.max_score,
            }
            for category in result.category_scores
        ],
        "findings": [
            {
                "id": finding.id,
                "severity": finding.severity,
                "category": finding.category,
                "message": finding.message,
            }
            for finding in result.findings
        ],
    }