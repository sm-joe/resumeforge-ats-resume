import type { Resume } from "@resumeforge/resume-schema";

export interface EditorState {
  resume: Resume;
  isDirty: boolean;
  lastSavedAt: string | null;
}

export type ResumeAction =
  | {
      type: "resume/replace";
      resume: Resume;
    }
  | {
      type: "resume/update";
      updater: (resume: Resume) => Resume;
    }

  | {
      type: "experience/add";
    }
  | {
      type: "experience/update";
      id: string;
      updater: (
        experience: Resume["experience"][number],
      ) => Resume["experience"][number];
    }
  | {
      type: "experience/remove";
      id: string;
    }
  | {
      type: "experience/add-bullet";
      id: string;
    }
  | {
      type: "experience/update-bullet";
      id: string;
      bulletIndex: number;
      value: string;
    }
  | {
      type: "experience/remove-bullet";
      id: string;
      bulletIndex: number;
    }

  | {
      type: "education/add";
    }
  | {
      type: "education/update";
      id: string;
      updater: (
        education: Resume["education"][number],
      ) => Resume["education"][number];
    }
  | {
      type: "education/remove";
      id: string;
    }

  | {
      type: "project/add";
    }
  | {
      type: "project/update";
      id: string;
      updater: (
        project: Resume["projects"][number],
      ) => Resume["projects"][number];
    }
  | {
      type: "project/remove";
      id: string;
    }
  | {
      type: "project/add-bullet";
      id: string;
    }
  | {
      type: "project/update-bullet";
      id: string;
      bulletIndex: number;
      value: string;
    }
  | {
      type: "project/remove-bullet";
      id: string;
      bulletIndex: number;
    }

  | {
      type: "certification/add";
    }
  | {
      type: "certification/update";
      id: string;
      updater: (
        certification: Resume["certifications"][number],
      ) => Resume["certifications"][number];
    }
  | {
      type: "certification/remove";
      id: string;
    }

  | {
      type: "language/add";
    }
  | {
      type: "language/update";
      id: string;
      updater: (
        language: Resume["languages"][number],
      ) => Resume["languages"][number];
    }
  | {
      type: "language/remove";
      id: string;
    }

  | {
      type: "skill-category/add";
    }
  | {
      type: "skill-category/update";
      id: string;
      updater: (
        category: Resume["skills"]["categories"][number],
      ) => Resume["skills"]["categories"][number];
    }
  | {
      type: "skill-category/remove";
      id: string;
    }
  | {
      type: "skill/add";
      categoryId: string;
    }
  | {
      type: "skill/update";
      categoryId: string;
      skillIndex: number;
      value: string;
    }
  | {
      type: "skill/remove";
      categoryId: string;
      skillIndex: number;
    }

  | {
      type: "editor/mark-saved";
      savedAt: string;
    }
  | {
      type: "editor/reset";
      resume: Resume;
    }
    | {
      type: "custom-section/add";
    }
  | {
      type: "custom-section/update";
      id: string;
      updater: (
        section: Resume["customSections"][number],
      ) => Resume["customSections"][number];
    }
  | {
      type: "custom-section/remove";
      id: string;
    }
  | {
      type: "custom-section/add-item";
      id: string;
    }
  | {
      type: "custom-section/update-item";
      id: string;
      itemIndex: number;
      value: string;
    }
  | {
      type: "custom-section/remove-item";
      id: string;
      itemIndex: number;
    };