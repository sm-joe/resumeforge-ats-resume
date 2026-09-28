# Security Policy

## Supported Versions

Security fixes are provided for the actively maintained version of ResumeForge.

| Version | Supported |
|---|---|
| Latest | Yes |
| Older releases | Best effort |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

If you discover a security vulnerability in ResumeForge, use GitHub's private vulnerability reporting feature when available.

When reporting a vulnerability, please include:

- A clear description of the vulnerability
- The affected component or file
- Steps required to reproduce the issue
- The potential security impact
- Any relevant logs, screenshots, or proof-of-concept information
- A suggested mitigation, if known

Please avoid including secrets, credentials, personal information, or other sensitive data in the report.

## Responsible Disclosure

Please allow reasonable time for the issue to be investigated and addressed before publicly disclosing the vulnerability.

Security reports will be reviewed and handled as confidentially as the available GitHub security tooling permits.

## Security Practices

ResumeForge uses several automated security checks as part of its development workflow, including:

- Secret scanning with Gitleaks
- Static analysis with Semgrep
- JavaScript dependency auditing with npm audit
- Python dependency auditing with pip-audit
- Container vulnerability scanning with Trivy
- Docker health checks
- Non-root container runtime users
- Automated CI/CD validation

Security-sensitive changes should be reviewed carefully and validated through the project's CI pipeline.

## Scope

Security reports may include issues affecting:

- ResumeForge source code
- API endpoints
- Web application behavior
- Resume data persistence
- Container images
- CI/CD workflows
- Dependency configuration
- Deployment configuration

Third-party infrastructure, GitHub itself, and unrelated dependencies should be reported through their respective security channels.

## Security Updates

Security fixes may be released as source changes, dependency updates, configuration changes, container image updates, or application releases depending on the nature of the issue.