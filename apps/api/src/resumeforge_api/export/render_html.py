from html import escape

from ..models import Resume


def _text(value: str | None) -> str:
    return escape(value or "")


def _section_heading(title: str) -> str:
    return f"""
    <h2>{escape(title)}</h2>
    """


def resume_to_html(resume: Resume) -> str:
    profile = resume.profile

    contact_items = [
        profile.email,
        profile.phone,
        profile.location,
    ]

    contact_items = [
        item for item in contact_items if item
    ]

    links = [
        link.label or link.url
        for link in profile.links
        if link.label or link.url
    ]

    experience_html = ""

    if resume.experience:
        items = []

        for experience in resume.experience:
            dates = ""

            if experience.startDate:
                dates = experience.startDate

            if experience.current:
                dates = f"{dates} – Present"
            elif experience.endDate:
                dates = f"{dates} – {experience.endDate}"

            bullets = "".join(
                f"<li>{_text(bullet)}</li>"
                for bullet in experience.bullets
                if bullet.strip()
            )

            items.append(
                f"""
                <article class="item">
                    <div class="item-header">
                        <div>
                            <h3>{_text(experience.title)}</h3>
                            <div class="muted">
                                {_text(experience.company)}
                                {
                                    f" • {_text(experience.location)}"
                                    if experience.location
                                    else ""
                                }
                            </div>
                        </div>

                        {
                            f'<div class="date">{_text(dates)}</div>'
                            if dates
                            else ""
                        }
                    </div>

                    {
                        f'<ul>{bullets}</ul>'
                        if bullets
                        else ""
                    }
                </article>
                """
            )

        experience_html = (
            _section_heading("Experience")
            + "".join(items)
        )

    education_html = ""

    if resume.education:
        items = []

        for education in resume.education:
            degree = education.degree

            if education.field:
                degree = (
                    f"{degree}, {education.field}"
                    if degree
                    else education.field
                )

            dates = ""

            if education.startDate:
                dates = education.startDate

            if education.endDate:
                dates = (
                    f"{dates} – {education.endDate}"
                )

            items.append(
                f"""
                <article class="item">
                    <h3>{_text(degree or education.institution)}</h3>

                    {
                        f'<div class="muted">{_text(education.institution)}</div>'
                        if degree and education.institution
                        else ""
                    }

                    {
                        f'<div class="muted">{_text(education.location)}</div>'
                        if education.location
                        else ""
                    }

                    {
                        f'<div class="date">{_text(dates)}</div>'
                        if dates
                        else ""
                    }
                </article>
                """
            )

        education_html = (
            _section_heading("Education")
            + "".join(items)
        )

    projects_html = ""

    if resume.projects:
        items = []

        for project in resume.projects:
            bullets = "".join(
                f"<li>{_text(bullet)}</li>"
                for bullet in project.bullets
                if bullet.strip()
            )

            items.append(
                f"""
                <article class="item">
                    <h3>{_text(project.name)}</h3>

                    {
                        f'<p>{_text(project.description)}</p>'
                        if project.description
                        else ""
                    }

                    {
                        f'<ul>{bullets}</ul>'
                        if bullets
                        else ""
                    }

                    {
                        f'<div class="muted">{_text(project.url)}</div>'
                        if project.url
                        else ""
                    }
                </article>
                """
            )

        projects_html = (
            _section_heading("Projects")
            + "".join(items)
        )

    skills_html = ""

    if resume.skills.categories:
        items = []

        for category in resume.skills.categories:
            skills = ", ".join(
                item
                for item in category.items
                if item
            )

            if skills:
                items.append(
                    f"""
                    <div class="skill-row">
                        <strong>{_text(category.name)}:</strong>
                        {_text(skills)}
                    </div>
                    """
                )

        if items:
            skills_html = (
                _section_heading("Skills")
                + "".join(items)
            )

    certifications_html = ""

    if resume.certifications:
        items = []

        for certification in resume.certifications:
            metadata = []

            if certification.issuer:
                metadata.append(
                    certification.issuer
                )

            if certification.date:
                metadata.append(
                    certification.date
                )

            items.append(
                f"""
                <article class="item">
                    <h3>{_text(certification.name)}</h3>

                    {
                        f'<div class="muted">{_text(" • ".join(metadata))}</div>'
                        if metadata
                        else ""
                    }

                    {
                        f'<div class="muted">{_text(certification.url)}</div>'
                        if certification.url
                        else ""
                    }
                </article>
                """
            )

        certifications_html = (
            _section_heading("Certifications")
            + "".join(items)
        )

    languages_html = ""

    if resume.languages:
        items = []

        for language in resume.languages:
            items.append(
                f"""
                <div class="skill-row">
                    <strong>{_text(language.name)}</strong>
                    {
                        f" — {_text(language.proficiency)}"
                        if language.proficiency
                        else ""
                    }
                </div>
                """
            )

        languages_html = (
            _section_heading("Languages")
            + "".join(items)
        )

    custom_sections_html = ""

    for custom_section in resume.customSections:
        if not custom_section.title:
            continue

        custom_sections_html += (
            _section_heading(custom_section.title)
        )

        if custom_section.content:
            custom_sections_html += (
                f"<p>{_text(custom_section.content)}</p>"
            )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{_text(resume.metadata.title)}</title>

<style>
@page {{
    size: A4;
    margin: 16mm;
}}

* {{
    box-sizing: border-box;
}}

html,
body {{
    margin: 0;
    padding: 0;
}}

body {{
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    font-size: 10pt;
    line-height: 1.45;
}}

.resume {{
    width: 100%;
}}

.header {{
    text-align: center;
    margin-bottom: 18px;
}}

.name {{
    margin: 0;
    font-size: 23pt;
    line-height: 1.15;
    font-weight: 700;
}}

.headline {{
    margin: 5px 0 6px;
    font-size: 11pt;
    font-weight: 600;
}}

.contact {{
    font-size: 9pt;
    color: #4b5563;
}}

h2 {{
    margin: 16px 0 7px;
    padding-bottom: 3px;
    border-bottom: 1px solid #d1d5db;
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}}

h3 {{
    margin: 0 0 2px;
    font-size: 10pt;
}}

p {{
    margin: 0 0 6px;
}}

.item {{
    margin-bottom: 10px;
    break-inside: avoid;
}}

.item-header {{
    display: flex;
    justify-content: space-between;
    gap: 16px;
}}

.muted,
.date {{
    color: #4b5563;
    font-size: 9pt;
}}

.date {{
    white-space: nowrap;
}}

ul {{
    margin: 4px 0 0;
    padding-left: 18px;
}}

li {{
    margin-bottom: 2px;
}}

.skill-row {{
    margin-bottom: 4px;
    break-inside: avoid;
}}

@media print {{
    .item {{
        break-inside: avoid;
    }}
}}
</style>
</head>

<body>
<main class="resume">

<header class="header">
    <h1 class="name">
        {_text(profile.name or "Your Name")}
    </h1>

    {
        f'<div class="headline">{_text(profile.headline)}</div>'
        if profile.headline
        else ""
    }

    {
        f'<div class="contact">{" • ".join(_text(item) for item in contact_items)}</div>'
        if contact_items
        else ""
    }

    {
        f'<div class="contact">{" • ".join(_text(item) for item in links)}</div>'
        if links
        else ""
    }
</header>

{
    _section_heading("Professional Summary")
    + f'<p>{_text(resume.summary)}</p>'
    if resume.summary.strip()
    else ""
}

{experience_html}
{education_html}
{projects_html}
{skills_html}
{certifications_html}
{languages_html}
{custom_sections_html}

</main>
</body>
</html>
"""