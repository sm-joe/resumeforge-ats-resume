import type { ResumeTemplateDefinition } from "./types";

import { ModernResume } from "@/components/templates/modern/ModernResume";

export const resumeTemplates: ResumeTemplateDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description:
      "A clean, structured resume layout designed for readability and ATS compatibility.",
    component: ModernResume,
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