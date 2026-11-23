"""Regression tests for Word download security and document integrity."""

from io import BytesIO

from docx import Document
import pytest
from fastapi import HTTPException

from resumeforge_api.models import Resume
from resumeforge_api.routes import export as export_route


def sample_resume(title: str = "Senior Engineer") -> Resume:
    return Resume.model_validate({
        "schemaVersion": "1.0",
        "metadata": {"id": "test-resume", "title": title, "updatedAt": "2026-01-01T00:00:00Z"},
        "profile": {"name": "Jane Example", "email": "jane@example.com"},
        "summary": "Built reliable applications.",
        "experience": [],
        "skills": {"categories": []},
    })


def test_word_export_returns_valid_in_memory_docx():
    response = export_route.export_word(sample_resume())
    assert response.status_code == 200
    assert response.body[:2] == b"PK"
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["content-disposition"] == (
        'attachment; filename="Senior Engineer.docx"'
    )
    document = Document(BytesIO(response.body))
    assert any("Jane Example" in p.text for p in document.paragraphs)


def test_filename_is_safe_for_content_disposition():
    response = export_route.export_word(sample_resume("evil\\r\\nX-Evil: yes/../../private"))
    disposition = response.headers["content-disposition"]
    assert "\\r" not in disposition
    assert "\\n" not in disposition
    assert "/" not in disposition
    assert "\\\\" not in disposition


def test_word_export_hides_internal_errors(monkeypatch):
    def fail(_resume):
        raise RuntimeError("private filesystem path /tmp/resume-secret.docx")

    monkeypatch.setattr(export_route, "resume_to_docx", fail)
    with pytest.raises(HTTPException) as caught:
        export_route.export_word(sample_resume())
    assert caught.value.status_code == 500
    assert caught.value.detail == "Word export failed"
