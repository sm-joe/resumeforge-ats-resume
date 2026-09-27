from typing import Any

from .models import AnalysisResult, CategoryScore, Finding


CATEGORY_WEIGHTS = {
    "Contact & Profile": 15,
    "Summary": 10,
    "Experience": 25,
    "Skills": 20,
    "Education": 10,
    "Certifications": 5,
    "Resume Structure": 15,
}


def _text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def _finding(
    finding_id: str,
    severity: str,
    category: str,
    message: str,
) -> Finding:
    return Finding(
        id=finding_id,
        severity=severity,  # type: ignore[arg-type]
        category=category,
        message=message,
    )


def _score_contact_profile(
    resume: Any,
) -> tuple[int, list[Finding]]:
    profile = resume.profile
    score = 0
    findings: list[Finding] = []

    if _text(profile.name):
        score += 5
    else:
        findings.append(
            _finding(
                "profile-name-missing",
                "error",
                "Contact & Profile",
                "Add your full name.",
            )
        )

    if _text(profile.email):
        score += 5
    else:
        findings.append(
            _finding(
                "profile-email-missing",
                "error",
                "Contact & Profile",
                "Add a professional email address.",
            )
        )

    if _text(profile.phone):
        score += 2
    else:
        findings.append(
            _finding(
                "profile-phone-missing",
                "warning",
                "Contact & Profile",
                "Consider adding a phone number.",
            )
        )

    if _text(profile.location):
        score += 1
    else:
        findings.append(
            _finding(
                "profile-location-missing",
                "info",
                "Contact & Profile",
                "Consider adding your location.",
            )
        )

    if profile.links:
        score += 2
    else:
        findings.append(
            _finding(
                "profile-links-missing",
                "info",
                "Contact & Profile",
                "Consider adding a relevant professional profile or portfolio link.",
            )
        )

    return score, findings


def _score_summary(
    resume: Any,
) -> tuple[int, list[Finding]]:
    summary = _text(resume.summary)
    findings: list[Finding] = []

    if not summary:
        findings.append(
            _finding(
                "summary-missing",
                "warning",
                "Summary",
                "Add a concise professional summary.",
            )
        )
        return 0, findings

    word_count = len(summary.split())

    if word_count < 20:
        findings.append(
            _finding(
                "summary-too-short",
                "warning",
                "Summary",
                "Expand the summary with relevant experience, strengths, and specialization.",
            )
        )
        return 5, findings

    if word_count > 120:
        findings.append(
            _finding(
                "summary-too-long",
                "warning",
                "Summary",
                "Keep the professional summary concise.",
            )
        )
        return 7, findings

    return 10, findings


def _score_experience(
    resume: Any,
) -> tuple[int, list[Finding]]:
    experiences = resume.experience
    findings: list[Finding] = []

    if not experiences:
        findings.append(
            _finding(
                "experience-missing",
                "error",
                "Experience",
                "Add relevant professional experience.",
            )
        )
        return 0, findings

    score = 10

    complete_entries = 0
    total_bullets = 0
    quantified_bullets = 0
    weak_action_bullets = 0

    for experience in experiences:
        if (
            _text(experience.company)
            and _text(experience.title)
            and _text(experience.startDate)
        ):
            complete_entries += 1

        for bullet in experience.bullets:
            bullet_text = _text(bullet)

            if not bullet_text:
                continue

            total_bullets += 1

            if any(
                character.isdigit()
                for character in bullet_text
            ):
                quantified_bullets += 1

            first_word = (
                bullet_text
                .lstrip("•-* ")
                .split(maxsplit=1)[0]
                .lower()
                if bullet_text
                else ""

            )

            if first_word not in RESPONSIBILITY_VERBS:
                weak_action_bullets += 1

    if complete_entries == len(experiences):
        score += 5
    else:
        findings.append(
            _finding(
                "experience-incomplete",
                "warning",
                "Experience",
                "Complete the company, title, and start date for each experience entry.",
            )
        )

    if total_bullets >= 3:
        score += 5
    else:
        findings.append(
            _finding(
                "experience-bullets-low",
                "warning",
                "Experience",
                "Add more accomplishment-focused bullet points to your experience.",
            )
        )

    if total_bullets > 0 and quantified_bullets > 0:
        score += 5
    else:
        findings.append(
            _finding(
                "experience-quantification-missing",
                "info",
                "Experience",
                "Add measurable results where appropriate.",
            )
        )

    if total_bullets > 0 and weak_action_bullets > 0:
        findings.append(
            _finding(
                "experience-weak-action-verbs",
                "info",
                "Experience",
                "Some experience bullets do not begin with a strong action verb. "
                "Use clear verbs such as designed, implemented, automated, "
                "optimized, led, or secured where accurate.",
            )
        )

    return min(score, 25), findings


def _score_skills(
    resume: Any,
) -> tuple[int, list[Finding]]:
    categories = resume.skills.categories
    findings: list[Finding] = []

    if not categories:
        findings.append(
            _finding(
                "skills-missing",
                "error",
                "Skills",
                "Add relevant technical and professional skills.",
            )
        )
        return 0, findings

    skill_count = sum(
        len(
            [
                item
                for item in category.items
                if _text(item)
            ]
        )
        for category in categories
    )

    if len(categories) == 1 and skill_count >= 5:
        findings.append(
            _finding(
                "skills-single-category",
                "info",
                "Skills",
                "Skills are concentrated in a single category. "
                "Consider grouping technical skills into clear categories "
                "such as Cloud, DevOps, Security, Programming, or Tools where applicable.",
            )
        )

    if any(not _text(category.name) for category in categories):
        findings.append(
            _finding(
                "skills-unnamed-category",
                "warning",
                "Skills",
                "One or more skill categories do not have a name. "
                "Use clear category names to improve resume readability and ATS interpretation.",
            )
        )

    if skill_count == 0:
        findings.append(
            _finding(
                "skills-empty",
                "error",
                "Skills",
                "Add skills to your skill categories.",
            )
        )
        return 0, findings

    if skill_count < 5:
        findings.append(
            _finding(
                "skills-low",
                "warning",
                "Skills",
                "Add more relevant skills to improve keyword coverage.",
            )
        )
        return 10, findings

    if skill_count < 10:
        return 15, findings

    return 20, findings


def _score_education(
    resume: Any,
) -> tuple[int, list[Finding]]:
    education = resume.education
    findings: list[Finding] = []

    if not education:
        findings.append(
            _finding(
                "education-missing",
                "info",
                "Education",
                "Consider adding your education if relevant to the target role.",
            )
        )
        return 0, findings

    score = 10

    for entry in education:
        if not _text(entry.institution):
            score -= 2

        if not _text(entry.degree):
            score -= 1

    if score < 10:
        findings.append(
            _finding(
                "education-incomplete",
                "warning",
                "Education",
                "Complete the institution and degree information.",
            )
        )

    return max(score, 0), findings


def _score_certifications(
    resume: Any,
) -> tuple[int, list[Finding]]:
    certifications = resume.certifications

    if not certifications:
        return 0, [
            _finding(
                "certifications-missing",
                "info",
                "Certifications",
                "Add relevant certifications when they strengthen your target profile.",
            )
        ]

    return 5, []


def _score_structure(
    resume: Any,
) -> tuple[int, list[Finding]]:
    findings: list[Finding] = []
    score = 15

    sections = [
        bool(_text(resume.summary)),
        bool(resume.experience),
        bool(resume.skills.categories),
    ]

    if sum(sections) < 3:
        score -= 5
        findings.append(
            _finding(
                "structure-core-sections",
                "warning",
                "Resume Structure",
                "Include a summary, experience, and skills section.",
            )
        )

    if not resume.profile.links:
        score -= 1

    if not resume.education and not resume.certifications:
        score -= 2
        findings.append(
            _finding(
                "structure-supporting-sections",
                "info",
                "Resume Structure",
                "Consider adding education or certifications when relevant.",
            )
        )

    if not resume.languages and not resume.projects:
        score -= 1

    return max(score, 0), findings


def analyze_resume(resume: Any) -> AnalysisResult:
    scorers = (
        ("Contact & Profile", _score_contact_profile),
        ("Summary", _score_summary),
        ("Experience", _score_experience),
        ("Skills", _score_skills),
        ("Education", _score_education),
        ("Certifications", _score_certifications),
        ("Resume Structure", _score_structure),
    )

    category_scores: list[CategoryScore] = []
    findings: list[Finding] = []

    for category, scorer in scorers:
        score, category_findings = scorer(resume)

        category_scores.append(
            CategoryScore(
                category=category,
                score=score,
                max_score=CATEGORY_WEIGHTS[category],
            )
        )

        findings.extend(category_findings)

    overall_score = sum(
        category.score
        for category in category_scores
    )

    return AnalysisResult(
        overall_score=overall_score,
        category_scores=tuple(category_scores),
        findings=tuple(findings),
    )