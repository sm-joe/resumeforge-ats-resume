from types import SimpleNamespace

from resumeforge_analyzer.scorer import analyze_resume


def make_resume(**overrides):
    resume = SimpleNamespace(
        profile=SimpleNamespace(
            name="Alex Morgan",
            headline="Senior Cloud Architect",
            email="alex@example.com",
            phone="+1 555 010 1234",
            location="Berlin, Germany",
            links=[
                SimpleNamespace(
                    label="LinkedIn",
                    url="https://linkedin.com/in/alex",
                )
            ],
        ),
        summary=(
            "Senior Cloud Architect with extensive experience designing secure "
            "and scalable cloud platforms across AWS and Azure. Skilled in "
            "Kubernetes, Terraform, DevOps automation, cloud security, and "
            "reliable infrastructure engineering."
            ),
        experience=[
            SimpleNamespace(
                company="Example Cloud Systems",
                title="Senior Cloud Architect",
                location="Berlin",
                startDate="2022-03",
                endDate="",
                current=True,
                bullets=[
                    "Designed cloud infrastructure serving 2M users.",
                    "Reduced deployment time by 40%.",
                    "Automated infrastructure provisioning.",
                ],
            )
        ],
        education=[
            SimpleNamespace(
                institution="Example University",
                degree="BSc",
            )
        ],
        projects=[
            SimpleNamespace(
                name="Cloud Platform Modernization",
                description=(
                    "Designed and implemented a secure cloud platform."
                ),
                url="https://example.com/project",
                bullets=[
                    "Automated infrastructure provisioning with Terraform.",
                ],
            )
        ],
        skills=SimpleNamespace(
            categories=[
                SimpleNamespace(
                    name="Cloud",
                    items=[
                        "AWS",
                        "Azure",
                        "Kubernetes",
                        "Terraform",
                        "Python",
                        "Docker",
                        "Linux",
                        "Git",
                        "CI/CD",
                        "Security",
                    ],
                )
            ]
        ),
        certifications=[
            SimpleNamespace(
                name="AWS Certified Solutions Architect",
                issuer="Amazon Web Services",
            )
        ],
        languages=[
            SimpleNamespace(
                name="English",
                proficiency="Native",
            )
        ],
        customSections=[],
    )

    for key, value in overrides.items():
        setattr(resume, key, value)

    return resume


def test_complete_resume_scores_100():
    result = analyze_resume(make_resume())

    assert result.overall_score == 100
    assert len(result.category_scores) == 7


def test_missing_email_reduces_score():
    resume = make_resume()
    resume.profile.email = ""

    result = analyze_resume(resume)

    assert result.overall_score < 100
    assert any(
        finding.id == "profile-email-missing"
        for finding in result.findings
    )


def test_missing_experience_is_flagged():
    resume = make_resume()
    resume.experience = []

    result = analyze_resume(resume)

    assert any(
        finding.id == "experience-missing"
        for finding in result.findings
    )


def test_low_skill_count_is_flagged():
    resume = make_resume()

    resume.skills = SimpleNamespace(
        categories=[
            SimpleNamespace(
                name="Cloud",
                items=["AWS", "Terraform"],
            )
        ]
    )

    result = analyze_resume(resume)

    assert any(
        finding.id == "skills-low"
        for finding in result.findings
    )


def test_scoring_is_deterministic():
    resume = make_resume()

    first = analyze_resume(resume)
    second = analyze_resume(resume)

    assert first == second