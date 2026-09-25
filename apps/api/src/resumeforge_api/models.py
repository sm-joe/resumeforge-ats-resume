from pydantic import BaseModel, ConfigDict


class Link(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    url: str


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


class Resume(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schemaVersion: str
    metadata: ResumeMetadata
    profile: Profile
    summary: str = ""
    experience: list[Experience] = []
    education: list[Education] = []
    projects: list[Project] = []
    skills: Skills
    certifications: list[Certification] = []
    languages: list[Language] = []
    customSections: list[CustomSection] = []