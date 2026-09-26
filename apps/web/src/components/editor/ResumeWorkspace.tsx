"use client";

import { useEffect, useMemo, useState } from "react";

import { AtsScorePanel } from "@/components/ats/AtsScorePanel";
import { JdMatchPanel } from "@/components/matching/JdMatchPanel";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumeOverview } from "@/components/resume/ResumeOverview";
import { SectionOrderEditor } from "@/components/resume/SectionOrderEditor";
import { ExportActions } from "@/components/editor/ExportActions";
import { useEditor } from "@/lib/editor/EditorProvider";

import {
  DEFAULT_RESUME_SECTION_ORDER,
  RESUME_SECTION_ORDER_STORAGE_KEY,
  moveResumeSection,
  normalizeResumeSectionOrder,
  removeResumeSection,
  type ResumeSectionOrderItem,
} from "@/lib/resume/sectionOrder";

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

interface SectionDefinition {
  id: EditorSection;
  label: string;
  description: string;
}

const sections: SectionDefinition[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Identity and contact",
  },
  {
    id: "summary",
    label: "Summary",
    description: "Professional overview",
  },
  {
    id: "experience",
    label: "Experience",
    description: "Work history",
  },
  {
    id: "education",
    label: "Education",
    description: "Academic background",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Selected work",
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "Credentials",
  },
  {
    id: "languages",
    label: "Languages",
    description: "Language proficiency",
  },
  {
    id: "skills",
    label: "Skills",
    description: "Technical capabilities",
  },
  {
    id: "custom-sections",
    label: "Custom Sections",
    description: "Additional resume content",
  },
];

export function ResumeWorkspace() {
  const { state } = useEditor();

  const [activeSection, setActiveSection] =
    useState<EditorSection>("profile");

  const [sectionOrder, setSectionOrder] =
    useState<ResumeSectionOrderItem[]>(
      DEFAULT_RESUME_SECTION_ORDER,
    );

  useEffect(() => {
    try {
      const storedOrder =
        window.localStorage.getItem(
          RESUME_SECTION_ORDER_STORAGE_KEY,
        );

      if (storedOrder) {
        const parsedOrder = JSON.parse(
          storedOrder,
        );

        setSectionOrder(
          normalizeResumeSectionOrder(
            parsedOrder,
          ),
        );
      }
    } catch (error) {
      console.error(
        "Failed to restore resume section order:",
        error,
      );
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RESUME_SECTION_ORDER_STORAGE_KEY,
        JSON.stringify(
          sectionOrder.map(
            (section) => section.id,
          ),
        ),
      );
    } catch (error) {
      console.error(
        "Failed to save resume section order:",
        error,
      );
    }
  }, [sectionOrder]);

  const sectionCounts = useMemo(
    () => ({
      profile: state.resume.profile.name ? 1 : 0,
      summary: state.resume.summary.trim()
        ? 1
        : 0,
      experience:
        state.resume.experience.length,
      education:
        state.resume.education.length,
      projects:
        state.resume.projects.length,
      certifications:
        state.resume.certifications.length,
      languages:
        state.resume.languages.length,
      skills:
        state.resume.skills.categories.length,
      "custom-sections":
        state.resume.customSections.length,
    }),
    [state.resume],
  );

  const handleMoveSection = (
    index: number,
    targetIndex: number,
  ) => {
    setSectionOrder((currentOrder) =>
      moveResumeSection(
        currentOrder,
        index,
        targetIndex,
      ),
    );
  };

  const handleDeleteSection = (
    index: number,
  ) => {
    setSectionOrder((currentOrder) =>
      removeResumeSection(
        currentOrder,
        index,
      ),
    );
  };

  const handleResetSectionOrder = () => {
    setSectionOrder(
      DEFAULT_RESUME_SECTION_ORDER,
    );
  };

  const handleSectionSelect = (
    section: EditorSection,
  ) => {
    setActiveSection(section);
  };

  return (
    <div
      className="rf-page"
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
      }}
    >
      <div
        className="rf-shell"
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
        <header
          className="rf-header"
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <p className="rf-eyebrow"
               style={{
                margin: "0 0 4px",
                color: "#344054",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                lineHeight: 1.15,
               }}
            >
              ResumeForge
            </p>

            <h1 className="rf-title"
                style={{
                  margin: 0,
                  color: "#667085",
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}
              >
              Build your ATS-friendly Resume
            </h1>

            <p className="rf-subtitle">
              Build your resume section by section
              while keeping your finished resume
              visible.
            </p>
          </div>

          <ExportActions />
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "220px minmax(420px, 1fr) minmax(420px, 0.95fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* =================================================
              SECTION NAVIGATION
              ================================================= */}

          <aside
            className="rf-panel"
            style={{
              position: "sticky",
              top: "24px",
              overflow: "hidden",
            }}
          >
            <div className="rf-panel-header">
              <p className="rf-eyebrow">
                Resume Sections
              </p>

              <h2>Content</h2>

              <p>
                Select a section to edit it without
                leaving the workspace.
              </p>
            </div>

            <nav
              aria-label="Resume sections"
              style={{
                padding: "8px",
              }}
            >
              {sections.map((section) => {
                const isActive =
                  activeSection === section.id;

                const count =
                  sectionCounts[section.id];

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      handleSectionSelect(
                        section.id,
                      )
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                      padding: "11px 12px",
                      marginBottom: "4px",
                      border: "1px solid",
                      borderColor: isActive
                        ? "#c9d8d1"
                        : "transparent",
                      borderRadius: "10px",
                      background: isActive
                        ? "#edf3ef"
                        : "transparent",
                      color: isActive
                        ? "#30483f"
                        : "#46554f",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "0 1px 2px rgba(36, 49, 45, 0.04)"
                        : "none",
                      transition:
                        "background 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease",
                    }}
                    onMouseEnter={(event) => {
                      if (!isActive) {
                        event.currentTarget.style.background =
                          "#f5f7f5";
                        event.currentTarget.style.borderColor =
                          "#e2e8e4";
                      }
                    }}
                    onMouseLeave={(event) => {
                      if (!isActive) {
                        event.currentTarget.style.background =
                          "transparent";
                        event.currentTarget.style.borderColor =
                          "transparent";
                      }
                    }}
                    onFocus={(event) => {
                      event.currentTarget.style.outline =
                        "2px solid rgba(91, 124, 114, 0.22)";
                      event.currentTarget.style.outlineOffset =
                        "1px";
                    }}
                    onBlur={(event) => {
                      event.currentTarget.style.outline =
                        "none";
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        display: "grid",
                        gap: "2px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          lineHeight: 1.35,
                          letterSpacing:
                            "-0.005em",
                        }}
                      >
                        {section.label}
                      </strong>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          color: isActive
                            ? "#687a72"
                            : "#89948f",
                          lineHeight: 1.4,
                          whiteSpace:
                            "nowrap",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {section.description}
                      </span>
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        minWidth: "24px",
                        height: "24px",
                        padding: "0 7px",
                        display:
                          "inline-flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        borderRadius: "999px",
                        background: isActive
                          ? "#dce8e2"
                          : "#f1f4f2",
                        color: isActive
                          ? "#4f6f63"
                          : "#73817b",
                        fontSize: "11px",
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* =================================================
              ACTIVE EDITOR
              ================================================= */}

          <main
            style={{
              minWidth: 0,
            }}
          >
            <ResumeEditor
              activeSection={activeSection}
            />
          </main>

          {/* =================================================
              LIVE PREVIEW + SECTION ORDER
              ================================================= */}

          <aside
            className="rf-preview"
            style={{
              position: "sticky",
              top: "24px",
              minWidth: 0,
              display: "grid",
              gap: "20px",
              alignSelf: "start",
            }}
          >
            {/* =================================================
                LIVE PREVIEW PANEL
                ================================================= */}

            <div className="rf-panel">
              <div className="rf-panel-header">
                <p className="rf-eyebrow">
                  Live Preview
                </p>

                <h2>Your resume</h2>

                <p>
                  Changes appear here instantly
                  as you edit.
                </p>
              </div>

              <div
                className="rf-preview-sheet"
                style={{
                  maxHeight:
                    "calc(100vh - 190px)",
                  overflowY: "auto",
                }}
              >
                <ResumeOverview
                  resume={state.resume}
                />
              </div>
            </div>

            {/* =================================================
                SECTION ORDER PANEL
                ================================================= */}

            <div className="rf-panel">
              <SectionOrderEditor
                order={sectionOrder}
                onMove={handleMoveSection}
                onReset={
                  handleResetSectionOrder
                }
                onDelete={
                  handleDeleteSection
                }
              />
            </div>

            <div className="rf-panel">
              <AtsScorePanel />
            </div>

            <div className="rf-panel">
              <JdMatchPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}