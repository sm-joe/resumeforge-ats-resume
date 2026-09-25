from dataclasses import dataclass


@dataclass(frozen=True)
class AnalysisResult:
    score: int
    checks: list[str]


def analyze(resume: dict) -> AnalysisResult:
    checks: list[str] = []

    if resume.get("profile"):
        checks.append("profile_present")

    if resume.get("experience"):
        checks.append("experience_present")

    if resume.get("skills"):
        checks.append("skills_present")

    score = min(len(checks) * 25, 100)

    return AnalysisResult(
        score=score,
        checks=checks,
    )