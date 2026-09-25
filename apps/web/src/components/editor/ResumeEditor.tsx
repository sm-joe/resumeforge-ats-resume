"use client";

import type { ComponentType } from "react";

import { CertificationEditor } from "./sections/CertificationEditor";
import { CustomSectionEditor } from "./sections/CustomSectionEditor";
import { EducationEditor } from "./sections/EducationEditor";
import { ExperienceEditor } from "./sections/ExperienceEditor";
import { LanguageEditor } from "./sections/LanguageEditor";
import { ProfileEditor } from "./sections/ProfileEditor";
import { ProjectEditor } from "./sections/ProjectEditor";
import { SkillsEditor } from "./sections/SkillsEditor";
import { SummaryEditor } from "./sections/SummaryEditor";

type EditorSection =
  | "profile"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "languages"
  | "skills"
  | "custom-sections";

interface ResumeEditorProps {
  activeSection: EditorSection;
}

const sectionEditors: Record<
  EditorSection,
  ComponentType
> = {
  profile: ProfileEditor,
  summary: SummaryEditor,
  experience: ExperienceEditor,
  education: EducationEditor,
  projects: ProjectEditor,
  certifications: CertificationEditor,
  languages: LanguageEditor,
  skills: SkillsEditor,
  "custom-sections": CustomSectionEditor,
};

export function ResumeEditor({
  activeSection,
}: ResumeEditorProps) {
  const ActiveEditor =
    sectionEditors[activeSection];

  return (
    <section
      className="rf-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <header
        className="rf-panel-header"
        style={{
          flexShrink: 0,
        }}
      >
        <p className="rf-eyebrow">ResumeForge</p>

        <h2>Resume Editor</h2>

        <p>
          Edit the selected section. Your changes are
          reflected in the preview instantly.
        </p>
      </header>

      <div
        style={{
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <ActiveEditor />
      </div>
    </section>
  );
}