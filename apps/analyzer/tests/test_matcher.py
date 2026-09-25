from dataclasses import dataclass, field

from resumeforge_analyzer import match_job_description


@dataclass
class Profile:
    name: str = "Jane Doe"
    headline: str = "Senior Cloud Security Engineer"
    email: str = "jane@example.com"
    location: str = "Remote"
    links: list = field(default_factory=list)


@dataclass
class Experience:
    company: str
    title: str
    location: str = ""
    startDate: str = "2020"
    endDate: str = "2025"
    bullets: list[str] = field(default_factory=list)


@dataclass
class Education:
    institution: str
    degree: str
    field: str = ""
    location: str = ""


@dataclass
class Project:
    name: str
    description: str = ""
    url: str = ""
    technologies: list[str] = field(default_factory=list)
    bullets: list[str] = field(default_factory=list)


@dataclass
class SkillCategory:
    name: str
    items: list[str]


@dataclass
class Skills:
    categories: list[SkillCategory]


@dataclass
class Certification:
    name: str
    issuer: str = ""
    date: str = ""


@dataclass
class Language:
    name: str
    proficiency: str


@dataclass
class CustomSection:
    title: str
    items: list[str]


@dataclass
class Resume:
    profile: Profile
    summary: str
    experience: list[Experience]
    education: list[Education]
    projects: list[Project]
    skills: Skills
    certifications: list[Certification]
    languages: list[Language]
    customSections: list[CustomSection]


def make_resume() -> Resume:
    return Resume(
        profile=Profile(),
        summary=(
            "Senior Cloud Security Engineer with extensive experience "
            "building secure AWS infrastructure and automated platforms."
        ),
        experience=[
            Experience(
                company="Example Corp",
                title="Senior Cloud Security Engineer",
                bullets=[
                    "Designed secure AWS multi-account architecture.",
                    "Built Terraform modules for cloud infrastructure.",
                    "Managed Kubernetes and EKS platforms.",
                    "Implemented CI/CD security automation.",
                ],
            )
        ],
        education=[
            Education(
                institution="Example University",
                degree="Bachelor's",
                field="Computer Science",
            )
        ],
        projects=[],
        skills=Skills(
            categories=[
                SkillCategory(
                    name="Cloud",
                    items=[
                        "AWS",
                        "Terraform",
                        "Kubernetes",
                        "EKS",
                        "IAM",
                        "Python",
                    ],
                )
            ]
        ),
        certifications=[
            Certification(
                name="AWS Certified Security",
                issuer="AWS",
            )
        ],
        languages=[],
        customSections=[],
    )


def test_match_returns_structured_alignment():
    resume = make_resume()

    job_description = """
    Senior Cloud Security Engineer

    Required Skills:
    AWS
    Terraform
    Kubernetes
    IAM
    Python
    Docker

    Responsibilities:
    Design secure cloud infrastructure.
    Manage Kubernetes platforms.
    Implement CI/CD security automation.

    Required: 5 years of experience.
    """

    result = match_job_description(resume, job_description)

    assert result["overall_score"] > 0
    assert result["role_title"]
    assert result["category_scores"]
    assert "required_skills" in result["requirements"]
    assert "responsibilities" in result["requirements"]
    assert "experience" in result["requirements"]
    assert "AWS" in result["matched_keywords"]
    assert "Docker" in result["missing_keywords"]


def test_match_identifies_evidence():
    resume = make_resume()

    result = match_job_description(
        resume,
        """
        Senior Cloud Security Engineer

        Required:
        AWS
        Terraform
        Kubernetes
        """,
    )

    aws_requirement = next(
        item
        for item in result["requirements"]["required_skills"]
        if item["term"] == "AWS"
    )

    assert aws_requirement["status"] == "matched"
    assert aws_requirement["evidence"]


def test_match_identifies_missing_responsibilities():
    resume = make_resume()

    result = match_job_description(
        resume,
        """
        Senior Cloud Security Engineer

        Responsibilities:
        Design AWS infrastructure.
        Lead incident response operations.
        """,
    )

    responsibilities = result["requirements"]["responsibilities"]

    assert any(
        item["status"] == "missing"
        for item in responsibilities
    )


def test_match_identifies_experience():
    resume = make_resume()

    result = match_job_description(
        resume,
        """
        Senior Cloud Security Engineer

        Required:
        AWS
        Terraform

        At least 5 years of experience.
        """,
    )

    experience = result["requirements"]["experience"]

    assert experience["required_years"] == 5
    assert experience["resume_years"] == 5
    assert experience["status"] == "matched"


def test_empty_job_description_returns_error():
    resume = make_resume()

    result = match_job_description(resume, "")

    assert result["overall_score"] == 0
    assert result["findings"][0]["severity"] == "error"


def test_match_is_deterministic():
    resume = make_resume()

    job_description = """
    Senior Cloud Security Engineer
    AWS Terraform Kubernetes Python
    """

    first = match_job_description(resume, job_description)
    second = match_job_description(resume, job_description)

    assert first == second