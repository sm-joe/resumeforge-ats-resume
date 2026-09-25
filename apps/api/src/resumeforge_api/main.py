from fastapi import FastAPI

from resumeforge_api.routes.export import router as export_router
from resumeforge_api.routes.analyze import router as analyze_router
from resumeforge_api.routes.match import router as match_router

from .models import Resume


app = FastAPI(
    title="ResumeForge API",
    version="0.1.0",
)


app.include_router(export_router)
app.include_router(analyze_router)
app.include_router(match_router)


demo_resume = Resume(
    schemaVersion="1.0",
    metadata={
        "id": "demo-resume-001",
        "title": "Senior Cloud Architect",
        "updatedAt": "2026-09-25T00:00:00Z",
    },
    profile={
        "name": "Alex Morgan",
        "headline": "Senior Cloud Architect",
        "email": "alex.morgan@example.com",
        "phone": "+1 555 010 2040",
        "location": "Berlin, Germany",
        "links": [],
    },
    summary=(
        "Senior Cloud Architect with extensive experience designing secure, "
        "scalable cloud platforms, infrastructure automation, and DevSecOps solutions."
    ),
    experience=[
        {
            "id": "experience-001",
            "company": "Example Cloud Systems",
            "title": "Senior Cloud Architect",
            "location": "Berlin, Germany",
            "startDate": "2022-03",
            "current": True,
            "bullets": [
                "Designed secure multi-account cloud architectures supporting production workloads.",
                "Implemented infrastructure automation using Terraform and CI/CD pipelines.",
            ],
        }
    ],
    skills={
        "categories": [
            {
                "id": "skills-cloud",
                "name": "Cloud",
                "items": ["AWS", "Azure", "Kubernetes"],
            }
        ]
    },
    education=[],
    projects=[],
    certifications=[],
    languages=[],
    customSections=[],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/resumes/demo", response_model=Resume)
def get_demo_resume() -> Resume:
    return demo_resume