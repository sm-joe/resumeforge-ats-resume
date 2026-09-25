import type { Resume } from "@resumeforge/resume-schema";

import type { EditorState, ResumeAction } from "./types";

export function editorReducer(
  state: EditorState,
  action: ResumeAction,
): EditorState {
  switch (action.type) {
    /* =====================================================
       RESUME
       ===================================================== */

    case "resume/replace":
      return {
        ...state,
        resume: action.resume,
        isDirty: true,
      };

    case "resume/update":
      return {
        ...state,
        resume: action.updater(state.resume),
        isDirty: true,
      };

    /* =====================================================
       EXPERIENCE
       ===================================================== */

    case "experience/add": {
      const newExperience: Resume["experience"][number] = {
        id: crypto.randomUUID(),
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: [""],
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: [
            ...state.resume.experience,
            newExperience,
          ],
        },
      };
    }

    case "experience/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: state.resume.experience.map(
            (experience) =>
              experience.id === action.id
                ? action.updater(experience)
                : experience,
          ),
        },
      };

    case "experience/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: state.resume.experience.filter(
            (experience) =>
              experience.id !== action.id,
          ),
        },
      };

    case "experience/add-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: state.resume.experience.map(
            (experience) =>
              experience.id === action.id
                ? {
                    ...experience,
                    bullets: [
                      ...experience.bullets,
                      "",
                    ],
                  }
                : experience,
          ),
        },
      };

    case "experience/update-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: state.resume.experience.map(
            (experience) =>
              experience.id === action.id
                ? {
                    ...experience,
                    bullets: experience.bullets.map(
                      (bullet, index) =>
                        index === action.bulletIndex
                          ? action.value
                          : bullet,
                    ),
                  }
                : experience,
          ),
        },
      };

    case "experience/remove-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          experience: state.resume.experience.map(
            (experience) =>
              experience.id === action.id
                ? {
                    ...experience,
                    bullets:
                      experience.bullets.filter(
                        (_, index) =>
                          index !==
                          action.bulletIndex,
                      ),
                  }
                : experience,
          ),
        },
      };

    /* =====================================================
       EDUCATION
       ===================================================== */

    case "education/add": {
      const newEducation: Resume["education"][number] = {
        id: crypto.randomUUID(),
        institution: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          education: [
            ...state.resume.education,
            newEducation,
          ],
        },
      };
    }

    case "education/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          education: state.resume.education.map(
            (education) =>
              education.id === action.id
                ? action.updater(education)
                : education,
          ),
        },
      };

    case "education/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          education: state.resume.education.filter(
            (education) =>
              education.id !== action.id,
          ),
        },
      };

    /* =====================================================
       PROJECTS
       ===================================================== */

    case "project/add": {
      const newProject: Resume["projects"][number] = {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        url: "",
        technologies: [],
        bullets: [""],
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: [
            ...state.resume.projects,
            newProject,
          ],
        },
      };
    }

    case "project/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: state.resume.projects.map(
            (project) =>
              project.id === action.id
                ? action.updater(project)
                : project,
          ),
        },
      };

    case "project/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: state.resume.projects.filter(
            (project) =>
              project.id !== action.id,
          ),
        },
      };

    case "project/add-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: state.resume.projects.map(
            (project) =>
              project.id === action.id
                ? {
                    ...project,
                    bullets: [
                      ...project.bullets,
                      "",
                    ],
                  }
                : project,
          ),
        },
      };

    case "project/update-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: state.resume.projects.map(
            (project) =>
              project.id === action.id
                ? {
                    ...project,
                    bullets: project.bullets.map(
                      (bullet, index) =>
                        index === action.bulletIndex
                          ? action.value
                          : bullet,
                    ),
                  }
                : project,
          ),
        },
      };

    case "project/remove-bullet":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          projects: state.resume.projects.map(
            (project) =>
              project.id === action.id
                ? {
                    ...project,
                    bullets:
                      project.bullets.filter(
                        (_, index) =>
                          index !==
                          action.bulletIndex,
                      ),
                  }
                : project,
          ),
        },
      };

    /* =====================================================
       CERTIFICATIONS
       ===================================================== */

    case "certification/add": {
      const newCertification: Resume["certifications"][number] = {
        id: crypto.randomUUID(),
        name: "",
        issuer: "",
        date: "",
        url: "",
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          certifications: [
            ...state.resume.certifications,
            newCertification,
          ],
        },
      };
    }

    case "certification/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          certifications:
            state.resume.certifications.map(
              (certification) =>
                certification.id === action.id
                  ? action.updater(certification)
                  : certification,
            ),
        },
      };

    case "certification/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          certifications:
            state.resume.certifications.filter(
              (certification) =>
                certification.id !== action.id,
            ),
        },
      };

    /* =====================================================
       LANGUAGES
       ===================================================== */

    case "language/add": {
      const newLanguage: Resume["languages"][number] = {
        id: crypto.randomUUID(),
        name: "",
        proficiency: "",
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          languages: [
            ...state.resume.languages,
            newLanguage,
          ],
        },
      };
    }

    case "language/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          languages: state.resume.languages.map(
            (language) =>
              language.id === action.id
                ? action.updater(language)
                : language,
          ),
        },
      };

    case "language/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          languages: state.resume.languages.filter(
            (language) =>
              language.id !== action.id,
          ),
        },
      };

    /* =====================================================
       SKILLS
       ===================================================== */

    case "skill-category/add": {
      const newCategory: Resume["skills"]["categories"][number] = {
        id: crypto.randomUUID(),
        name: "",
        items: [""],
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories: [
              ...state.resume.skills.categories,
              newCategory,
            ],
          },
        },
      };
    }

    case "skill-category/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories:
              state.resume.skills.categories.map(
                (category) =>
                  category.id === action.id
                    ? action.updater(category)
                    : category,
              ),
          },
        },
      };

    case "skill-category/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories:
              state.resume.skills.categories.filter(
                (category) =>
                  category.id !== action.id,
              ),
          },
        },
      };

    case "skill/add":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories:
              state.resume.skills.categories.map(
                (category) =>
                  category.id === action.categoryId
                    ? {
                        ...category,
                        items: [
                          ...category.items,
                          "",
                        ],
                      }
                    : category,
              ),
          },
        },
      };

    case "skill/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories:
              state.resume.skills.categories.map(
                (category) =>
                  category.id === action.categoryId
                    ? {
                        ...category,
                        items: category.items.map(
                          (item, index) =>
                            index ===
                            action.skillIndex
                              ? action.value
                              : item,
                        ),
                      }
                    : category,
              ),
          },
        },
      };

    case "skill/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          skills: {
            ...state.resume.skills,
            categories:
              state.resume.skills.categories.map(
                (category) =>
                  category.id === action.categoryId
                    ? {
                        ...category,
                        items: category.items.filter(
                          (_, index) =>
                            index !==
                            action.skillIndex,
                        ),
                      }
                    : category,
              ),
          },
        },
      };

      /* =====================================================
       CUSTOM SECTIONS
       ===================================================== */

    case "custom-section/add": {
      const newSection: Resume["customSections"][number] = {
        id: crypto.randomUUID(),
        title: "",
        items: [""],
      };

      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections: [
            ...state.resume.customSections,
            newSection,
          ],
        },
      };
    }

    case "custom-section/update":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections:
            state.resume.customSections.map(
              (section) =>
                section.id === action.id
                  ? action.updater(section)
                  : section,
            ),
        },
      };

    case "custom-section/remove":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections:
            state.resume.customSections.filter(
              (section) =>
                section.id !== action.id,
            ),
        },
      };

    case "custom-section/add-item":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections:
            state.resume.customSections.map(
              (section) =>
                section.id === action.id
                  ? {
                      ...section,
                      items: [
                        ...section.items,
                        "",
                      ],
                    }
                  : section,
            ),
        },
      };

    case "custom-section/update-item":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections:
            state.resume.customSections.map(
              (section) =>
                section.id === action.id
                  ? {
                      ...section,
                      items: section.items.map(
                        (item, index) =>
                          index === action.itemIndex
                            ? action.value
                            : item,
                      ),
                    }
                  : section,
            ),
        },
      };

    case "custom-section/remove-item":
      return {
        ...state,
        isDirty: true,
        resume: {
          ...state.resume,
          customSections:
            state.resume.customSections.map(
              (section) =>
                section.id === action.id
                  ? {
                      ...section,
                      items: section.items.filter(
                        (_, index) =>
                          index !== action.itemIndex,
                      ),
                    }
                  : section,
            ),
        },
      };

    /* =====================================================
       EDITOR STATE
       ===================================================== */

    case "editor/mark-saved":
      return {
        ...state,
        isDirty: false,
        lastSavedAt: action.savedAt,
      };

    case "editor/reset":
      return {
        resume: action.resume,
        isDirty: false,
        lastSavedAt: null,
      };

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}