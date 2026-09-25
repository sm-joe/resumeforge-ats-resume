import os
from io import BytesIO
from tempfile import NamedTemporaryFile
import anyio
from fastapi import APIRouter
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
    output_buffer = resume_to_docx(resume)

    filename = (
        f"{_safe_filename(resume.metadata.title)}.docx"
    )

    # Convert the BytesIO buffer to a safe iterator chunk loop for StreamingResponse
    def stream_docx_chunks():
        while chunk := output_buffer.read(8192):
            yield chunk

    return StreamingResponse(
        stream_docx_chunks(),
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


@router.post("/pdf")
async def export_pdf(resume: Resume):
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

    filename = (
        f"{_safe_filename(resume.metadata.title)}.pdf"
    )

    # Streams file asynchronously and deletes it cleanly right after the stream finishes
    async def stream_pdf_chunks():
        async with await anyio.open_file(output_path, mode="rb") as f:
            while chunk := await f.read(8192):
                yield chunk
        try:
            os.unlink(output_path)
        except OSError:
            pass

    return StreamingResponse(
        stream_pdf_chunks(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )
