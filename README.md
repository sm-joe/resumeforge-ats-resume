ResumeForge
ResumeForge is a portable resume builder for creating structured, ATS-friendly resumes with a live editor, analysis, export, and containerized deployment.
The project uses a structured resume data model so the same data can power editing, preview, analysis, persistence, and export.
At a glance
Area	Details
Frontend	Next.js, React, TypeScript
Backend	FastAPI, Python
Data	SQLite, SQLAlchemy
Package management	npm, uv
Export	Microsoft Word
Containers	Docker, Docker Compose
CI/CD	GitHub Actions
Registry	GitHub Container Registry
Security	Gitleaks, Semgrep, npm audit, pip-audit, Trivy
Features
Structured resume editor with live preview
Modern resume templates
Rich-text editing
Resume sections for profile, summary, experience, projects, education, skills, certifications, languages, and custom content
Browser draft persistence with `localStorage`
Local resume version history
API-backed resume persistence
SQLite storage
Resume CRUD API
Demo resume initialization
ATS-oriented resume analysis
Resume/job matching
Microsoft Word export
Dockerized frontend and backend
Docker Compose deployment
Kubernetes deployment support
GitHub Actions CI/CD
Automated secret, code, dependency, and container scanning
GitHub Container Registry publishing
Architecture
```text
                              ResumeForge
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              Next.js Web                    FastAPI API
                    │                             │
          ┌─────────┴─────────┐          ┌────────┴─────────┐
          │                   │          │                  │
      Editor State         Preview    Resume API         Analyzer
          │                   │          │                  │
          └─────────┬─────────┘          │                  │
                    │                    │              Resume Analysis
               localStorage             │
                    │                SQLAlchemy
                    │                    │
                    │                 SQLite
                    │
                    └────── HTTP API ───┘
```
Web application
The web application provides the editing experience, live preview, editor state management, browser-side draft persistence, version history, and export workflows.
API
The backend uses FastAPI and provides resume persistence together with analysis, matching, and document export endpoints.
Analyzer
The analyzer package provides ATS-oriented resume analysis and scoring capabilities and is integrated with the backend.
Storage
Resume records are persisted through SQLAlchemy using SQLite.
The editor also maintains browser-side draft and version history using `localStorage`.
Repository structure
```text
.
├── apps/
│   ├── analyzer/                  # Resume analysis and scoring
│   ├── api/                       # FastAPI backend
│   │   ├── src/
│   │   │   └── resumeforge_api/
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   └── web/                       # Next.js frontend
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── resume-schema/             # Shared resume schema
│
├── deploy/
│   ├── compose/                   # Local Docker Compose
│   └── docker-compose.prod.yml    # Production Compose
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── workflows/
│
├── tests/
│
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── SECURITY.md
```
Technology stack
Component	Technology
Web	Next.js, React, TypeScript
API	FastAPI, Python
Resume schema	TypeScript / Pydantic
Database	SQLite
ORM	SQLAlchemy
JavaScript packages	npm
Python packages	uv
Word export	python-docx
Containers	Docker
Local orchestration	Docker Compose
CI/CD	GitHub Actions
Container registry	GitHub Container Registry
Secret scanning	Gitleaks
Static analysis	Semgrep
JavaScript audit	npm audit
Python audit	pip-audit
Container scanning	Trivy
Getting started
Prerequisites
Install:
Node.js 22+
npm
Python 3.13+
uv
Docker
Docker Compose
Git
Verify the tools:
```bash
node --version
npm --version
python --version
uv --version
docker --version
docker compose version
```
Clone the repository
```bash
git clone <repository-url>
cd resumeforge
```
Replace `<repository-url>` with the URL of your ResumeForge repository.
Local development
Web dependencies
```bash
cd apps/web
npm install
```
Build the shared resume schema when required:
```bash
cd ../../packages/resume-schema
npm install
npm run build
```
API dependencies
From the repository root:
```bash
uv sync --directory apps/api
```
The API uses the analyzer package as a local project dependency.
Run the API
From the repository root:
```bash
uv run --directory apps/api uvicorn resumeforge_api.main:app --reload --port 8000
```
The API is available at:
```text
http://localhost:8000
```
Health check
```text
http://localhost:8000/health
```
Expected response:
```json
{
  "status": "ok"
}
```
API documentation
FastAPI provides interactive documentation at:
```text
http://localhost:8000/docs
```
OpenAPI JSON:
```text
http://localhost:8000/openapi.json
```
Run the web application
From `apps/web`:
```bash
npm run dev
```
The web application is available at:
```text
http://localhost:3000
```
The web application communicates with the FastAPI backend through `RESUMEFORGE_API_URL`.
Environment configuration
Web API URL
Set:
```text
RESUMEFORGE_API_URL=http://localhost:8000
```
When the variable is not provided, the application falls back to:
```text
http://localhost:8000
```
API data directory
Set:
```text
RESUMEFORGE_DATA_DIR=/app/data
```
This controls where the SQLite database is stored.
For containerized deployments, `/app/data` is mounted separately so database data can survive application-container replacement.
Resume persistence
ResumeForge uses browser persistence and API persistence together.
Browser drafts
The editor automatically stores the current draft in browser `localStorage`.
This allows the current work to survive a browser refresh.
Version history
The editor maintains local resume snapshots in browser storage.
The current implementation keeps up to 50 versions. Duplicate snapshots are not stored as separate versions.
Each version contains:
Resume data
Version identifier
Save timestamp
API persistence
Resume changes are also persisted through the FastAPI backend.
The editor autosaves changes after a 600 ms debounce:
```text
Editor
  │
  ▼
EditorProvider
  │
  ▼
600 ms autosave debounce
  │
  ▼
FastAPI
  │
  ▼
SQLAlchemy
  │
  ▼
SQLite
```
The update request is:
```http
PUT /api/v1/resumes/{resume_id}
```
Resume API
Method	Endpoint	Purpose
`GET`	`/api/v1/resumes`	List persisted resumes
`POST`	`/api/v1/resumes`	Create a resume
`GET`	`/api/v1/resumes/{resume_id}`	Get a resume
`PUT`	`/api/v1/resumes/{resume_id}`	Update a resume
`DELETE`	`/api/v1/resumes/{resume_id}`	Delete a resume
`GET`	`/api/v1/resumes/demo`	Get the demo resume
A fresh database automatically seeds the demo resume when the API starts.
Existing demo data is not overwritten during startup.
ATS analysis
ResumeForge includes an analyzer package for ATS-oriented resume analysis.
The analyzer evaluates resume structure and content and provides scoring-oriented feedback. Analysis functionality is integrated with the API.
Resume matching
ResumeForge provides resume/job matching through the API.
The matching endpoint is:
```text
/api/v1/match
```
It is designed to compare resume information against job-related requirements.
Word export
ResumeForge supports Microsoft Word resume export through the API.
Endpoint:
```text
/api/v1/export/word
```
The export workflow is integrated with the editor.
Docker
Separate Dockerfiles are provided for the API and web application.
Build the API image
From the repository root:
```bash
docker build   -f apps/api/Dockerfile   -t resumeforge-api:local   .
```
Build the web image
```bash
docker build   -f apps/web/Dockerfile   -t resumeforge-web:local   .
```
Both images use multi-stage builds and run their runtime processes as non-root users.
Docker Compose
The local Compose configuration runs the API and web services together.
Start the stack:
```bash
docker compose -f deploy/compose/compose.yaml up --build
```
Run in the background:
```bash
docker compose -f deploy/compose/compose.yaml up --build -d
```
Stop the stack:
```bash
docker compose -f deploy/compose/compose.yaml down
```
Local endpoints:
```text
Web: http://localhost:3000
API: http://localhost:8000
```
Persistent data
The API stores SQLite data under:
```text
/app/data
```
The Compose configuration mounts persistent host storage to this location and sets:
```yaml
RESUMEFORGE_DATA_DIR: /app/data
```
This keeps the database independent of the API container lifecycle.
Production deployment
The production Compose configuration is:
```text
deploy/docker-compose.prod.yml
```
It uses images published to GitHub Container Registry:
```text
ghcr.io/<owner>/resumeforge-api:<tag>
ghcr.io/<owner>/resumeforge-web:<tag>
```
The web application communicates with the API over the Docker Compose service network.
The API data directory remains mounted at:
```text
/app/data
```
CI/CD
ResumeForge uses GitHub Actions for continuous integration, security validation, container scanning, and image publishing.
The pipeline is intentionally sequential:
```text
CI Run
   │
   ▼
Security Scan
   │
   ▼
Docker Build
```
CI Run
The CI stage:
Installs JavaScript dependencies
Builds the shared resume schema
Builds the Next.js application
Installs Python dependencies
Installs the analyzer package
Runs the project tests
Security Scan
The security stage runs:
Gitleaks for secret scanning
Semgrep for static analysis
`npm audit` for JavaScript dependencies
`pip-audit` for Python dependencies
Docker Build
The Docker stage:
Builds the API image
Builds the web image
Loads both images for scanning
Scans both images with Trivy
Logs in to GHCR on `main`
Publishes API and web images to GHCR
Container scanning fails the pipeline for unfixed `HIGH` or `CRITICAL` vulnerabilities.
Container security
The application containers follow several hardening practices:
Multi-stage builds
Non-root runtime users
Production dependency installation
Minimal runtime environments
Container health checks
Separate persistent application data
Automated vulnerability scanning in CI
Health checks
API
```http
GET /health
```
Web
The web container performs an HTTP health check against the Next.js application.
Docker Compose uses API health status so the web service can start after the API becomes healthy.
Development workflow
Development should use feature branches and pull requests.
Example:
```text
main
 ├── feature/editor-improvement
 ├── feature/ats-analysis
 └── fix/api-persistence
```
Before opening a pull request:
Build the affected application.
Run the relevant tests.
Validate API changes.
Validate frontend changes.
Validate Docker changes when applicable.
Review the final diff.
Open the pull request against `main`.
Direct changes to `main` are protected by the repository's GitHub ruleset.
Testing
For API changes, verify the relevant endpoints:
```text
/health
/api/v1/resumes
/api/v1/analyze
/api/v1/match
/api/v1/export/word
```
For editor changes, verify:
Resume editing
Section editing
Live preview
Autosave
Draft restoration
Version history
Export
For Docker changes, verify:
API image build
Web image build
Container startup
Health checks
Persistent data storage
Project goals
ResumeForge is built around a few core principles:
Structured resume data
Portable deployment
Reusable architecture
ATS-oriented analysis
Local-first editing
API-backed persistence
Containerized deployment
Automated CI/CD
Automated security validation
Extensible templates
Roadmap
Planned areas include:
Additional resume templates
Expanded ATS analysis
Improved resume/job matching
Enhanced resume version management
Additional export formats
Authentication and user accounts
Multi-user resume ownership
Expanded automated testing
Additional deployment options
Contributing
Contributions are welcome.
Please read `CONTRIBUTING.md` before submitting changes.
The standard workflow is:
```text
Feature branch
      │
      ▼
Local validation
      │
      ▼
Pull request
      │
      ▼
CI Run
      │
      ▼
Security Scan
      │
      ▼
Docker Build
      │
      ▼
Merge
```
For security vulnerabilities, follow `SECURITY.md`.
For community expectations, see `CODE_OF_CONDUCT.md`.
Security
ResumeForge includes automated security checks for:
Secrets
Source-code issues
JavaScript dependencies
Python dependencies
Container vulnerabilities
The project also uses:
Non-root runtime containers
Docker health checks
Protected `main` branch
Pull-request based changes
Dependabot configuration
GitHub secret scanning and push protection
For vulnerability reporting, see `SECURITY.md`.
License
ResumeForge is licensed under the Apache License 2.0.
See `LICENSE` for the complete license text.
Acknowledgements
ResumeForge is built with open-source technologies and libraries from the JavaScript, Python, FastAPI, React, Next.js, Docker, and cloud-native ecosystems.
---
ResumeForge — structured, portable, ATS-friendly resume creation.