"""Safe, in-memory Microsoft Word export endpoints."""

import logging
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ..export.docx import resume_to_docx
from ..models import Resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/export", tags=["export"])

DOCX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)


def _safe_filename(title: str) -> str:
    """Prevent path separators and response header injection in filenames."""
    safe = re.sub(r"[^a-zA-Z0-9 _.-]", "-", title).strip(" .-")
    return (safe[:120].strip(" .-") or "resumeforge-resume") + ".docx"


@router.post("/word")
def export_word(resume: Resume) -> Response:
    try:
        # resume_to_docx() returns a BytesIO when no output path is given.
        # No sensitive resume files are written to the server's temp folder.
        output = resume_to_docx(resume)
        content = output.getvalue()
    except Exception as error:
        logger.exception("Word export failed")
        # Internal exceptions and paths must not be exposed to API clients.
        raise HTTPException(status_code=500, detail="Word export failed") from error

    return Response(
        content=content,
        media_type=DOCX_MEDIA_TYPE,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{_safe_filename(resume.metadata.title)}"'
            ),
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )
