from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, field_validator


def _safe_public_url(value: str) -> str:
    if not value:
        return value
    if any(ord(character) < 32 for character in value):
        raise ValueError("URL contains invalid control characters")
    parsed = urlsplit(value)
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname:
        raise ValueError("Only absolute HTTP or HTTPS links are accepted")
    if parsed.username is not None or parsed.password is not None:
        raise ValueError("Embedded URL credentials are not permitted")
    return value


class Link(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not value:
            raise ValueError("Link URL is required")
        return _safe_public_url(value)


class Profile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    headline: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[Link] = []


class Experience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    company: str
    title: str
    location: str | None = None
    startDate: str
    endDate: str | None = None
    current: bool = False
    bullets: list[str] = []


class Education(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    institution: str
    degree: str
    field: str | None = None
    location: str | None = None
    startDate: str | None = None
    endDate: str | None = None


class Project(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    description: str | None = None
    url: str | None = None
    technologies: list[str] = []

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return _safe_public_url(value) if value is not None else None
    bullets: list[str] = []


class SkillCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    items: list[str] = []


class Skills(BaseModel):
    model_config = ConfigDict(extra="forbid")

    categories: list[SkillCategory] = []


class Certification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    issuer: str | None = None
    date: str | None = None
    url: str | None = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return _safe_public_url(value) if value is not None else None


class Language(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    proficiency: str | None = None


class CustomSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    items: list[str] = []


class ResumeMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    updatedAt: str
    revision: int | None = None


class ResumeDesign(BaseModel):
    model_config = ConfigDict(extra="forbid")

    template: str = "modern"
    pageSize: str = "A4"
    fontFamily: str = "Inter"
    accentColor: str = "#24312d"
    spacing: str = "comfortable"


class Resume(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schemaVersion: str
    metadata: ResumeMetadata
    design: ResumeDesign = ResumeDesign()
    profile: Profile
    summary: str = ""
    experience: list[Experience] = []
    education: list[Education] = []
    projects: list[Project] = []
    skills: Skills
    certifications: list[Certification] = []
    languages: list[Language] = []
    customSections: list[CustomSection] = []