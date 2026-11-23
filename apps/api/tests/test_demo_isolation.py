"""A shared demonstration resume must never be modified by visitors."""

import pytest
from fastapi import HTTPException

from resumeforge_api.models import Resume
from resumeforge_api.routes.resumes import (
    DEMO_RESUME_ID,
    create_resume,
    delete_resume,
    update_resume,
)


def demo_resume():
    return Resume.model_validate({
        "schemaVersion": "1.0",
        "metadata": {
            "id": DEMO_RESUME_ID,
            "title": "Demo",
            "updatedAt": "2026-01-01T00:00:00Z",
        },
        "profile": {"name": "Test User"},
        "skills": {"categories": []},
    })


@pytest.mark.parametrize("operation", ["create", "update", "delete"])
def test_demo_mutations_are_rejected(operation):
    with pytest.raises(HTTPException) as caught:
        if operation == "create":
            create_resume(demo_resume())
        elif operation == "update":
            update_resume(DEMO_RESUME_ID, demo_resume())
        else:
            delete_resume(DEMO_RESUME_ID)
    assert caught.value.status_code == 403
    assert caught.value.detail == "Demo resume is read-only"
