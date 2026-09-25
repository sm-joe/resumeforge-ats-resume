from io import BytesIO
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..export.docx import resume_to_docx
from ..export.pdf import html_to_pdf
from ..export.render_html import resume_to_html
from ..models import Resume


router = APIRouter(
    prefix="/api/v1/export",
    tags=["export"],
)


def _safe_filename(title: str) -> str:
    filename = title.strip() or "resumeforge-resume"

    return (
        filename
        .replace("/", "-")
        .replace("\\", "-")
        .replace('"', "")
        .strip()
    )


@router.post("/word")
def export_word(resume: Resume):
    try:
        with NamedTemporaryFile(
            suffix=".docx",
            delete=False,
        ) as temporary_file:
            output_path = temporary_file.name

        resume_to_docx(
            resume,
            output_path,
        )

        with open(output_path, "rb") as file:
            content = file.read()

        filename = f"{_safe_filename(resume.metadata.title)}.docx"

        return StreamingResponse(
            BytesIO(content),
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Word export failed: {error}",
        ) from error


@router.post("/pdf")
async def export_pdf(resume: Resume):
    try:
        html = resume_to_html(resume)

        with NamedTemporaryFile(
            suffix=".pdf",
            delete=False,
        ) as temporary_file:
            output_path = temporary_file.name

        await html_to_pdf(
            html,
            output_path,
        )

        with open(output_path, "rb") as file:
            content = file.read()

        filename = f"{_safe_filename(resume.metadata.title)}.pdf"

        return StreamingResponse(
            BytesIO(content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"PDF export failed: {error}",
        ) from error