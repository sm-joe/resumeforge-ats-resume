# ResumeForge

ResumeForge is a portable, ATS-friendly resume builder focused on structured resume data, a practical editing experience, automated analysis, and self-hosted deployment.

The project is designed as a modular monorepo so the editor, API, resume schema, analyzer, export workflows, and deployment configuration can evolve independently.

## Overview

| Area | ResumeForge |
|---|---|
| Purpose | Build, edit, analyze, persist, and export structured resumes |
| Frontend | Next.js + React + TypeScript |
| Backend | FastAPI + Python |
| Data model | Shared TypeScript resume schema |
| Persistence | SQLite + SQLAlchemy |
| Analysis | ATS-oriented resume analyzer |
| Matching | Resume-to-job matching |
| Export | Microsoft Word |
| Containers | Docker |
| Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Container registry | GitHub Container Registry |
| Security | Gitleaks, Semgrep, npm audit, pip-audit, Trivy |
| License | Apache License 2.0 |

## Features

| Category | Features |
|---|---|
| Resume Editor | Structured sections, rich text editing, inline editing, live preview |
| Resume Content | Profile, summary, experience, projects, education, skills, certifications, languages, custom sections |
| Templates | Modern resume presentation with reusable resume data |
| Persistence | Browser drafts, local version history, API-backed persistence |
| Resume API | Create, read, update, list, and delete resumes |
| ATS | Resume analysis and scoring-oriented feedback |
| Matching | Compare resume information with job requirements |
| Export | Microsoft Word document export |
| Deployment | Docker, Docker Compose, production Compose configuration |
| Security | Secret scanning, SAST, dependency auditing, container vulnerability scanning |
| Development | Feature branches, pull requests, protected `main`, automated CI |

## Architecture

```text
                         ResumeForge
                              │
              ┌───────────────┴───────────────┐
              │                               │
        Next.js Web                       FastAPI API
              │                               │
      ┌───────┴────────┐             ┌────────┴─────────┐
      │                │             │                  │
   Editor           Preview       Resume API         Analyzer
      │                │             │                  │
      └───────┬────────┘             │             ATS Analysis
              │                      │
        EditorProvider           SQLAlchemy
              │                      │
        localStorage              SQLite
              │
              └────────── HTTP API ──────────┘
```

### Application layers

| Layer | Responsibility |
|---|---|
| `apps/web` | Resume editor, preview, browser state, export actions |
| `apps/api` | HTTP API, persistence, analysis, matching, export |
| `apps/analyzer` | ATS-oriented analysis and scoring logic |
| `packages/resume-schema` | Shared resume data model and types |
| `deploy` | Docker Compose and deployment configuration |
| `tests` | Automated test coverage |

## Tech Stack

| Category | Technology |
|---|---|
| Frontend Framework | Next.js |
| UI | React |
| Frontend Language | TypeScript |
| Backend Framework | FastAPI |
| Backend Language | Python 3.13 |
| API Server | Uvicorn |
| Database | SQLite |
| ORM | SQLAlchemy |
| JavaScript Package Manager | npm |
| Python Package Manager | uv |
| Resume Schema | TypeScript shared package |
| Word Export | python-docx |
| Containerization | Docker |
| Local / Production Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry |
| Secret Scanning | Gitleaks |
| Static Analysis | Semgrep |
| JavaScript Dependency Audit | npm audit |
| Python Dependency Audit | pip-audit |
| Container Scanning | Trivy |
| Repository Automation | Dependabot |

## Repository Structure

| Path | Purpose |
|---|---|
| `apps/web` | Next.js resume editor and web application |
| `apps/api` | FastAPI backend and persistence layer |
| `apps/analyzer` | Resume analysis and scoring |
| `packages/resume-schema` | Shared resume schema |
| `deploy/compose` | Local Docker Compose configuration |
| `deploy/docker-compose.prod.yml` | Production Compose configuration |
| `tests` | Automated tests |
| `.github/workflows` | CI, security, and container workflows |
| `.github/ISSUE_TEMPLATE` | GitHub issue templates |
| `.github/CODEOWNERS` | Code ownership rules |
| `.github/dependabot.yml` | Dependency update configuration |
| `README.md` | Project documentation |
| `CONTRIBUTING.md` | Contribution workflow |
| `SECURITY.md` | Security reporting policy |
| `CODE_OF_CONDUCT.md` | Community standards |
| `LICENSE` | Apache License 2.0 |

## Quick Start

### Prerequisites

| Tool | Version / Requirement |
|---|---|
| Node.js | 22+ |
| npm | Compatible with Node.js 22 |
| Python | 3.13+ |
| uv | Current supported version |
| Docker | Current supported version |
| Docker Compose | Current supported version |
| Git | Current supported version |

### Run with Docker Compose

```bash
git clone <repository-url>
cd resumeforge

docker compose -f deploy/compose/compose.yaml up --build
```

Then open:

```text
http://localhost:3000
```

API:

```text
http://localhost:8000
```

API health:

```text
http://localhost:8000/health
```

API documentation:

```text
http://localhost:8000/docs
```

## Local Development

### Web

```bash
cd apps/web
npm install
npm run dev
```

### Shared Resume Schema

```bash
cd packages/resume-schema
npm install
npm run build
```

### API

From the repository root:

```bash
uv sync --directory apps/api
uv run --directory apps/api uvicorn resumeforge_api.main:app --reload --port 8000
```

## Resume Persistence

ResumeForge uses two persistence layers.

| Layer | Purpose |
|---|---|
| Browser `localStorage` | Draft recovery and local version history |
| FastAPI + SQLite | Persistent server-side resume storage |

Editor changes are autosaved to the API after a short debounce period.

```text
Editor
  ↓
EditorProvider
  ↓
Autosave
  ↓
PUT /api/v1/resumes/{resume_id}
  ↓
SQLAlchemy
  ↓
SQLite
```

The API data directory can be configured with:

```text
RESUMEFORGE_DATA_DIR
```

For container deployments, the recommended value is:

```text
/app/data
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check |
| `GET` | `/api/v1/resumes` | List resumes |
| `POST` | `/api/v1/resumes` | Create a resume |
| `GET` | `/api/v1/resumes/demo` | Retrieve the demo resume |
| `GET` | `/api/v1/resumes/{resume_id}` | Retrieve a resume |
| `PUT` | `/api/v1/resumes/{resume_id}` | Update a resume |
| `DELETE` | `/api/v1/resumes/{resume_id}` | Delete a resume |
| `POST` | `/api/v1/analyze` | Analyze resume content |
| `POST` | `/api/v1/match` | Match resume information against job requirements |
| `POST` | `/api/v1/export/word` | Export resume as Microsoft Word |

FastAPI interactive documentation is available at:

```text
http://localhost:8000/docs
```

## ATS Analysis

ResumeForge includes an analyzer designed around structured resume information.

| Capability | Purpose |
|---|---|
| Resume analysis | Evaluate resume structure and content |
| ATS-oriented scoring | Provide scoring-oriented feedback |
| Content checks | Identify areas that may need improvement |
| Structured input | Analyze the same resume model used by the editor |

The analyzer is implemented separately from the web application so the scoring logic can evolve independently.

## Resume Matching

The matching workflow compares structured resume information with job-related requirements.

```text
Resume
  +
Job Requirements
  ↓
Matching Engine
  ↓
Match Results
```

This is intended to help users identify alignment between their resume and a target role.

## Word Export

ResumeForge supports Microsoft Word export through the API.

| Format | Support |
|---|---|
| `.docx` | Supported |
| PDF | Application export workflow can be extended independently |

The export layer operates from the structured resume model rather than editor-specific UI state.

## Docker

ResumeForge provides separate container builds for the API and web application.

| Image | Dockerfile |
|---|---|
| API | `apps/api/Dockerfile` |
| Web | `apps/web/Dockerfile` |

Build locally:

```bash
docker build   -f apps/api/Dockerfile   -t resumeforge-api:local   .
```

```bash
docker build   -f apps/web/Dockerfile   -t resumeforge-web:local   .
```

The application containers use multi-stage builds and non-root runtime users.

## Docker Compose

| Configuration | Location | Purpose |
|---|---|---|
| Local | `deploy/compose/compose.yaml` | Local development and testing |
| Production | `deploy/docker-compose.prod.yml` | Production-style deployment |

Start locally:

```bash
docker compose -f deploy/compose/compose.yaml up --build
```

Stop:

```bash
docker compose -f deploy/compose/compose.yaml down
```

Persistent API data is stored under:

```text
/app/data
```

and mounted outside the API container.

## CI/CD

ResumeForge uses a sequential GitHub Actions pipeline.

| Stage | Check | Purpose |
|---|---|---|
| 1 | `CI Run` | Build applications and run tests |
| 2 | `Security Scan` | Secret, code, and dependency security checks |
| 3 | `Docker Build` | Build and scan container images |
| 4 | GHCR Push | Publish images from `main` |

Pipeline flow:

```text
CI Run
   ↓
Security Scan
   ↓
Docker Build
   ↓
GHCR
```

### CI checks

| Tool | Purpose |
|---|---|
| Gitleaks | Secret detection |
| Semgrep | Static analysis |
| npm audit | JavaScript dependency vulnerabilities |
| pip-audit | Python dependency vulnerabilities |
| Trivy | Container vulnerabilities |

Container scanning checks `HIGH` and `CRITICAL` vulnerabilities while ignoring unfixed findings.

## Container Registry

Successful builds from `main` publish:

```text
ghcr.io/<owner>/resumeforge-api:<git-sha>
ghcr.io/<owner>/resumeforge-api:latest

ghcr.io/<owner>/resumeforge-web:<git-sha>
ghcr.io/<owner>/resumeforge-web:latest
```

The Git commit SHA provides an immutable image reference while `latest` provides a convenient current tag.

## Security

| Control | Implementation |
|---|---|
| Secret scanning | Gitleaks |
| Static analysis | Semgrep |
| Node dependency audit | npm audit |
| Python dependency audit | pip-audit |
| Container scanning | Trivy |
| Runtime user | Non-root |
| Container health | Docker health checks |
| Dependency updates | Dependabot |
| Secret protection | GitHub secret scanning / push protection |
| Branch protection | Protected `main` branch |
| Change control | Pull requests |

For vulnerability reporting, see [`SECURITY.md`](SECURITY.md).

## GitHub Repository Controls

The repository is configured around a pull-request based workflow.

| Control | Configuration |
|---|---|
| Default branch | `main` |
| Direct pushes to `main` | Blocked |
| Force pushes | Blocked |
| Branch deletion | Restricted |
| Pull request | Required |
| Required CI checks | `CI Run`, `Security Scan`, `Docker Build` |
| Conversation resolution | Required |
| Dependency updates | Dependabot |
| Ownership | CODEOWNERS |
| Issue intake | GitHub issue templates |
| PR guidance | Pull request template |

## Development Workflow

```text
Feature Branch
      ↓
Local Development
      ↓
Local Validation
      ↓
Pull Request
      ↓
CI Run
      ↓
Security Scan
      ↓
Docker Build
      ↓
Review
      ↓
Merge to main
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

## Configuration

### Web API URL

The web application accepts:

```text
RESUMEFORGE_API_URL
```

Default:

```text
http://localhost:8000
```

### API data directory

The API accepts:

```text
RESUMEFORGE_DATA_DIR
```

Container default:

```text
/app/data
```

Keep secrets and environment-specific configuration outside source control.

## Roadmap

| Area | Direction |
|---|---|
| Templates | Additional professional resume templates |
| ATS | More detailed analysis and recommendations |
| Matching | More comprehensive job/resume comparison |
| Accounts | Optional authentication and user ownership |
| Collaboration | Additional resume management workflows |
| Export | Additional document and presentation formats |
| Testing | Expanded unit, integration, and end-to-end coverage |
| Deployment | Additional self-hosting and cloud deployment options |

## Contributing

Contributions are welcome.

Before opening a pull request:

| Check | Expected |
|---|---|
| Scope | Focused change |
| Tests | Relevant tests pass |
| Security | No secrets or credentials |
| Documentation | Updated when applicable |
| CI | Expected to pass |
| Review | Pull request opened against `main` |

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the complete workflow.

## Project Files

| File | Purpose |
|---|---|
| [`LICENSE`](LICENSE) | Apache License 2.0 |
| [`SECURITY.md`](SECURITY.md) | Vulnerability reporting and security policy |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Community standards |

## License

ResumeForge is licensed under the Apache License 2.0.

See [`LICENSE`](LICENSE) for the full license text.

---

ResumeForge — structured resume creation with ATS analysis, persistence, export, and self-hosted deployment.
