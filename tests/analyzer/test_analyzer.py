from resumeforge_analyzer.analyzer import analyze


def test_analyze_basic_resume() -> None:
    resume = {
        "profile": {
            "name": "Jane Doe",
        },
        "experience": [
            {
                "company": "Example Corp",
            }
        ],
        "skills": [
            "AWS",
            "Terraform",
        ],
    }

    result = analyze(resume)

    assert result.score == 75
    assert "profile_present" in result.checks
    assert "experience_present" in result.checks
    assert "skills_present" in result.checks