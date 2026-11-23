# ResumeForge Web

The Next.js 16 / React / TypeScript interface for editing resumes, previewing professional templates, inspecting resume quality, matching job descriptions and exporting PDF/DOCX.

## Develop Locally

Start the FastAPI service first (instructions in [API README](../api/README.md)). Then run:

```bash
npm ci --prefix packages/resume-schema
npm run build --prefix packages/resume-schema
npm ci --prefix apps/web
npm run dev --prefix apps/web
```

Open `http://localhost:3000`. For self-hosted containers set `RESUMEFORGE_API_URL=http://api:8000`; local development defaults to `http://localhost:8000`.

## Key Routes

- `/`: editor, live preview, four resume layouts, quality/matching panels and PDF/DOCX export.
- `/resumes`: create, open, rename, duplicate, delete, JSON backup and import.
- `/api/resumes/*`: same-origin, bounded CRUD proxy that forwards the browser's capability key to FastAPI.
- `/api/analyze`, `/api/match`, `/api/export/word`: Next.js proxy endpoints.

Browser localStorage holds the active draft and version snapshots. A random ownership key is stored separately; keep browser storage private and back up resumes before clearing it. Each tab tracks optimistic update revisions; stale edits are rejected and shown as a save conflict.

## Checks

```bash
npm run build --prefix apps/web
npm run typecheck --prefix apps/web
npm run lint --prefix apps/web
```

Playwright acceptance tests run against a full Compose deployment in the **manual release validation workflow**. See [Operations Guide](../../docs/operations.md) and root [README](../../README.md).
