# syntax=docker/dockerfile:1.7

# --- STAGE 1: Builder ---
FROM python:3.13-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/apps/api/src

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy uv binaries
COPY --from=ghcr.io/astral-sh/uv:0.12.19 /uv /uvx /usr/local/bin/

# Copy API metadata
COPY apps/api/pyproject.toml ./apps/api/pyproject.toml
COPY apps/api/README.md ./apps/api/README.md

# Copy local shared analyzer dependency
COPY apps/analyzer/pyproject.toml ./apps/analyzer/pyproject.toml
COPY apps/analyzer/src ./apps/analyzer/src

# Install API dependencies without installing the API project itself.
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync \
    --directory /app/apps/api \
    --no-dev \
    --no-install-project

# Install the local analyzer package into the API virtual environment.
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install \
        --python /app/apps/api/.venv/bin/python \
        /app/apps/analyzer

RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install \
        --python /app/apps/api/.venv/bin/python \
        "msgpack>=1.2.1" \
        "setuptools>=78.1.1"

# Copy application source after dependencies for better layer caching.
COPY apps/api/src ./apps/api/src


# --- STAGE 2: Runner ---
FROM python:3.13-slim-bookworm AS runner

RUN rm -rf /usr/local/lib/python3.13/site-packages/pip

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/apps/api/src \
    PATH="/app/apps/api/.venv/bin:$PATH"

WORKDIR /app

# Create a dedicated non-root runtime user.
RUN groupadd --system --gid 10001 resumeforge \
    && useradd --system --uid 10001 --gid resumeforge resumeforge

RUN mkdir -p /app/data \
    && chown resumeforge:resumeforge /app/data

# Copy the API virtual environment.
COPY --from=builder --chown=resumeforge:resumeforge \
    /app/apps/api/.venv \
    /app/apps/api/.venv

# Copy API source.
COPY --from=builder --chown=resumeforge:resumeforge \
    /app/apps/api/src \
    /app/apps/api/src

# Copy analyzer source.
COPY --from=builder --chown=resumeforge:resumeforge \
    /app/apps/analyzer/src \
    /app/apps/analyzer/src

USER resumeforge

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

CMD ["uvicorn", "resumeforge_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
