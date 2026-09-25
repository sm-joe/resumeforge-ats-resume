"use client";

import { useState } from "react";

import { useEditor } from "@/lib/editor/EditorProvider";

import type {
  AtsAnalysisResult,
  AtsSeverity,
} from "./types";

const severityLabels: Record<
  AtsSeverity,
  string
> = {
  error: "Needs attention",
  warning: "Improve",
  info: "Suggestion",
};

function scoreColor(score: number): string {
  if (score >= 80) {
    return "#067647";
  }

  if (score >= 60) {
    return "#b54708";
  }

  return "#b42318";
}

function findingColor(
  severity: AtsSeverity,
): string {
  if (severity === "error") {
    return "#b42318";
  }

  if (severity === "warning") {
    return "#b54708";
  }

  return "#475467";
}

export function AtsScorePanel() {
  const { state } = useEditor();

  const [result, setResult] =
    useState<AtsAnalysisResult | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            state.resume,
          ),
        },
      );

      const payload =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            `ATS analysis failed with status ${response.status}`,
        );
      }

      setResult(
        payload as AtsAnalysisResult,
      );
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "ATS analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section>
      <div className="rf-panel-header">
        <p className="rf-eyebrow">
          Resume Quality
        </p>

        <h2>ATS Analysis</h2>

        <p>
          Check your resume structure and
          content against deterministic ATS
          rules.
        </p>
      </div>

      <div
        style={{
          padding: "8px",
        }}
      >
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #4545b8",
            borderRadius: "9px",
            background: "#4545b8",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 650,
            cursor: analyzing
              ? "not-allowed"
              : "pointer",
            opacity: analyzing ? 0.65 : 1,
          }}
        >
          {analyzing
            ? "Analyzing..."
            : "Analyze Resume"}
        </button>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: "10px",
              padding: "9px 10px",
              borderRadius: "8px",
              background: "#fef3f2",
              color: "#b42318",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: "14px",
              display: "grid",
              gap: "14px",
            }}
          >
            {/* Overall score */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "12px",
                padding: "12px",
                border: "1px solid #eaecf0",
                borderRadius: "10px",
                background: "#ffffff",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#667085",
                    marginBottom: "3px",
                  }}
                >
                  ATS Score
                </div>

                <strong
                  style={{
                    fontSize: "28px",
                    lineHeight: 1,
                    color: scoreColor(
                      result.overall_score,
                    ),
                  }}
                >
                  {result.overall_score}
                </strong>

                <span
                  style={{
                    marginLeft: "4px",
                    color: "#98a2b3",
                    fontSize: "12px",
                  }}
                >
                  / 100
                </span>
              </div>

              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  border: `4px solid ${scoreColor(
                    result.overall_score,
                  )}`,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: scoreColor(
                    result.overall_score,
                  ),
                }}
              >
                {result.overall_score}%
              </div>
            </div>

            {/* Category scores */}

            <div>
              <div
                style={{
                  marginBottom: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                Category Breakdown
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "8px",
                }}
              >
                {result.category_scores.map(
                  (category) => {
                    const percentage =
                      category.max_score > 0
                        ? Math.round(
                            (category.score /
                              category.max_score) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={
                          category.category
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "8px",
                            marginBottom: "4px",
                            fontSize: "11px",
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#475467",
                            }}
                          >
                            {
                              category.category
                            }
                          </span>

                          <strong
                            style={{
                              color:
                                "#344054",
                            }}
                          >
                            {category.score}/
                            {
                              category.max_score
                            }
                          </strong>
                        </div>

                        <div
                          style={{
                            height: "6px",
                            overflow: "hidden",
                            borderRadius:
                              "999px",
                            background:
                              "#eaecf0",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              borderRadius:
                                "999px",
                              background:
                                scoreColor(
                                  percentage,
                                ),
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Findings */}

            {result.findings.length > 0 && (
              <div>
                <div
                  style={{
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#344054",
                  }}
                >
                  Findings
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "7px",
                  }}
                >
                  {result.findings.map(
                    (finding) => (
                      <div
                        key={finding.id}
                        style={{
                          padding:
                            "9px 10px",
                          border:
                            "1px solid #eaecf0",
                          borderRadius:
                            "8px",
                          background:
                            "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "8px",
                            marginBottom:
                              "3px",
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#344054",
                            }}
                          >
                            {
                              finding.category
                            }
                          </strong>

                          <span
                            style={{
                              flexShrink: 0,
                              fontSize:
                                "10px",
                              fontWeight: 700,
                              color:
                                findingColor(
                                  finding.severity,
                                ),
                            }}
                          >
                            {
                              severityLabels[
                                finding
                                  .severity
                              ]
                            }
                          </span>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "11px",
                            lineHeight: 1.5,
                            color:
                              "#667085",
                          }}
                        >
                          {
                            finding.message
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {result.findings.length ===
              0 && (
              <div
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#ecfdf3",
                  color: "#067647",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                No ATS findings.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}