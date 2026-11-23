import { createElement } from "react";
import type { ResumeTemplateDefinition } from "./types";

import { ModernResume } from "@/components/templates/modern/ModernResume";
import { ResumeOverview } from "@/components/resume/ResumeOverview";
import type { ResumeTemplateProps } from "./types";

function ClassicResume({ resume }: ResumeTemplateProps) {
  return createElement(ResumeOverview, { resume: { ...resume, design: { ...resume.design, template: "classic" } } });
}
function MinimalResume({ resume }: ResumeTemplateProps) {
  return createElement(ResumeOverview, { resume: { ...resume, design: { ...resume.design, template: "minimal" } } });
}
function ExecutiveResume({ resume }: ResumeTemplateProps) {
  return createElement(ResumeOverview, { resume: { ...resume, design: { ...resume.design, template: "executive" } } });
}

export const resumeTemplates: ResumeTemplateDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description:
      "A clean, structured resume layout designed for readability and ATS compatibility.",
    component: ModernResume,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional typography and understated section dividers.",
    component: ClassicResume,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Condensed modern layout with subtle headings.",
    component: MinimalResume,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal high-contrast typography for experienced candidates.",
    component: ExecutiveResume,
  },
];

export const defaultTemplateId = "modern";

export function getResumeTemplate(
  templateId: string,
): ResumeTemplateDefinition {
  return (
    resumeTemplates.find(
      (template) => template.id === templateId,
    ) ??
    resumeTemplates.find(
      (template) =>
        template.id === defaultTemplateId,
    )!
  );
}