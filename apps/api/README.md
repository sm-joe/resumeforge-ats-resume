# ResumeForge FastAPI Service

This service persists structured resumes, performs resume-quality analysis and job matching, and exports Microsoft Word files. API source: `src/resumeforge_api`.

## Local Development

Run from the repository root:

```bash
uv sync --project apps/api --locked
uv run --project apps/api uvicorn resumeforge_api.main:app --reload --port 8000
curl --fail http://127.0.0.1:8000/health
```

The OpenAPI explorer is available at `http://127.0.0.1:8000/docs`. Do not expose the raw API over the internet without TLS and appropriate access controls.

## API Routes

| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness check |
| `GET /api/v1/resumes/demo` | Immutable sample |
| `GET /api/v1/resumes` | List owned resumes |
| `POST /api/v1/resumes` | Create owned resume |
| `GET /api/v1/resumes/{id}` | Read owned resume |
| `PUT /api/v1/resumes/{id}` | Revision-checked update |
| `DELETE /api/v1/resumes/{id}` | Delete owned resume |
| `POST /api/v1/analyze` | Deterministic quality feedback |
| `POST /api/v1/match` | Job-description comparison |
| `POST /api/v1/export/word` | In-memory DOCX export |

Private CRUD requires an `X-Resume-Key` header containing a cryptographically random 64-character lowercase hexadecimal key. The API stores only its SHA-256 digest. The browser app generates the key and calls CRUD through Next.js's same-origin proxy. This is a **capability key**, not a user account.

Updates require the `metadata.revision` value last observed by that editor. The API returns `409 Conflict` for stale revisions and `428 Precondition Required` for missing revisions. No automatic merge is attempted.

SQLite defaults to a local data directory and can be redirected with `RESUMEFORGE_DATA_DIR`. Production examples use `/app/data`. Keep one API process/pod writing to the SQLite database; back it up using the [Operations Guide](../../docs/operations.md).

## Tests

```bash
uv run --project apps/api --with pytest pytest apps/api/tests
```
