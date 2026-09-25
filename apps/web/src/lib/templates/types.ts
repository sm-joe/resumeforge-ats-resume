import type { ComponentType } from "react";

import type { Resume } from "@resumeforge/resume-schema";

export interface ResumeTemplateProps {
  resume: Resume;
}

export interface ResumeTemplateDefinition {
  id: string;
  name: string;
  description: string;
  component: ComponentType<ResumeTemplateProps>;
}