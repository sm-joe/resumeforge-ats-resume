import re
from collections import Counter
from typing import Any, Literal

from .models import Finding


RequirementStatus = Literal["matched", "partial", "missing"]


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "into",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "this",
    "to",
    "using",
    "with",
    "will",
    "you",
    "your",
    "our",
    "we",
    "they",
    "them",
    "must",
    "should",
    "can",
    "may",
    "who",
    "what",
    "which",
    "where",
    "when",
    "while",
    "within",
    "about",
    "across",
    "through",
    "over",
    "under",
    "than",
    "also",
    "including",
    "such",
    "both",
    "role",
    "work",
    "working",
    "team",
    "teams",
}


TECHNICAL_TERMS = {
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "kubernetes",
    "docker",
    "terraform",
    "ansible",
    "python",
    "java",
    "javascript",
    "typescript",
    "go",
    "golang",
    "rust",
    "linux",
    "windows",
    "git",
    "github",
    "gitlab",
    "jenkins",
    "argocd",
    "helm",
    "prometheus",
    "grafana",
    "splunk",
    "datadog",
    "cloudformation",
    "eks",
    "aks",
    "gke",
    "ec2",
    "s3",
    "rds",
    "iam",
    "kafka",
    "redis",
    "postgresql",
    "postgres",
    "mysql",
    "mongodb",
    "sql",
    "nosql",
    "devops",
    "devsecops",
    "sre",
    "security",
    "cybersecurity",
    "cloud security",
    "ci/cd",
    "cicd",
    "api",
    "rest",
    "microservices",
    "oauth",
    "oidc",
    "docker compose",
    "cloudtrail",
    "guardduty",
    "security hub",
    "prisma cloud",
    "wiz",
    "sentinel",
    "soc",
    "siem",
    "cspm",
    "kms",
    "vault",
    "istio",
    "service mesh",
    "open telemetry",
    "opentelemetry",
}


RESPONSIBILITY_VERBS = {
    "design",
    "designed",
    "develop",
    "developed",
    "build",
    "built",
    "implement",
    "implemented",
    "manage",
    "managed",
    "lead",
    "led",
    "own",
    "owned",
    "drive",
    "drove",
    "operate",
    "operated",
    "maintain",
    "maintained",
    "automate",
    "automated",
    "deploy",
    "deployed",
    "monitor",
    "monitored",
    "secure",
    "secured",
    "architect",
    "architected",
    "configure",
    "configured",
    "integrate",
    "integrated",
    "optimize",
    "optimized",
    "support",
    "supported",
    "troubleshoot",
    "troubleshooting",
    "migrate",
    "migrated",
    "govern",
    "governed",
    "developing",
    "building",
    "implementing",
    "managing",
    "leading",
    "owning",
    "driving",
    "operating",
    "maintaining",
    "automating",
    "deploying",
    "monitoring",
    "securing",
    "architecting",
}


DEGREE_TERMS = {
    "bachelor",
    "bachelors",
    "bachelor's",
    "master",
    "masters",
    "master's",
    "phd",
    "doctorate",
    "degree",
    "mba",
    "btech",
    "b.tech",
    "mtech",
    "m.tech",
    "computer science",
    "information technology",
    "engineering",
}


CERTIFICATION_TERMS = {
    "aws certified",
    "azure certification",
    "google cloud certification",
    "cissp",
    "ccsp",
    "security+",
    "comptia security+",
    "ceh",
    "cka",
    "ckad",
    "terraform associate",
    "terraform certified",
    "pmp",
    "itil",
    "iso 27001",
    "certified kubernetes",
}


YEAR_PATTERNS = (
    re.compile(
        r"(\d+)\+?\s*(?:years?|yrs?)",
        re.IGNORECASE,
    ),
    re.compile(
        r"minimum of\s+(\d+)\s*(?:years?|yrs?)",
        re.IGNORECASE,
    ),
    re.compile(
        r"at least\s+(\d+)\s*(?:years?|yrs?)",
        re.IGNORECASE,
    ),
)


def _normalize(value: str) -> str:
    value = value.lower()
    value = value.replace("ci/cd", "cicd")
    value = value.replace("&", " and ")
    value = re.sub(
        r"[^a-z0-9+#./' -]",
        " ",
        value,
    )
    value = re.sub(
        r"\s+",
        " ",
        value,
    )
    return value.strip()


def _display_term(term: str) -> str:
    replacements = {
        "cicd": "CI/CD",
        "aws": "AWS",
        "azure": "Azure",
        "gcp": "GCP",
        "eks": "EKS",
        "aks": "AKS",
        "gke": "GKE",
        "iam": "IAM",
        "kms": "KMS",
        "sre": "SRE",
        "devops": "DevOps",
        "devsecops": "DevSecOps",
        "siem": "SIEM",
        "cspm": "CSPM",
        "oidc": "OIDC",
        "api": "API",
    }

    return replacements.get(
        term,
        term.title(),
    )


def _resume_text(resume: Any) -> str:
    parts: list[str] = []

    profile = resume.profile

    parts.extend(
        [
            str(getattr(profile, "name", "")),
            str(getattr(profile, "headline", "")),
            str(getattr(profile, "email", "")),
            str(getattr(profile, "location", "")),
        ]
    )

    for link in getattr(profile, "links", []):
        parts.append(
            str(getattr(link, "label", ""))
        )
        parts.append(
            str(getattr(link, "url", ""))
        )

    parts.append(str(resume.summary))

    for experience in resume.experience:
        parts.extend(
            [
                str(experience.company),
                str(experience.title),
                str(experience.location),
                str(experience.startDate),
                str(experience.endDate),
            ]
        )

        parts.extend(
            str(bullet)
            for bullet in experience.bullets
        )

    for education in resume.education:
        parts.extend(
            [
                str(education.institution),
                str(education.degree),
                str(education.field),
                str(education.location),
            ]
        )

    for project in resume.projects:
        parts.extend(
            [
                str(project.name),
                str(project.description),
                str(project.url),
            ]
        )

        parts.extend(
            str(bullet)
            for bullet in project.bullets
        )

        technologies = getattr(
            project,
            "technologies",
            [],
        )

        parts.extend(
            str(item)
            for item in technologies
        )

    for category in resume.skills.categories:
        parts.append(str(category.name))

        parts.extend(
            str(item)
            for item in category.items
        )

    for certification in resume.certifications:
        parts.extend(
            [
                str(certification.name),
                str(certification.issuer),
                str(getattr(certification, "date", "")),
            ]
        )

    for language in resume.languages:
        parts.extend(
            [
                str(language.name),
                str(language.proficiency),
            ]
        )

    for custom_section in resume.customSections:
        parts.append(
            str(custom_section.title)
        )

        items = getattr(
            custom_section,
            "items",
            [],
        )

        parts.extend(
            str(item)
            for item in items
        )

        content = getattr(
            custom_section,
            "content",
            "",
        )

        if content:
            parts.append(str(content))

    return _normalize(
        " ".join(parts)
    )


def _resume_sentences(resume: Any) -> list[str]:
    raw_parts: list[str] = []

    raw_parts.append(
        str(resume.summary)
    )

    for experience in resume.experience:
        raw_parts.extend(
            str(bullet)
            for bullet in experience.bullets
        )

    for project in resume.projects:
        raw_parts.append(
            str(project.description)
        )

        raw_parts.extend(
            str(bullet)
            for bullet in project.bullets
        )

    for category in resume.skills.categories:
        raw_parts.append(
            str(category.name)
        )

        raw_parts.extend(
            str(item)
            for item in category.items
        )

    for education in resume.education:
        raw_parts.append(
            " ".join(
                [
                    str(education.degree),
                    str(education.field),
                    str(education.institution),
                ]
            )
        )

    for certification in resume.certifications:
        raw_parts.append(
            " ".join(
                [
                    str(certification.name),
                    str(certification.issuer),
                ]
            )
        )

    return [
        sentence.strip()
        for part in raw_parts
        for sentence in re.split(
            r"(?<=[.!?])\s+|\n+",
            part,
        )
        if sentence.strip()
    ]


def _extract_terms(text: str) -> list[str]:
    normalized = _normalize(text)

    terms: set[str] = set()

    for term in TECHNICAL_TERMS:
        normalized_term = _normalize(term)

        if re.search(
            rf"(?<![a-z0-9])"
            rf"{re.escape(normalized_term)}"
            rf"(?![a-z0-9])",
            normalized,
        ):
            terms.add(normalized_term)

    words = re.findall(
        r"\b[a-z][a-z0-9+#.-]{2,}\b",
        normalized,
    )

    frequencies = Counter(
        word
        for word in words
        if word not in STOP_WORDS
        and not word.isdigit()
    )

    for word, count in frequencies.items():
        if count >= 2:
            terms.add(word)

    return sorted(terms)


def _extract_role_title(
    job_description: str,
) -> str:
    lines = [
        re.sub(
            r"^[\s\-•*]+",
            "",
            line,
        ).strip()
        for line in job_description.splitlines()
        if line.strip()
    ]

    title_patterns = [
        re.compile(
            r"(?:job title|position|role|title)"
            r"\s*[:\-]\s*(.+)",
            re.IGNORECASE,
        ),
    ]

    for line in lines[:12]:
        for pattern in title_patterns:
            match = pattern.search(line)

            if match:
                return match.group(1).strip()

    common_role_patterns = [
        r"\b(?:senior|staff|principal|lead|junior|associate)?\s*"
        r"(?:cloud|security|devops|site reliability|software|platform|"
        r"infrastructure|data|network|solutions|systems)"
        r"(?:\s+[a-zA-Z]+){0,4}\s+"
        r"(?:engineer|architect|developer|manager|administrator|specialist)"
        r"\b",
    ]

    for pattern in common_role_patterns:
        match = re.search(
            pattern,
            job_description,
            re.IGNORECASE,
        )

        if match:
            return re.sub(
                r"\s+",
                " ",
                match.group(0),
            ).strip()

    return ""


def _extract_requirement_lines(
    job_description: str,
    keywords: tuple[str, ...],
) -> list[str]:
    lines = [
        re.sub(
            r"^[\s\-•*]+",
            "",
            line,
        ).strip()
        for line in job_description.splitlines()
        if line.strip()
    ]

    matches: list[str] = []

    for line in lines:
        normalized = _normalize(line)

        if any(
            keyword in normalized
            for keyword in keywords
        ):
            if len(line) >= 12:
                matches.append(line)

    return matches


def _extract_skills(
    job_description: str,
) -> list[str]:
    normalized = _normalize(
        job_description
    )

    skills: set[str] = set()

    for term in TECHNICAL_TERMS:
        normalized_term = _normalize(term)

        if re.search(
            rf"(?<![a-z0-9])"
            rf"{re.escape(normalized_term)}"
            rf"(?![a-z0-9])",
            normalized,
        ):
            skills.add(normalized_term)

    return sorted(skills)


def _split_required_preferred(
    job_description: str,
    skills: list[str],
) -> tuple[list[str], list[str]]:
    preferred_markers = (
        "preferred",
        "nice to have",
        "nice-to-have",
        "bonus",
        "plus",
        "preferred qualifications",
        "desired",
    )

    normalized = _normalize(
        job_description
    )

    preferred_area = any(
        marker in normalized
        for marker in preferred_markers
    )

    preferred: list[str] = []
    required: list[str] = []

    for skill in skills:
        skill_pattern = re.compile(
            rf"(?<![a-z0-9])"
            rf"{re.escape(skill)}"
            rf"(?![a-z0-9])",
            re.IGNORECASE,
        )

        locations = [
            match.start()
            for match in skill_pattern.finditer(
                normalized
            )
        ]

        if not locations:
            continue

        is_preferred = False

        for location in locations:
            context = normalized[
                max(0, location - 180):location
            ]

            if any(
                marker in context
                for marker in preferred_markers
            ):
                is_preferred = True
                break

        if is_preferred:
            preferred.append(skill)
        else:
            required.append(skill)

    if preferred_area and not preferred:
        return required, []

    return required, preferred


def _extract_year_requirement(
    job_description: str,
) -> int | None:
    matches: list[int] = []

    for pattern in YEAR_PATTERNS:
        for match in pattern.finditer(
            job_description
        ):
            matches.append(
                int(match.group(1))
            )

    return max(matches) if matches else None


def _resume_years(
    resume: Any,
) -> int | None:
    total_months = 0

    for experience in resume.experience:
        start = str(
            getattr(
                experience,
                "startDate",
                "",
            )
            or ""
        )

        end = str(
            getattr(
                experience,
                "endDate",
                "",
            )
            or ""
        )

        start_match = re.search(
            r"(20\d{2})",
            start,
        )

        end_match = re.search(
            r"(20\d{2})",
            end,
        )

        if not start_match:
            continue

        start_year = int(
            start_match.group(1)
        )

        end_year = (
            int(end_match.group(1))
            if end_match
            else start_year
        )

        total_months += max(
            0,
            (end_year - start_year) * 12,
        )

    if total_months == 0:
        return None

    return max(
        1,
        round(total_months / 12),
    )


def _requirement_status(
    term: str,
    resume_text: str,
) -> RequirementStatus:
    normalized_term = _normalize(term)

    if normalized_term in resume_text:
        return "matched"

    tokens = [
        token
        for token in normalized_term.split()
        if token not in STOP_WORDS
    ]

    if len(tokens) >= 2:
        matched_tokens = sum(
            1
            for token in tokens
            if re.search(
                rf"(?<![a-z0-9])"
                rf"{re.escape(token)}"
                rf"(?![a-z0-9])",
                resume_text,
            )
        )

        if matched_tokens >= max(
            1,
            len(tokens) // 2,
        ):
            return "partial"

    return "missing"


def _evidence_for_term(
    term: str,
    sentences: list[str],
    limit: int = 2,
) -> list[str]:
    normalized_term = _normalize(term)

    tokens = [
        token
        for token in normalized_term.split()
        if token not in STOP_WORDS
    ]

    evidence: list[str] = []

    for sentence in sentences:
        normalized_sentence = _normalize(
            sentence
        )

        if normalized_term in normalized_sentence:
            evidence.append(sentence)
            continue

        if tokens:
            overlap = sum(
                1
                for token in tokens
                if re.search(
                    rf"(?<![a-z0-9])"
                    rf"{re.escape(token)}"
                    rf"(?![a-z0-9])",
                    normalized_sentence,
                )
            )

            if overlap >= max(
                1,
                len(tokens) // 2,
            ):
                evidence.append(sentence)

        if len(evidence) >= limit:
            break

    return evidence[:limit]


def _build_requirement(
    term: str,
    resume_text: str,
    sentences: list[str],
) -> dict[str, Any]:
    status = _requirement_status(
        term,
        resume_text,
    )

    return {
        "term": _display_term(term),
        "status": status,
        "evidence": _evidence_for_term(
            term,
            sentences,
        ),
    }


def _score_requirements(
    requirements: list[dict[str, Any]],
) -> int:
    if not requirements:
        return 100

    points = {
        "matched": 100,
        "partial": 50,
        "missing": 0,
    }

    return round(
        sum(
            points[item["status"]]
            for item in requirements
        )
        / len(requirements)
    )


def _score_role_alignment(
    role_title: str,
    resume: Any,
    resume_text: str,
) -> int:
    if not role_title:
        return 100

    normalized_role = _normalize(
        role_title
    )

    tokens = [
        token
        for token in normalized_role.split()
        if token not in STOP_WORDS
        and len(token) > 2
    ]

    if not tokens:
        return 100

    profile = resume.profile

    title_text = _normalize(
        " ".join(
            [
                str(
                    getattr(
                        profile,
                        "headline",
                        "",
                    )
                ),
                *[
                    str(experience.title)
                    for experience in resume.experience
                ],
            ]
        )
    )

    exact_hits = sum(
        1
        for token in tokens
        if re.search(
            rf"(?<![a-z0-9])"
            rf"{re.escape(token)}"
            rf"(?![a-z0-9])",
            title_text,
        )
    )

    if exact_hits == len(tokens):
        return 100

    if exact_hits >= max(
        1,
        len(tokens) // 2,
    ):
        return 70

    broad_hits = sum(
        1
        for token in tokens
        if token in resume_text
    )

    if broad_hits:
        return 40

    return 0


def _score_experience_requirement(
    required_years: int | None,
    resume_years: int | None,
) -> tuple[int, dict[str, Any]]:
    if required_years is None:
        return (
            100,
            {
                "required_years": None,
                "resume_years": resume_years,
                "status": "not_specified",
            },
        )

    if resume_years is None:
        return (
            0,
            {
                "required_years": required_years,
                "resume_years": None,
                "status": "missing_evidence",
            },
        )

    if resume_years >= required_years:
        return (
            100,
            {
                "required_years": required_years,
                "resume_years": resume_years,
                "status": "matched",
            },
        )

    if resume_years >= max(
        1,
        required_years - 2,
    ):
        return (
            50,
            {
                "required_years": required_years,
                "resume_years": resume_years,
                "status": "partial",
            },
        )

    return (
        0,
        {
            "required_years": required_years,
            "resume_years": resume_years,
            "status": "missing",
        },
    )


def _extract_responsibilities(
    job_description: str,
) -> list[str]:
    lines = [
        re.sub(
            r"^[\s\-•*]+",
            "",
            line,
        ).strip()
        for line in job_description.splitlines()
        if line.strip()
    ]

    responsibilities: list[str] = []

    in_responsibility_section = False

    responsibility_headings = {
        "responsibilities",
        "key responsibilities",
        "key responsibility",
        "what you will do",
        "what you'll do",
        "what you will be doing",
        "you will",
        "your responsibilities",
        "role responsibilities",
    }

    section_headings = {
        "requirements",
        "required skills",
        "required qualifications",
        "preferred qualifications",
        "nice to have",
        "qualifications",
        "education",
        "experience",
        "skills",
        "about the role",
        "about the position",
    }

    for line in lines:
        normalized = _normalize(line)

        if normalized in responsibility_headings:
            in_responsibility_section = True
            continue

        if normalized in section_headings:
            in_responsibility_section = False
            continue

        if not normalized:
            continue

        if len(normalized.split()) < 3:
            continue

        if in_responsibility_section:
            responsibilities.append(line)
            continue

        words = normalized.split()

        if any(
            word in RESPONSIBILITY_VERBS
            for word in words[:5]
        ):
            responsibilities.append(line)
            continue

        if any(
            marker in normalized
            for marker in (
                "you will ",
                "you'll ",
                "responsible for ",
                "will be responsible ",
                "responsibility is ",
            )
        ):
            responsibilities.append(line)

    deduplicated: list[str] = []
    seen: set[str] = set()

    for item in responsibilities:
        normalized = _normalize(item)

        if normalized not in seen:
            seen.add(normalized)
            deduplicated.append(item)

    return deduplicated[:20]


def _responsibility_alignment(
    responsibilities: list[str],
    resume_text: str,
    sentences: list[str],
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []

    for responsibility in responsibilities:
        terms = _extract_terms(
            responsibility
        )

        meaningful_terms = [
            term
            for term in terms
            if term in TECHNICAL_TERMS
            or len(term.split()) > 1
        ]

        if not meaningful_terms:
            words = [
                word
                for word in _normalize(
                    responsibility
                ).split()
                if word not in STOP_WORDS
                and len(word) > 4
            ]

            meaningful_terms = words[:6]

        matched_terms = [
            term
            for term in meaningful_terms
            if _normalize(term) in resume_text
        ]

        if not meaningful_terms:
            status: RequirementStatus = "partial"
        elif len(matched_terms) == len(
            meaningful_terms
        ):
            status = "matched"
        elif matched_terms:
            status = "partial"
        else:
            status = "missing"

        evidence: list[str] = []

        for term in matched_terms[:3]:
            evidence.extend(
                _evidence_for_term(
                    term,
                    sentences,
                    limit=1,
                )
            )

        results.append(
            {
                "requirement": responsibility,
                "status": status,
                "matched_terms": [
                    _display_term(term)
                    for term in matched_terms
                ],
                "evidence": list(
                    dict.fromkeys(evidence)
                )[:2],
            }
        )

    return results


def _category_score_from_statuses(
    items: list[dict[str, Any]],
) -> int:
    if not items:
        return 100

    return _score_requirements(items)


def match_job_description(
    resume: Any,
    job_description: str,
) -> dict[str, Any]:
    normalized_jd = _normalize(
        job_description
    )

    if not normalized_jd:
        finding = Finding(
            id="job-description-empty",
            severity="error",
            category="Job Description",
            message=(
                "Provide a job description to "
                "calculate alignment."
            ),
        )

        return {
            "overall_score": 0,
            "role_title": "",
            "category_scores": [],
            "requirements": {},
            "matched_keywords": [],
            "missing_keywords": [],
            "partial_keywords": [],
            "keyword_coverage": 0,
            "findings": [
                {
                    "id": finding.id,
                    "severity": finding.severity,
                    "category": finding.category,
                    "message": finding.message,
                }
            ],
            "recommendations": [
                (
                    "Paste the complete target job "
                    "description before analyzing."
                ),
            ],
        }

    resume_text = _resume_text(resume)

    resume_sentences = _resume_sentences(
        resume
    )

    role_title = _extract_role_title(
        job_description
    )

    all_skills = _extract_skills(
        job_description
    )

    required_skills, preferred_skills = (
        _split_required_preferred(
            job_description,
            all_skills,
        )
    )

    required_skill_items = [
        _build_requirement(
            skill,
            resume_text,
            resume_sentences,
        )
        for skill in required_skills
    ]

    preferred_skill_items = [
        _build_requirement(
            skill,
            resume_text,
            resume_sentences,
        )
        for skill in preferred_skills
    ]

    responsibilities = _extract_responsibilities(
        job_description
    )

    responsibility_items = (
        _responsibility_alignment(
            responsibilities,
            resume_text,
            resume_sentences,
        )
    )

    required_years = _extract_year_requirement(
        job_description
    )

    resume_years = _resume_years(
        resume
    )

    (
        experience_score,
        experience_detail,
    ) = _score_experience_requirement(
        required_years,
        resume_years,
    )

    education_requirements = (
        _extract_requirement_lines(
            job_description,
            (
                "bachelor",
                "master",
                "degree",
                "education",
                "computer science",
                "engineering",
                "information technology",
            ),
        )
    )

    certification_requirements = (
        _extract_requirement_lines(
            job_description,
            tuple(CERTIFICATION_TERMS),
        )
    )

    education_items = [
        _build_requirement(
            requirement,
            resume_text,
            resume_sentences,
        )
        for requirement in education_requirements
    ]

    certification_items = [
        _build_requirement(
            requirement,
            resume_text,
            resume_sentences,
        )
        for requirement in certification_requirements
    ]

    role_score = _score_role_alignment(
        role_title,
        resume,
        resume_text,
    )

    required_skill_score = (
        _category_score_from_statuses(
            required_skill_items
        )
    )

    preferred_skill_score = (
        _category_score_from_statuses(
            preferred_skill_items
        )
    )

    responsibility_score = (
        _category_score_from_statuses(
            responsibility_items
        )
    )

    education_score = (
        _category_score_from_statuses(
            education_items
        )
    )

    certification_score = (
        _category_score_from_statuses(
            certification_items
        )
    )

    category_scores = [
        {
            "category": "Role Alignment",
            "score": role_score,
            "max_score": 15,
        },
        {
            "category": "Required Skills",
            "score": required_skill_score,
            "max_score": 25,
        },
        {
            "category": "Preferred Skills",
            "score": preferred_skill_score,
            "max_score": 10,
        },
        {
            "category": "Responsibilities",
            "score": responsibility_score,
            "max_score": 20,
        },
        {
            "category": "Experience",
            "score": experience_score,
            "max_score": 15,
        },
        {
            "category": "Education",
            "score": education_score,
            "max_score": 5,
        },
        {
            "category": "Certifications",
            "score": certification_score,
            "max_score": 5,
        },
    ]

    weighted_score = round(
        sum(
            category["score"]
            / 100
            * category["max_score"]
            for category in category_scores
        )
    )

    matched_keywords = [
        item["term"]
        for item in (
            required_skill_items
            + preferred_skill_items
        )
        if item["status"] == "matched"
    ]

    missing_keywords = [
        item["term"]
        for item in (
            required_skill_items
            + preferred_skill_items
        )
        if item["status"] == "missing"
    ]

    partial_keywords = [
        item["term"]
        for item in (
            required_skill_items
            + preferred_skill_items
        )
        if item["status"] == "partial"
    ]

    findings: list[Finding] = []
    recommendations: list[str] = []

    missing_required = [
        item["term"]
        for item in required_skill_items
        if item["status"] == "missing"
    ]

    if missing_required:
        findings.append(
            Finding(
                id="required-skills-missing",
                severity="warning",
                category="Required Skills",
                message=(
                    "The resume does not currently "
                    "show evidence for "
                    + ", ".join(
                        missing_required[:6]
                    )
                    + "."
                ),
            )
        )

        recommendations.append(
            (
                "Add missing required skills only "
                "where they accurately represent "
                "your actual experience."
            )
        )

    missing_responsibilities = [
        item["requirement"]
        for item in responsibility_items
        if item["status"] == "missing"
    ]

    if missing_responsibilities:
        findings.append(
            Finding(
                id="responsibilities-missing",
                severity="warning",
                category="Responsibilities",
                message=(
                    f"{len(missing_responsibilities)} "
                    "job responsibilities have no "
                    "clear evidence in the resume."
                ),
            )
        )

        recommendations.append(
            (
                "Strengthen experience bullets with "
                "concrete evidence for responsibilities "
                "that genuinely match your background."
            )
        )

    if partial_keywords:
        findings.append(
            Finding(
                id="skills-partial",
                severity="info",
                category="Required Skills",
                message=(
                    "Some job requirements have only "
                    "partial evidence in the resume."
                ),
            )
        )

    if role_score < 70:
        findings.append(
            Finding(
                id="role-alignment-low",
                severity="warning",
                category="Role Alignment",
                message=(
                    "The target role wording has "
                    "limited overlap with the resume "
                    "headline and experience titles."
                ),
            )
        )

        recommendations.append(
            (
                "Review the headline and relevant "
                "experience titles for accurate "
                "alignment with the target role."
            )
        )

    if experience_detail["status"] in {
        "partial",
        "missing",
        "missing_evidence",
    }:
        findings.append(
            Finding(
                id="experience-alignment",
                severity="warning",
                category="Experience",
                message=(
                    "The resume does not clearly "
                    "demonstrate the experience level "
                    "requested by the job description."
                ),
            )
        )

        recommendations.append(
            (
                "Make the duration and scope of "
                "relevant experience explicit where "
                "the resume supports it."
            )
        )

    if not education_items:
        findings.append(
            Finding(
                id="education-not-specified",
                severity="info",
                category="Education",
                message=(
                    "No explicit education requirement "
                    "was identified in the job description."
                ),
            )
        )

    if not certification_items:
        findings.append(
            Finding(
                id="certifications-not-specified",
                severity="info",
                category="Certifications",
                message=(
                    "No explicit certification requirement "
                    "was identified in the job description."
                ),
            )
        )

    if not recommendations:
        recommendations.append(
            (
                "The resume has evidence across the "
                "main requirements. Review the matched "
                "evidence and refine wording only where "
                "it remains factually accurate."
            )
        )

    total_keyword_requirements = (
        required_skill_items
        + preferred_skill_items
    )

    keyword_coverage = (
        round(
            len(matched_keywords)
            / len(total_keyword_requirements)
            * 100
        )
        if total_keyword_requirements
        else 100
    )

    return {
        "overall_score": weighted_score,
        "role_title": role_title,
        "category_scores": category_scores,
        "requirements": {
            "required_skills": required_skill_items,
            "preferred_skills": preferred_skill_items,
            "responsibilities": responsibility_items,
            "experience": experience_detail,
            "education": education_items,
            "certifications": certification_items,
        },
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "partial_keywords": partial_keywords,
        "keyword_coverage": keyword_coverage,
        "findings": [
            {
                "id": finding.id,
                "severity": finding.severity,
                "category": finding.category,
                "message": finding.message,
            }
            for finding in findings
        ],
        "recommendations": recommendations,
    }