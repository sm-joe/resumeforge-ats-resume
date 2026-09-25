FROM python:3.13-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/apps/api/src \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.12.19 /uv /uvx /usr/local/bin/

# API project metadata
COPY apps/api/pyproject.toml ./apps/api/pyproject.toml
COPY apps/api/README.md ./apps/api/README.md

# API source
COPY apps/api/src ./apps/api/src

# Local analyzer dependency
COPY apps/analyzer/pyproject.toml ./apps/analyzer/pyproject.toml
COPY apps/analyzer/src ./apps/analyzer/src

# Build the API environment
RUN uv sync \
    --directory /app/apps/api \
    --no-dev

# Install Chromium for PDF generation
RUN /app/apps/api/.venv/bin/python -m playwright install --with-deps chromium


FROM python:3.13-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/apps/api/src \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PATH=/app/apps/api/.venv/bin:$PATH

WORKDIR /app

# Runtime libraries required by Chromium
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libnss3 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        libcups2 \
        libatspi2.0-0 \
        libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/apps/api/.venv /app/apps/api/.venv
COPY --from=builder /ms-playwright /ms-playwright

COPY apps/api/src ./apps/api/src
COPY apps/analyzer/src ./apps/analyzer/src

RUN groupadd --system --gid 10001 resumeforge \
    && useradd --system --uid 10001 --gid resumeforge resumeforge \
    && chown -R resumeforge:resumeforge /app \
    && chown -R resumeforge:resumeforge /ms-playwright

USER resumeforge

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

CMD ["uvicorn", "resumeforge_api.main:app", "--host", "0.0.0.0", "--port", "8000"]