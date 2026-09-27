import type { Resume } from "@resumeforge/resume-schema";

import { SafeRichText } from "@/components/resume/SafeRichText";

interface ResumePrintProps {
  resume: Resume;
}

export function ResumePrint({
  resume,
}: ResumePrintProps) {
  const { profile } = resume;

  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
  ].filter(Boolean);

  return (
    <article className="rf-print-resume">
      {/* =================================================
          HEADER
          ================================================= */}

      <header className="rf-print-header">
        <h1 className="rf-preview-name">
          {profile.name || "Your Name"}
        </h1>

        {profile.headline && (
          <p className="rf-preview-headline">
            {profile.headline}
          </p>
        )}

        {contactItems.length > 0 && (
          <div
            className="rf-preview-contact"
            style={{
              textAlign: "center",
            }}
          >
            {contactItems.join(" • ")}
          </div>
        )}

        {profile.links.length > 0 && (
          <div
            className="rf-preview-contact"
            style={{
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {profile.links.map((link, index) => (
              <span
                key={`${link.label}-${index}`}
              >
                {index > 0 ? " • " : ""}

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label || link.url}
                </a>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* =================================================
          PROFESSIONAL SUMMARY
          ================================================= */}

      {resume.summary && (
        <section className="rf-preview-section">
          <h3>Professional Summary</h3>

          <SafeRichText html={resume.summary} />
        </section>
      )}

      {/* =================================================
          EXPERIENCE
          ================================================= */}

      {resume.experience.length > 0 && (
        <section className="rf-preview-section">
          <h3>Experience</h3>

          {resume.experience.map((experience) => (
            <div
              key={experience.id}
              style={{
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "4px",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    color: "#2d3734",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {experience.title}
                </h4>

                {(experience.startDate ||
                  experience.endDate ||
                  experience.current) && (
                  <div
                    style={{
                      flexShrink: 0,
                      color: "#66736f",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {experience.startDate}

                    {experience.current
                      ? " – Present"
                      : experience.endDate
                      ? ` – ${experience.endDate}`
                      : ""}
                  </div>
                )}
              </div>

              <div
                style={{
                  color: "#66736f",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                {experience.company}

                {experience.location
                  ? ` • ${experience.location}`
                  : ""}
              </div>

              {experience.bullets.length > 0 && (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "18px",
                    color: "#394542",
                    fontSize: "13px",
                    lineHeight: 1.62,
                  }}
                >
                  {experience.bullets
                    .filter(Boolean)
                    .map((bullet, index) => (
                      <li key={index}>
                        <SafeRichText html={bullet} />
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* =================================================
          EDUCATION
          ================================================= */}

      {resume.education.length > 0 && (
        <section className="rf-preview-section">
          <h3>Education</h3>

          {resume.education.map((education) => (
            <div
              key={education.id}
              style={{
                marginBottom: "18px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 4px",
                  color: "#2d3734",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {education.degree}

                {education.field
                  ? `, ${education.field}`
                  : ""}
              </h4>

              <div
                style={{
                  color: "#66736f",
                  fontSize: "13px",
                }}
              >
                {education.institution}

                {education.location
                  ? ` • ${education.location}`
                  : ""}
              </div>

              {(education.startDate ||
                education.endDate) && (
                <div
                  style={{
                    marginTop: "3px",
                    color: "#7a8581",
                    fontSize: "13px",
                  }}
                >
                  {education.startDate}

                  {education.endDate
                    ? ` – ${education.endDate}`
                    : ""}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* =================================================
          PROJECTS
          ================================================= */}

      {resume.projects.length > 0 && (
        <section className="rf-preview-section">
          <h3>Projects</h3>

          {resume.projects.map((project) => (
            <div
              key={project.id}
              style={{
                marginBottom: "18px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 4px",
                  color: "#2d3734",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {project.name}
              </h4>

              {project.description && (
                <SafeRichText
                  html={project.description}
                  style={{
                    marginBottom: "6px",
                  }}
                />
              )}

              {project.technologies.length > 0 && (
                <div
                  style={{
                    marginBottom: "7px",
                    color: "#66736f",
                    fontSize: "13px",
                  }}
                >
                  {project.technologies.join(" • ")}
                </div>
              )}

              {project.bullets.length > 0 && (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "18px",
                    color: "#394542",
                    fontSize: "13px",
                    lineHeight: 1.62,
                  }}
                >
                  {project.bullets
                    .filter(Boolean)
                    .map((bullet, index) => (
                      <li key={index}>
                        <SafeRichText html={bullet} />
                      </li>
                    ))}
                </ul>
              )}

              {project.url && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#52756b",
                    fontSize: "13px",
                  }}
                >
                  {project.url}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* =================================================
          CERTIFICATIONS
          ================================================= */}

      {resume.certifications.length > 0 && (
        <section className="rf-preview-section">
          <h3>Certifications</h3>

          {resume.certifications.map(
            (certification) => (
              <div
                key={certification.id}
                style={{
                  marginBottom: "10px",
                  color: "#394542",
                  fontSize: "13px",
                }}
              >
                <strong>
                  {certification.name}
                </strong>

                {certification.issuer && (
                  <span>
                    {" "}
                    — {certification.issuer}
                  </span>
                )}

                {certification.date && (
                  <span>
                    {" "}
                    ({certification.date})
                  </span>
                )}
              </div>
            ),
          )}
        </section>
      )}

      {/* =================================================
          LANGUAGES
          ================================================= */}

      {resume.languages.length > 0 && (
        <section className="rf-preview-section">
          <h3>Languages</h3>

          <div
            style={{
              display: "grid",
              gap: "6px",
              color: "#394542",
              fontSize: "13px",
            }}
          >
            {resume.languages.map((language) => (
              <div key={language.id}>
                <strong>{language.name}</strong>

                {language.proficiency && (
                  <span>
                    {" "}
                    — {language.proficiency}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          SKILLS
          ================================================= */}

      {resume.skills.categories.length > 0 && (
        <section className="rf-preview-section">
          <h3>Skills</h3>

          <div
            style={{
              display: "grid",
              gap: "7px",
              color: "#394542",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {resume.skills.categories.map(
              (category) => (
                <div key={category.id}>
                  <strong>{category.name}</strong>

                  {category.items.length > 0 && (
                    <span>
                      {" "}
                      — {category.items.join(", ")}
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {/* =================================================
          CUSTOM SECTIONS
          ================================================= */}

      {resume.customSections.length > 0 &&
        resume.customSections.map((section) => (
          <section
            key={section.id}
            className="rf-preview-section"
          >
            <h3>{section.title}</h3>

            {section.items.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  color: "#394542",
                  fontSize: "13px",
                  lineHeight: 1.62,
                }}
              >
                {section.items
                  .filter(Boolean)
                  .map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
              </ul>
            )}
          </section>
        ))}
    </article>
  );
}