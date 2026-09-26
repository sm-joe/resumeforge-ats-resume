# syntax=docker/dockerfile:1.7

# --- STAGE 1: Builder ---
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

# Copy uv binaries safely
COPY --from=ghcr.io/astral-sh/uv:0.12.19 /uv /uvx /usr/local/bin/

# Copy API metadata & source
COPY apps/api/pyproject.toml ./apps/api/pyproject.toml
COPY apps/api/README.md ./apps/api/README.md

# Copy local shared analyzer dependency
COPY apps/analyzer/pyproject.toml ./apps/analyzer/pyproject.toml

# FIX: Force uv to look directly at the api subproject target as a self-contained installation 
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync \
    --project /app/apps/api \
    --no-dev

# Application source after dependencies.
COPY apps/api/src ./apps/api/src
COPY apps/analyzer/src ./apps/analyzer/src

# Install Chromium for PDF generation
RUN --mount=type=cache,target=/root/.cache/uv \
     /app/apps/api/.venv/bin/python -m playwright install --with-deps chromium


# --- STAGE 2: Runner ---
FROM python:3.13-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/apps/api/src \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PATH="/app/apps/api/.venv/bin:$PATH"

# Set explicit working directory to the app root context
WORKDIR /app

# Runtime system libraries required by Chromium headless execution
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

# Create secure low-privilege runtime group/user setup first
RUN groupadd --system --gid 10001 resumeforge \
    && useradd --system --uid 10001 --gid resumeforge resumeforge \
    && chown -R resumeforge:resumeforge /app \
    && chown -R resumeforge:resumeforge /ms-playwright

# Copy the built virtual environment and playwright binaries with correct user ownership
COPY --from=builder --chown=resumeforge:resumeforge /app/apps/api/.venv /app/apps/api/.venv
COPY --from=builder --chown=resumeforge:resumeforge /ms-playwright /ms-playwright

# Copy source environments with matching workspace structures
COPY --from=builder --chown=resumeforge:resumeforge /app/apps/api/src /app/apps/api/src
COPY --from=builder --chown=resumeforge:resumeforge /app/apps/analyzer/src /app/apps/analyzer/src

USER resumeforge

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

# Execute from the app's internal src scope where python can resolve modules correctly
WORKDIR /app/apps/api/src
CMD ["uvicorn", "resumeforge_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
