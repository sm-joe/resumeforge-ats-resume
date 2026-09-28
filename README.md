ResumeForge
ResumeForge is a modern, portable resume builder for creating structured, ATS-friendly resumes with a live editor, resume analysis, document export, and containerized deployment.
The project is designed around a structured resume data model rather than a document-first editing workflow, allowing the same resume data to power editing, preview, analysis, persistence, and export.
---
Features
Structured resume editor
Live resume preview
Modern resume templates
ATS-oriented resume analysis
Rich-text editing
Structured resume sections:
Profile
Summary
Experience
Projects
Education
Skills
Certifications
Languages
Custom sections
Automatic browser draft persistence
Local resume version history
API-backed resume persistence
SQLite database storage
Resume CRUD API
Demo resume initialization
Microsoft Word export
Dockerized frontend and backend
Docker Compose deployment
Kubernetes deployment support
GitHub Actions CI/CD
Static code and secret scanning
Dependency vulnerability scanning
Container vulnerability scanning
GitHub Container Registry image publishing
---
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
                    │                    │                  │
               localStorage             │              Resume Analysis
                    │                    │
                    │                SQLAlchemy
                    │                    │
                    │                 SQLite
                    │
                    └────── HTTP API ───┘
```
Web application
The web application provides the resume editing experience, live preview, editor state management, browser-side draft persistence, version history, and export workflows.
API
The backend is implemented with FastAPI and provides resume persistence together with analysis, matching, and document export endpoints.
Analyzer
The analyzer package provides ATS-oriented resume analysis and scoring capabilities and is integrated with the backend.
Storage
Resume records are persisted through SQLAlchemy using SQLite.
The editor also maintains browser-side draft and version history using `localStorage`.
---
Technology Stack
Area	Technology
Frontend	Next.js, React, TypeScript
Backend	FastAPI, Python
Resume schema	TypeScript / Pydantic
Database	SQLite
ORM	SQLAlchemy
JavaScript package management	npm
Python package management	uv
Document export	python-docx
Containerization	Docker
Local orchestration	Docker Compose
CI/CD	GitHub Actions
Container registry	GitHub Container Registry
Secret scanning	Gitleaks
Static analysis	Semgrep
JavaScript dependency auditing	npm audit
Python dependency auditing	pip-audit
Container scanning	Trivy
---
Repository Structure
```text
.
├── apps/
│   ├── analyzer/                  # Resume analysis and scoring
│   ├── api/                       # FastAPI backend
│   │   ├── src/
│   │   │   └── resumeforge_api/
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   │
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
│   └── workflows/                 # CI/CD workflows
│
├── tests/                         # Project tests
│
├── LICENSE
└── README.md
```
---
Getting Started
Prerequisites
Install the following:
Node.js 22+
npm
Python 3.13+
uv
Docker
Docker Compose
Git
Verify the installations:
```bash
node --version
npm --version
python --version
uv --version
docker --version
docker compose version
```
---
Clone the Repository
```bash
git clone <repository-url>
cd resumeforge
```
Replace `<repository-url>` with the URL of your ResumeForge GitHub repository.
---
Local Development
Install Web Dependencies
Install the web application dependencies:
```bash
cd apps/web
npm install
```
Build the shared resume schema if required by the local development workflow:
```bash
cd ../../packages/resume-schema
npm install
npm run build
```
---
Install API Dependencies
From the repository root:
```bash
uv sync --directory apps/api
```
The API uses the analyzer package as a local project dependency.
---
Running the API
From the repository root:
```bash
uv run --directory apps/api uvicorn resumeforge_api.main:app --reload --port 8000
```
The API will be available at:
```text
http://localhost:8000
```
Health Check
```text
http://localhost:8000/health
```
Expected response:
```json
{
  "status": "ok"
}
```
API Documentation
FastAPI provides interactive API documentation at:
```text
http://localhost:8000/docs
```
OpenAPI JSON is available at:
```text
http://localhost:8000/openapi.json
```
---
Running the Web Application
From `apps/web`:
```bash
npm run dev
```
The web application will be available at:
```text
http://localhost:3000
```
The web application communicates with the FastAPI backend through the `RESUMEFORGE_API_URL` environment variable.
---
Environment Configuration
Web API URL
The web application supports:
```text
RESUMEFORGE_API_URL
```
Example:
```text
RESUMEFORGE_API_URL=http://localhost:8000
```
When the variable is not provided, the application falls back to:
```text
http://localhost:8000
```
---
API Data Directory
The API supports:
```text
RESUMEFORGE_DATA_DIR
```
Example:
```text
RESUMEFORGE_DATA_DIR=/app/data
```
The variable controls where the SQLite database is stored.
For containerized deployments, the API uses:
```text
/app/data
```
This allows database storage to be mounted separately from the application container filesystem.
---
Resume Persistence
ResumeForge uses two persistence layers.
Browser Draft Persistence
The editor automatically stores the current resume draft in browser `localStorage`.
This allows the user's current work to survive browser refreshes.
Local Version History
ResumeForge maintains local resume snapshots in browser storage.
The editor currently maintains up to 50 resume versions.
Each version contains:
Resume data
Version identifier
Save timestamp
Duplicate resume snapshots are not stored as separate versions.
API Persistence
Resume changes are also persisted through the FastAPI backend.
The editor automatically sends updated resume data to:
```text
PUT /api/v1/resumes/{resume_id}
```
The backend stores the resume in SQLite through SQLAlchemy.
The resulting persistence flow is:
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
---
Resume API
The resume API provides CRUD operations.
List Resumes
```http
GET /api/v1/resumes
```
Returns all persisted resumes ordered by most recently updated.
Create Resume
```http
POST /api/v1/resumes
```
Creates a new persisted resume.
Get Resume
```http
GET /api/v1/resumes/{resume_id}
```
Returns a specific persisted resume.
Update Resume
```http
PUT /api/v1/resumes/{resume_id}
```
Updates an existing resume.
Delete Resume
```http
DELETE /api/v1/resumes/{resume_id}
```
Deletes a persisted resume.
Demo Resume
```http
GET /api/v1/resumes/demo
```
Returns the built-in demo resume.
A fresh database automatically seeds the demo resume when the API starts.
Existing persisted demo data is not overwritten during startup.
---
ATS Analysis
ResumeForge includes an analyzer package for ATS-oriented resume analysis.
The analyzer evaluates resume structure and content and provides scoring-oriented feedback.
The analyzer is integrated into the API and shared project architecture.
The analysis functionality is exposed through the API.
---
Resume Matching
ResumeForge includes resume/job matching functionality through the API.
The matching endpoint is exposed under:
```text
/api/v1/match
```
The matching functionality is designed to compare resume information against job-related requirements.
---
Word Export
ResumeForge supports Microsoft Word resume export.
The export functionality is available through the API and integrated with the editor workflow.
The API endpoint is:
```text
/api/v1/export/word
```
---
Docker
ResumeForge provides separate Dockerfiles for the API and web application.
Build the API Image
From the repository root:
```bash
docker build   -f apps/api/Dockerfile   -t resumeforge-api:local   .
```
Build the Web Image
```bash
docker build   -f apps/web/Dockerfile   -t resumeforge-web:local   .
```
Both images use multi-stage builds.
The runtime containers run as non-root users.
---
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
The local services are exposed at:
```text
Web:
http://localhost:3000

API:
http://localhost:8000
```
---
Persistent Docker Data
The API stores SQLite data under:
```text
/app/data
```
The Compose configuration mounts a persistent host directory to this location.
The environment configuration is:
```yaml
RESUMEFORGE_DATA_DIR: /app/data
```
This prevents the SQLite database from being tied to the lifecycle of the API container.
---
Production Deployment
ResumeForge provides a production Compose configuration:
```text
deploy/docker-compose.prod.yml
```
The production configuration uses container images published to GitHub Container Registry.
Images follow the project naming convention:
```text
ghcr.io/<owner>/resumeforge-api:<tag>
ghcr.io/<owner>/resumeforge-web:<tag>
```
The production configuration connects the web application to the API through the Docker Compose service network.
The API data directory is mounted separately at:
```text
/app/data
```
---
CI/CD
ResumeForge uses GitHub Actions for continuous integration and delivery.
The pipeline is organized into sequential stages:
```text
┌──────────┐
│    CI    │
└────┬─────┘
     │
     ▼
┌──────────┐
│ Security │
└────┬─────┘
     │
     ▼
┌──────────┐
│  Docker  │
└──────────┘
```
Each stage depends on the successful completion of the previous stage.
---
CI Stage
The CI stage validates the application by:
Installing dependencies
Building the shared resume schema
Building the Next.js application
Validating the application build
---
Security Stage
The security stage performs:
Secret scanning
Gitleaks checks the repository for accidentally committed secrets.
Static analysis
Semgrep performs static analysis against the source code.
JavaScript dependency auditing
```text
npm audit
```
checks JavaScript dependencies for known vulnerabilities.
Python dependency auditing
```text
pip-audit
```
checks Python dependencies for known vulnerabilities.
---
Docker Stage
The Docker stage:
Builds the API image
Builds the web image
Loads the images for scanning
Scans the images using Trivy
Authenticates to GitHub Container Registry
Publishes the images to GHCR
Container scans are configured to identify HIGH and CRITICAL vulnerabilities.
---
Container Security
The application containers follow several container-hardening practices.
The API and web runtime containers:
Use dedicated non-root users
Separate build and runtime stages
Keep runtime images smaller than development/build environments
Expose only the required application ports
Include container health checks
Use production dependency installation
Avoid unnecessary runtime tooling
---
Health Checks
Both services provide container health checks.
API
```text
GET /health
```
Web
The web container performs a local HTTP health check against the Next.js application.
Docker Compose uses API health status to ensure that the web service starts after the API becomes healthy.
---
Development Workflow
ResumeForge is developed using feature branches.
Recommended workflow:
```text
main
 │
 ├── feature/editor-improvement
 ├── feature/ats-analysis
 └── fix/api-persistence
```
Changes should be developed on a feature branch and merged through the repository pull-request workflow.
Before submitting a pull request:
Build the affected application.
Run relevant tests.
Validate API changes.
Validate frontend changes.
Validate Docker changes where applicable.
Review the final diff.
Open a pull request.
---
Testing
Testing should cover the affected project area.
For API changes, verify:
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
---
Project Goals
ResumeForge is designed around the following principles:
Structured resume data
Portable deployment
Reusable architecture
ATS-oriented analysis
Local-first editing
API-backed persistence
Containerized deployment
Automated CI/CD
Automated security validation
Extensible resume templates
---
Roadmap
Planned areas of development include:
Additional resume templates
Expanded ATS analysis
Improved resume/job matching
Enhanced resume version management
Additional export formats
Authentication and user accounts
Multi-user resume ownership
Expanded automated testing
Additional deployment options
---
Contributing
Contributions are welcome.
Before contributing:
Create a feature branch.
Make focused changes.
Run the appropriate tests and validation.
Keep unrelated changes out of the pull request.
Open a pull request against `main`.
Please read:
```text
CONTRIBUTING.md
```
before submitting a contribution.
For security vulnerabilities, follow:
```text
SECURITY.md
```
---
Security
ResumeForge uses automated security checks as part of its CI/CD pipeline.
The project includes:
Secret scanning
Static analysis
JavaScript dependency auditing
Python dependency auditing
Container vulnerability scanning
Container health checks
Non-root runtime containers
Security vulnerabilities should be reported according to the process documented in:
```text
SECURITY.md
```
---
License
ResumeForge is licensed under the Apache License 2.0.
See the `LICENSE` file for the complete license text.
---
Acknowledgements
ResumeForge is built using open-source technologies and libraries from the broader JavaScript, Python, FastAPI, React, Next.js, Docker, and cloud-native ecosystems.
---
ResumeForge — structured, portable, ATS-friendly resume creation.