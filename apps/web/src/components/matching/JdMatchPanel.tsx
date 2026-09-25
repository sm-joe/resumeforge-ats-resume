"use client";

import { useState } from "react";

import { useEditor } from "@/lib/editor/EditorProvider";

import type {
  JobMatchResult,
  MatchRequirementStatus,
  ResponsibilityRequirement,
} from "./types";

function statusLabel(status: MatchRequirementStatus) {
  if (status === "matched") return "Matched";
  if (status === "partial") return "Partial";
  return "Missing";
}

function statusClass(status: MatchRequirementStatus) {
  if (status === "matched") {
    return "rf-jd-status rf-jd-status--matched";
  }

  if (status === "partial") {
    return "rf-jd-status rf-jd-status--partial";
  }

  return "rf-jd-status rf-jd-status--missing";
}

function scoreClass(score: number) {
  if (score >= 80) return "rf-jd-score rf-jd-score--strong";
  if (score >= 60) return "rf-jd-score rf-jd-score--moderate";
  return "rf-jd-score rf-jd-score--low";
}

function RequirementList({
  items,
}: {
  items: {
    term: string;
    status: MatchRequirementStatus;
    evidence: string[];
  }[];
}) {
  if (items.length === 0) {
    return (
      <p className="rf-jd-empty">
        No explicit requirements were detected.
      </p>
    );
  }

  return (
    <div className="rf-jd-requirements">
      {items.map((item) => (
        <div
          key={`${item.term}-${item.status}`}
          className="rf-jd-requirement"
        >
          <div className="rf-jd-requirement-top">
            <strong>{item.term}</strong>

            <span className={statusClass(item.status)}>
              {statusLabel(item.status)}
            </span>
          </div>

          {item.evidence.length > 0 && (
            <div className="rf-jd-evidence">
              {item.evidence.map((evidence, index) => (
                <p key={`${item.term}-evidence-${index}`}>
                  {evidence}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResponsibilityList({
  items,
}: {
  items: ResponsibilityRequirement[];
}) {
  if (items.length === 0) {
    return (
      <p className="rf-jd-empty">
        No responsibility statements were detected.
      </p>
    );
  }

  return (
    <div className="rf-jd-requirements">
      {items.map((item, index) => (
        <div
          key={`${item.requirement}-${index}`}
          className="rf-jd-requirement"
        >
          <div className="rf-jd-requirement-top">
            <strong>{item.requirement}</strong>

            <span className={statusClass(item.status)}>
              {statusLabel(item.status)}
            </span>
          </div>

          {item.matched_terms.length > 0 && (
            <div className="rf-jd-inline-tags">
              {item.matched_terms.map((term) => (
                <span key={term} className="rf-jd-tag">
                  {term}
                </span>
              ))}
            </div>
          )}

          {item.evidence.length > 0 && (
            <div className="rf-jd-evidence">
              {item.evidence.map((evidence, evidenceIndex) => (
                <p key={`${index}-${evidenceIndex}`}>
                  {evidence}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function JdMatchPanel() {
  const { state } = useEditor();

  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobMatchResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError(
        "Paste a job description before analyzing alignment.",
      );
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: state.resume,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Job description alignment failed.",
        );
      }

      setResult(data as JobMatchResult);
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze the job description.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rf-jd-match-panel">
      <div className="rf-panel-header">
        <p className="rf-eyebrow">Target Role</p>

        <h2>Job Description Match</h2>

        <p>
          Compare your resume against the actual
          requirements, responsibilities, and evidence
          in a target job description.
        </p>
      </div>

      {result?.role_title && (
        <div style={{ padding: "8px 22px 0" }}>
          <div className="rf-jd-role-badge">
            {result.role_title}
          </div>
        </div>
      )}

      <div className="rf-jd-match-input-wrap">
        <textarea
          className="rf-jd-match-input"
          value={jobDescription}
          onChange={(event) =>
            setJobDescription(event.target.value)
          }
          placeholder="Paste the complete job description here..."
          rows={12}
          aria-label="Job description"
        />

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #4545b8",
            borderRadius: "9px",
            background: "#4545b8",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 650,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Analyze Alignment"}
        </button>
      </div>

      {error && (
        <div className="rf-jd-match-error">
          {error}
        </div>
      )}

      {result && (
        <div className="rf-jd-match-results">
          <div className="rf-jd-score-card">
            <div>
              <p className="rf-eyebrow">
                Overall Alignment
              </p>

              <div
                className={scoreClass(
                  result.overall_score,
                )}
              >
                {result.overall_score}
                <span>/100</span>
              </div>
            </div>

            <div className="rf-jd-score-summary">
              <strong>
                {result.role_title ||
                  "Target role detected"}
              </strong>

              <span>
                {result.keyword_coverage}% keyword
                coverage
              </span>
            </div>
          </div>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Alignment Breakdown</h3>
                <p>
                  How the resume maps to the different
                  requirement areas.
                </p>
              </div>
            </div>

            <div className="rf-jd-category-list">
              {result.category_scores.map(
                (category) => (
                  <div
                    key={category.category}
                    className="rf-jd-category"
                  >
                    <div className="rf-jd-category-top">
                      <span>
                        {category.category}
                      </span>

                      <strong>
                        {category.score}%
                      </strong>
                    </div>

                    <div className="rf-jd-progress">
                      <span
                        style={{
                          width: `${category.score}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Required Skills</h3>
                <p>
                  Skills explicitly identified as
                  important to the role.
                </p>
              </div>
            </div>

            <RequirementList
              items={
                result.requirements.required_skills
              }
            />
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Preferred Skills</h3>
                <p>
                  Additional technologies or
                  capabilities detected in the JD.
                </p>
              </div>
            </div>

            <RequirementList
              items={
                result.requirements.preferred_skills
              }
            />
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Responsibilities</h3>
                <p>
                  Evidence-based comparison against
                  the responsibilities described by the
                  employer.
                </p>
              </div>
            </div>

            <ResponsibilityList
              items={
                result.requirements.responsibilities
              }
            />
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Experience Alignment</h3>
                <p>
                  Comparison of the requested experience
                  level with the experience represented in
                  the resume.
                </p>
              </div>
            </div>

            <div className="rf-jd-experience-grid">
              <div>
                <span>JD requirement</span>

                <strong>
                  {result.requirements.experience
                    .required_years !== null
                    ? `${result.requirements.experience.required_years}+ years`
                    : "Not specified"}
                </strong>
              </div>

              <div>
                <span>Resume evidence</span>

                <strong>
                  {result.requirements.experience
                    .resume_years !== null
                    ? `${result.requirements.experience.resume_years} years`
                    : "Not established"}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong
                  className={statusClass(
                    result.requirements.experience
                      .status === "matched"
                      ? "matched"
                      : result.requirements.experience
                            .status === "partial"
                        ? "partial"
                        : "missing",
                  )}
                >
                  {result.requirements.experience.status}
                </strong>
              </div>
            </div>
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Education & Certifications</h3>
                <p>
                  Explicit qualification requirements
                  detected from the job description.
                </p>
              </div>
            </div>

            <div className="rf-jd-two-column">
              <div>
                <h4>Education</h4>

                <RequirementList
                  items={
                    result.requirements.education
                  }
                />
              </div>

              <div>
                <h4>Certifications</h4>

                <RequirementList
                  items={
                    result.requirements.certifications
                  }
                />
              </div>
            </div>
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Keyword Gaps</h3>
                <p>
                  These are signals for review, not
                  keywords to add blindly.
                </p>
              </div>
            </div>

            <div className="rf-jd-keyword-groups">
              <div>
                <h4>Matched</h4>

                <div className="rf-jd-inline-tags">
                  {result.matched_keywords.length > 0 ? (
                    result.matched_keywords.map(
                      (keyword) => (
                        <span
                          key={keyword}
                          className="rf-jd-tag rf-jd-tag--matched"
                        >
                          {keyword}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="rf-jd-empty">
                      None detected
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4>Missing</h4>

                <div className="rf-jd-inline-tags">
                  {result.missing_keywords.length > 0 ? (
                    result.missing_keywords.map(
                      (keyword) => (
                        <span
                          key={keyword}
                          className="rf-jd-tag rf-jd-tag--missing"
                        >
                          {keyword}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="rf-jd-empty">
                      None detected
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4>Partial</h4>

                <div className="rf-jd-inline-tags">
                  {result.partial_keywords.length > 0 ? (
                    result.partial_keywords.map(
                      (keyword) => (
                        <span
                          key={keyword}
                          className="rf-jd-tag rf-jd-tag--partial"
                        >
                          {keyword}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="rf-jd-empty">
                      None detected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rf-jd-section">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Recommendations</h3>
                <p>
                  Targeted improvements based on the
                  detected alignment gaps.
                </p>
              </div>
            </div>

            <div className="rf-jd-recommendations">
              {result.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="rf-jd-recommendation"
                  >
                    <span>{index + 1}</span>
                    <p>{recommendation}</p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rf-jd-section rf-jd-section--last">
            <div className="rf-jd-section-heading">
              <div>
                <h3>Analysis Findings</h3>
              </div>
            </div>

            <div className="rf-match-findings">
              {result.findings.length > 0 ? (
                result.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className={`rf-match-finding rf-match-finding--${finding.severity}`}
                  >
                    <strong>
                      {finding.category}
                    </strong>

                    <p>{finding.message}</p>
                  </div>
                ))
              ) : (
                <p className="rf-jd-empty">
                  No additional findings.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}