"use client";

import { useState } from "react";

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

import { useEditor } from "@/lib/editor/EditorProvider";

type ExportFormat = "pdf" | "word";

function getPdfFilename(resume: {
  profile: {
    headline?: string;
  };
  metadata: {
    title?: string;
  };
}) {
  const preferredName =
    resume.profile.headline?.trim() ||
    resume.metadata.title?.trim() ||
    "ResumeForge Resume";

  const filename = preferredName
    .replace(/[^a-zA-Z0-9]+/g, "")
    .trim();

  return filename || "ResumeForgeResume";
}

function richTextToPlainText(value: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>\s*<li>/gi, "\n• ")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 32,
    paddingLeft: 38,
    paddingRight: 38,
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
  },

  header: {
    alignItems: "center",
    marginBottom: 11,
  },

  name: {
    fontSize: 21,
    lineHeight: 1.15,
    fontWeight: 700,
    marginBottom: 4,
  },

  headline: {
    fontSize: 10.5,
    lineHeight: 1.25,
    fontWeight: 600,
    marginBottom: 5,
  },

  contact: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#4b5563",
    textAlign: "center",
  },

  section: {
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 10.5,
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#1f2937",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingBottom: 3,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  summary: {
    fontSize: 9.5,
    lineHeight: 1.45,
  },

  item: {
    marginBottom: 6,
  },

  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  itemMain: {
    flexGrow: 1,
    flexShrink: 1,
  },

  itemTitle: {
    fontSize: 9.5,
    lineHeight: 1.25,
    fontWeight: 700,
    marginBottom: 2,
  },

  muted: {
    fontSize: 8.5,
    lineHeight: 1.3,
    color: "#4b5563",
  },

  date: {
    fontSize: 8.5,
    lineHeight: 1.3,
    color: "#4b5563",
    textAlign: "right",
    flexShrink: 0,
  },

  bulletList: {
    marginTop: 3,
    paddingLeft: 11,
  },

  bullet: {
    fontSize: 9,
    lineHeight: 1.35,
    marginBottom: 1,
  },

  paragraph: {
    fontSize: 9,
    lineHeight: 1.42,
    marginBottom: 4,
  },

  skillRow: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 3,
  },

  skillName: {
    fontWeight: 700,
  },

  certification: {
    marginBottom: 4,
  },

  language: {
    marginBottom: 3,
    fontSize: 9,
    lineHeight: 1.4,
  },

  link: {
    color: "#1d4ed8",
    textDecoration: "none",
  },
});

function splitBullets(value: string) {
  const text = richTextToPlainText(value);

  if (!text) {
    return [];
  }

  return text
    .split(/\n/)
    .map((item) => item.replace(/^•\s*/, "").trim())
    .filter(Boolean);
}

function PdfSectionTitle({
  children,
}: {
  children: string;
}) {
  return (
    <Text style={pdfStyles.sectionTitle}>
      {children}
    </Text>
  );
}

function ResumePdfDocument({
  resume,
}: {
  resume: any;
}) {
  const contactItems = [
    resume.profile.email,
    resume.profile.phone,
    resume.profile.location,
  ].filter(Boolean);

  const links = resume.profile.links || [];

  return (
    <Document
      title={
        resume.metadata.title ||
        "ResumeForge Resume"
      }
      author="ResumeForge"
    >
      <Page
        size="A4"
        style={pdfStyles.page}
        wrap
      >
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.name}>
            {resume.profile.name || "Your Name"}
          </Text>

          {resume.profile.headline && (
            <Text style={pdfStyles.headline}>
              {resume.profile.headline}
            </Text>
          )}

          {contactItems.length > 0 && (
            <Text style={pdfStyles.contact}>
              {contactItems.join(" • ")}
            </Text>
          )}

          {links.length > 0 && (
            <Text style={pdfStyles.contact}>
              {links
                .filter(
                  (link: any) =>
                    link.label || link.url,
                )
                .map(
                  (link: any) =>
                    link.label || link.url,
                )
                .join(" • ")}
            </Text>
          )}
        </View>

        {resume.summary?.trim() && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Professional Summary
            </PdfSectionTitle>

            <Text style={pdfStyles.summary}>
              {richTextToPlainText(
                resume.summary,
              )}
            </Text>
          </View>
        )}

        {resume.experience?.length > 0 && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Experience
            </PdfSectionTitle>

            {resume.experience.map(
              (experience: any, index: number) => {
                let dates = "";

                if (experience.startDate) {
                  dates = experience.startDate;
                }

                if (experience.current) {
                  dates = `${dates} – Present`;
                } else if (experience.endDate) {
                  dates = `${dates} – ${experience.endDate}`;
                }

                return (
                  <View
                    key={`experience-${index}`}
                    style={pdfStyles.item}
                  >
                    <View
                      style={pdfStyles.itemHeader}
                    >
                      <View
                        style={pdfStyles.itemMain}
                      >
                        <Text
                          style={pdfStyles.itemTitle}
                        >
                          {experience.title}
                        </Text>

                        {(experience.company ||
                          experience.location) && (
                          <Text
                            style={pdfStyles.muted}
                          >
                            {[
                              experience.company,
                              experience.location,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </Text>
                        )}
                      </View>

                      {dates && (
                        <Text
                          style={pdfStyles.date}
                        >
                          {dates}
                        </Text>
                      )}
                    </View>

                    {experience.bullets
                      ?.length > 0 && (
                      <View
                        style={
                          pdfStyles.bulletList
                        }
                      >
                        {experience.bullets.map(
                          (
                            bullet: string,
                            bulletIndex: number,
                          ) =>
                            splitBullets(
                              bullet,
                            ).map(
                              (
                                item,
                                itemIndex,
                              ) => (
                                <Text
                                  key={`experience-${index}-${bulletIndex}-${itemIndex}`}
                                  style={
                                    pdfStyles.bullet
                                  }
                                >
                                  • {item}
                                </Text>
                              ),
                            ),
                        )}
                      </View>
                    )}
                  </View>
                );
              },
            )}
          </View>
        )}

        {resume.education?.length > 0 && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Education
            </PdfSectionTitle>

            {resume.education.map(
              (education: any, index: number) => {
                let degree =
                  education.degree || "";

                if (education.field) {
                  degree = degree
                    ? `${degree}, ${education.field}`
                    : education.field;
                }

                let dates = "";

                if (education.startDate) {
                  dates = education.startDate;
                }

                if (education.endDate) {
                  dates = dates
                    ? `${dates} – ${education.endDate}`
                    : education.endDate;
                }

                return (
                  <View
                    key={`education-${index}`}
                    style={pdfStyles.item}
                  >
                    <Text
                      style={pdfStyles.itemTitle}
                    >
                      {degree ||
                        education.institution}
                    </Text>

                    {education.institution &&
                      degree && (
                        <Text
                          style={
                            pdfStyles.muted
                          }
                        >
                          {education.institution}
                          {education.location
                            ? ` • ${education.location}`
                            : ""}
                        </Text>
                      )}

                    {!degree &&
                      education.location && (
                        <Text
                          style={
                            pdfStyles.muted
                          }
                        >
                          {education.location}
                        </Text>
                      )}

                    {dates && (
                      <Text
                        style={pdfStyles.muted}
                      >
                        {dates}
                      </Text>
                    )}
                  </View>
                );
              },
            )}
          </View>
        )}

        {resume.projects?.length > 0 && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Projects
            </PdfSectionTitle>

            {resume.projects.map(
              (project: any, index: number) => (
                <View
                  key={`project-${index}`}
                  style={pdfStyles.item}
                >
                  <Text
                    style={pdfStyles.itemTitle}
                  >
                    {project.name}
                  </Text>

                  {project.description && (
                    <Text
                      style={pdfStyles.paragraph}
                    >
                      {richTextToPlainText(
                        project.description,
                      )}
                    </Text>
                  )}

                  {project.bullets?.length >
                    0 && (
                    <View
                      style={
                        pdfStyles.bulletList
                      }
                    >
                      {project.bullets.map(
                        (
                          bullet: string,
                          bulletIndex: number,
                        ) =>
                          splitBullets(
                            bullet,
                          ).map(
                            (
                              item,
                              itemIndex,
                            ) => (
                              <Text
                                key={`project-${index}-${bulletIndex}-${itemIndex}`}
                                style={
                                  pdfStyles.bullet
                                }
                              >
                                • {item}
                              </Text>
                            ),
                          ),
                      )}
                    </View>
                  )}

                  {project.url && (
                    <Link
                      src={project.url}
                      style={[
                        pdfStyles.muted,
                        pdfStyles.link,
                      ]}
                    >
                      {project.url}
                    </Link>
                  )}
                </View>
              ),
            )}
          </View>
        )}

        {resume.certifications?.length > 0 && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Certifications
            </PdfSectionTitle>

            {resume.certifications.map(
              (
                certification: any,
                index: number,
              ) => (
                <View
                  key={`certification-${index}`}
                  style={pdfStyles.certification}
                >
                  <Text
                    style={pdfStyles.itemTitle}
                  >
                    {certification.name}
                  </Text>

                  {(certification.issuer ||
                    certification.date) && (
                    <Text
                      style={pdfStyles.muted}
                    >
                      {[
                        certification.issuer,
                        certification.date,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </Text>
                  )}

                  {certification.url && (
                    <Link
                      src={certification.url}
                      style={[
                        pdfStyles.muted,
                        pdfStyles.link,
                      ]}
                    >
                      {certification.url}
                    </Link>
                  )}
                </View>
              ),
            )}
          </View>
        )}

        {resume.languages?.length > 0 && (
          <View style={pdfStyles.section}>
            <PdfSectionTitle>
              Languages
            </PdfSectionTitle>

            {resume.languages.map(
              (
                language: any,
                index: number,
              ) => (
                <Text
                  key={`language-${index}`}
                  style={pdfStyles.language}
                >
                  <Text
                    style={pdfStyles.skillName}
                  >
                    {language.name}
                  </Text>

                  {language.proficiency
                    ? ` — ${language.proficiency}`
                    : ""}
                </Text>
              ),
            )}
          </View>
        )}

        {resume.skills?.categories?.length >
          0 && (
          <View style={pdfStyles.section} wrap>
            <PdfSectionTitle>
              Skills
            </PdfSectionTitle>

            {resume.skills.categories.map(
              (
                category: any,
                index: number,
              ) => {
                const items =
                  category.items?.filter(
                    (item: string) =>
                      item?.trim(),
                  ) || [];

                if (!items.length) {
                  return null;
                }

                return (
                  <Text
                    key={`skill-${index}`}
                    style={pdfStyles.skillRow}
                    wrap
                  >
                    <Text
                      style={
                        pdfStyles.skillName
                      }
                    >
                      {category.name}:
                    </Text>{" "}
                    {items.join(", ")}
                  </Text>
                );
              },
            )}
          </View>
        )}

        {resume.customSections?.map(
          (
            customSection: any,
            index: number,
          ) => {
            if (!customSection.title) {
              return null;
            }

            return (
              <View
                key={`custom-${index}`}
                style={pdfStyles.section}
              >
                <PdfSectionTitle>
                  {customSection.title}
                </PdfSectionTitle>

                {customSection.content && (
                  <Text
                    style={pdfStyles.paragraph}
                  >
                    {richTextToPlainText(
                      customSection.content,
                    )}
                  </Text>
                )}
              </View>
            );
          },
        )}
      </Page>
    </Document>
  );
}

export function ExportActions() {
  const { state } = useEditor();

  const [exporting, setExporting] =
    useState<ExportFormat | null>(null);

  const [error, setError] = useState("");

  const handlePdfExport = async () => {
    setExporting("pdf");
    setError("");

    try {
      const filename =
        `${getPdfFilename(state.resume)}.pdf`;

      const pdfBlob = await pdf(
        <ResumePdfDocument
          resume={state.resume}
        />,
      ).toBlob();

      const url =
        URL.createObjectURL(pdfBlob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "PDF export failed.",
      );
    } finally {
      setExporting(null);
    }
  };

  const handleWordExport = async () => {
    setExporting("word");
    setError("");

    try {
      const response = await fetch(
        "/api/export/word",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state.resume),
        },
      );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => null);

        throw new Error(
          payload?.detail ||
            `Export failed with status ${response.status}`,
        );
      }

      const blob = await response.blob();

      const contentDisposition =
        response.headers.get(
          "Content-Disposition",
        );

      const filenameMatch =
        contentDisposition?.match(
          /filename="?([^"]+)"?/i,
        );

      const filename =
        filenameMatch?.[1] ||
        `${
          state.resume.metadata.title ||
          "resumeforge-resume"
        }.docx`;

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Word export failed.",
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={handlePdfExport}
        disabled={exporting !== null}
        style={{
          padding: "9px 14px",
          border: "1px solid #4545b8",
          borderRadius: "9px",
          background: "#4545b8",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 650,
          cursor:
            exporting !== null
              ? "not-allowed"
              : "pointer",
          opacity:
            exporting !== null ? 0.65 : 1,
        }}
      >
        {exporting === "pdf"
          ? "Preparing PDF..."
          : "Export PDF"}
      </button>

      <button
        type="button"
        onClick={handleWordExport}
        disabled={exporting !== null}
        style={{
          padding: "9px 14px",
          border: "1px solid #4545b8",
          borderRadius: "9px",
          background: "#4545b8",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 650,
          cursor:
            exporting !== null
              ? "not-allowed"
              : "pointer",
          opacity:
            exporting !== null ? 0.65 : 1,
        }}
      >
        {exporting === "word"
          ? "Exporting Word..."
          : "Export Word"}
      </button>

      {error && (
        <span
          role="alert"
          style={{
            width: "100%",
            color: "#b42318",
            fontSize: "12px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}