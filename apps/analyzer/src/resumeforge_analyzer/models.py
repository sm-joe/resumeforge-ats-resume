from dataclasses import dataclass
from typing import Literal


Severity = Literal["info", "warning", "error"]


@dataclass(frozen=True)
class Finding:
    id: str
    severity: Severity
    category: str
    message: str


@dataclass(frozen=True)
class CategoryScore:
    category: str
    score: int
    max_score: int


@dataclass(frozen=True)
class AnalysisResult:
    overall_score: int
    category_scores: tuple[CategoryScore, ...]
    findings: tuple[Finding, ...]