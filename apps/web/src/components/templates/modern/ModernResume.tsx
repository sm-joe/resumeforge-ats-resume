import type { Resume } from "@resumeforge/resume-schema";

import type { ResumeTemplateProps } from "@/lib/templates/types";

interface ModernResumeProps extends ResumeTemplateProps {
  className?: string;
}

export function ModernResume({
  resume,
  className,
}: ModernResumeProps) {
  const { profile } = resume;

  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
  ].filter(Boolean);

  const visibleLinks = profile.links.filter(
    (link) => link.label?.trim() || link.url?.trim(),
  );

  const visibleExperience = resume.experience.filter(
    (experience) =>
      experience.title?.trim() ||
      experience.company?.trim() ||
      experience.location?.trim() ||
      experience.startDate?.trim() ||
      experience.endDate?.trim() ||
      experience.current ||
      experience.bullets.some(Boolean),
  );

  const visibleEducation = resume.education.filter(
    (education) =>
      education.degree?.trim() ||
      education.field?.trim() ||
      education.institution?.trim() ||
      education.location?.trim() ||
      education.startDate?.trim() ||
      education.endDate?.trim(),
  );

  const visibleProjects = resume.projects.filter(
    (project) =>
      project.name?.trim() ||
      project.description?.trim() ||
      project.technologies.some(Boolean) ||
      project.bullets.some(Boolean) ||
      project.url?.trim(),
  );

  const visibleSkillCategories =
    resume.skills.categories
      .map((category) => ({
        ...category,
        items: category.items.filter(Boolean),
      }))
      .filter(
        (category) =>
          category.name?.trim() ||
          category.items.length > 0,
      );

  const visibleCertifications =
    resume.certifications.filter(
      (certification) =>
        certification.name?.trim() ||
        certification.issuer?.trim() ||
        certification.date?.trim(),
    );

  const visibleLanguages = resume.languages.filter(
    (language) =>
      language.name?.trim() ||
      language.proficiency?.trim(),
  );

  const visibleCustomSections =
    resume.customSections.filter(
      (section) =>
        section.title?.trim() ||
        section.items.some(Boolean),
    );

  return (
    <article
      className={`rf-modern-resume${
        className ? ` ${className}` : ""
      }`}
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <header className="rf-modern-header">
        <h1 className="rf-modern-name">
          {profile.name || "Your Name"}
        </h1>

        {profile.headline?.trim() && (
          <p className="rf-modern-headline">
            {profile.headline}
          </p>
        )}

        {contactItems.length > 0 && (
          <div className="rf-modern-contact">
            {contactItems.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 && (
                  <span
                    className="rf-modern-contact-separator"
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}

                {item}
              </span>
            ))}
          </div>
        )}

        {visibleLinks.length > 0 && (
          <div className="rf-modern-links">
            {visibleLinks.map((link, index) => (
              <span
                key={`${link.label}-${link.url}-${index}`}
              >
                {index > 0 && (
                  <span
                    className="rf-modern-contact-separator"
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}

                {link.label?.trim() || link.url}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* =================================================
          SUMMARY
          ================================================= */}

      {resume.summary.trim() && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Professional Summary
          </h2>

          <p className="rf-modern-summary">
            {resume.summary}
          </p>
        </section>
      )}

      {/* =================================================
          EXPERIENCE
          ================================================= */}

      {visibleExperience.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Experience
          </h2>

          <div className="rf-modern-items">
            {visibleExperience.map((experience) => {
              const bullets =
                experience.bullets.filter(Boolean);

              return (
                <article
                  key={experience.id}
                  className="rf-modern-item"
                >
                  <div className="rf-modern-item-header">
                    <div>
                      {experience.title?.trim() && (
                        <h3 className="rf-modern-item-title">
                          {experience.title}
                        </h3>
                      )}

                      {(experience.company?.trim() ||
                        experience.location?.trim()) && (
                        <p className="rf-modern-item-subtitle">
                          {experience.company}

                          {experience.location && (
                            <>
                              <span
                                className="rf-modern-meta-separator"
                                aria-hidden="true"
                              >
                                •
                              </span>

                              {experience.location}
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {(experience.startDate ||
                      experience.endDate ||
                      experience.current) && (
                      <p className="rf-modern-item-date">
                        {experience.startDate}

                        {experience.current
                          ? " – Present"
                          : experience.endDate
                            ? ` – ${experience.endDate}`
                            : ""}
                      </p>
                    )}
                  </div>

                  {bullets.length > 0 && (
                    <ul className="rf-modern-bullets">
                      {bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================
          EDUCATION
          ================================================= */}

      {visibleEducation.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Education
          </h2>

          <div className="rf-modern-items">
            {visibleEducation.map((education) => (
              <article
                key={education.id}
                className="rf-modern-item"
              >
                <div className="rf-modern-item-header">
                  <div>
                    {(education.degree?.trim() ||
                      education.field?.trim()) && (
                      <h3 className="rf-modern-item-title">
                        {education.degree}

                        {education.field && (
                          <>
                            <span>{", "}</span>
                            {education.field}
                          </>
                        )}
                      </h3>
                    )}

                    {(education.institution?.trim() ||
                      education.location?.trim()) && (
                      <p className="rf-modern-item-subtitle">
                        {education.institution}

                        {education.location && (
                          <>
                            <span
                              className="rf-modern-meta-separator"
                              aria-hidden="true"
                            >
                              •
                            </span>

                            {education.location}
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {(education.startDate ||
                    education.endDate) && (
                    <p className="rf-modern-item-date">
                      {education.startDate}

                      {education.endDate && (
                        <>
                          {" – "}
                          {education.endDate}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          PROJECTS
          ================================================= */}

      {visibleProjects.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Projects
          </h2>

          <div className="rf-modern-items">
            {visibleProjects.map((project) => {
              const bullets =
                project.bullets.filter(Boolean);

              const technologies =
                project.technologies.filter(Boolean);

              return (
                <article
                  key={project.id}
                  className="rf-modern-item"
                >
                  {project.name?.trim() && (
                    <h3 className="rf-modern-item-title">
                      {project.name}
                    </h3>
                  )}

                  {project.description?.trim() && (
                    <p className="rf-modern-description">
                      {project.description}
                    </p>
                  )}

                  {technologies.length > 0 && (
                    <p className="rf-modern-technologies">
                      {technologies.join(" • ")}
                    </p>
                  )}

                  {bullets.length > 0 && (
                    <ul className="rf-modern-bullets">
                      {bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  {project.url?.trim() && (
                    <p className="rf-modern-url">
                      {project.url}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================
          SKILLS
          ================================================= */}

      {visibleSkillCategories.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Skills
          </h2>

          <div className="rf-modern-skills">
            {visibleSkillCategories.map((category) => (
              <div
                key={category.id}
                className="rf-modern-skill-row"
              >
                {category.name?.trim() && (
                  <strong>{category.name}</strong>
                )}

                {category.items.length > 0 && (
                  <span>
                    {category.items.join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          CERTIFICATIONS
          ================================================= */}

      {visibleCertifications.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Certifications
          </h2>

          <div className="rf-modern-items">
            {visibleCertifications.map(
              (certification) => (
                <article
                  key={certification.id}
                  className="rf-modern-certification"
                >
                  {certification.name?.trim() && (
                    <strong>
                      {certification.name}
                    </strong>
                  )}

                  {certification.issuer?.trim() && (
                    <span>
                      {certification.name?.trim()
                        ? " — "
                        : ""}
                      {certification.issuer}
                    </span>
                  )}

                  {certification.date?.trim() && (
                    <span>
                      {" ("}
                      {certification.date}
                      {")"}
                    </span>
                  )}
                </article>
              ),
            )}
          </div>
        </section>
      )}

      {/* =================================================
          LANGUAGES
          ================================================= */}

      {visibleLanguages.length > 0 && (
        <section className="rf-modern-section">
          <h2 className="rf-modern-section-title">
            Languages
          </h2>

          <div className="rf-modern-languages">
            {visibleLanguages.map((language) => (
              <div
                key={language.id}
                className="rf-modern-language"
              >
                {language.name?.trim() && (
                  <strong>{language.name}</strong>
                )}

                {language.proficiency?.trim() && (
                  <span>
                    {language.name?.trim()
                      ? " — "
                      : ""}
                    {language.proficiency}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================
          CUSTOM SECTIONS
          ================================================= */}

      {visibleCustomSections.map((section) => {
        const items =
          section.items.filter(Boolean);

        return (
          <section
            key={section.id}
            className="rf-modern-section"
          >
            {section.title?.trim() && (
              <h2 className="rf-modern-section-title">
                {section.title}
              </h2>
            )}

            {items.length > 0 && (
              <ul className="rf-modern-bullets">
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </article>
  );
}