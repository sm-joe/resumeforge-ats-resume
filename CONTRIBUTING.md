Contributing to ResumeForge
Thank you for contributing to ResumeForge.
This document describes the development and contribution workflow for the project.
Development Workflow
ResumeForge uses feature branches for development.
Do not make direct changes on `main`.
Create a branch for each change:
```bash
git checkout -b feature/<short-description>
```
Examples:
```text
feature/resume-template
feature/ats-improvements
fix/api-persistence
fix/editor-autosave
```
Keep each branch focused on a specific change.
Before Making Changes
Before starting work:
Make sure your local `main` branch is up to date.
Create a feature branch.
Understand the existing implementation before changing it.
Avoid unrelated refactoring.
Making Changes
Please follow these principles:
Keep changes focused.
Preserve existing working functionality.
Prefer small, reviewable commits.
Avoid unnecessary dependencies.
Do not commit generated files unless they are intentionally part of the project.
Do not commit secrets, credentials, tokens, API keys, or local environment files.
Update documentation when behavior or configuration changes.
Testing
Run the relevant validation before opening a pull request.
For frontend changes, verify:
Application builds successfully.
Editor functionality works.
Live preview works.
Relevant export functionality works.
For API changes, verify:
API starts successfully.
`/health` responds successfully.
Affected API endpoints behave as expected.
Persistence behavior is validated when applicable.
For Docker changes, verify:
Images build successfully.
Containers start successfully.
Health checks pass.
Persistent data behaves as expected.
Pull Requests
Open a pull request against `main`.
A pull request should include:
A clear title.
A concise description of the change.
The reason for the change.
Relevant testing performed.
Any configuration or deployment considerations.
Keep pull requests focused and avoid combining unrelated changes.
Commit Messages
Use clear, descriptive commit messages.
Examples:
```text
feat: add resume persistence
fix: correct editor autosave
docs: update deployment documentation
refactor: simplify resume API
test: add resume API coverage
chore: update dependencies
```
Code Review
Pull requests should be reviewed before merging.
Reviewers should consider:
Correctness
Maintainability
Security
Performance
Backward compatibility
Test coverage
Documentation
Resolve review conversations before merging.
Dependencies
Before adding a dependency:
Confirm that the dependency is necessary.
Prefer established and actively maintained packages.
Check licensing compatibility.
Review known security vulnerabilities.
Keep dependency versions reproducible.
Security
Never commit:
Passwords
API keys
Access tokens
Private keys
Cloud credentials
Database credentials
`.env` files containing secrets
Security vulnerabilities should not be opened as public GitHub issues.
Please follow the process in `SECURITY.md`.
Documentation
Documentation changes should be included with changes that affect:
Installation
Configuration
API behavior
Deployment
Development workflow
User-facing functionality
License
By contributing to ResumeForge, you agree that your contributions are provided under the project's Apache License 2.0.