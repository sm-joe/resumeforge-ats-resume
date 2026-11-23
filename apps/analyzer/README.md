# ResumeForge Analyzer

Deterministic Python scoring and job-description matching logic for ResumeForge.

The quality score ranges from 0 to 100 and uses explicit category weights: Contact/Profile (15), Summary (10), Experience (25), Skills (20), Education (10), Certifications (5), and Structure (15). The analyzer strips rich-text markup before evaluating visible content.

**Important:** The score is a resume completeness/quality heuristic; it does not represent the probability of passing an employer ATS. Job matching is a separate comparison of resume evidence and a supplied job description. Neither system fabricates credentials or guarantees recruitment outcomes.

## Run Tests

From the repository root:

```bash
uv run --project apps/analyzer --with pytest pytest apps/analyzer/tests tests/analyzer
```

The analyzer is imported by `resumeforge_api.routes.analyze` and `resumeforge_api.routes.match`. The evaluation methodology is documented in the root [README](../../README.md).
