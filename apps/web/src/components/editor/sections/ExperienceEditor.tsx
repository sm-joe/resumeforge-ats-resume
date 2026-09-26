"use client";

import { TextField } from "@/components/editor/fields/TextField";
import { RichTextField } from "@/components/editor/fields/RichTextField";
import { useEditor } from "@/lib/editor/EditorProvider";

export function ExperienceEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Experience</h3>
          <p>
            Add your professional work experience and
            responsibilities.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "experience/add",
            })
          }
        >
          + Add experience
        </button>
      </div>

      {state.resume.experience.length === 0 ? (
        <div className="rf-empty-state">
          <p>No experience entries yet.</p>

          <button
            type="button"
            className="rf-button rf-button-secondary"
            onClick={() =>
              dispatch({
                type: "experience/add",
              })
            }
          >
            + Add your first experience
          </button>
        </div>
      ) : (
        state.resume.experience.map(
          (experience, experienceIndex) => (
            <article
              key={experience.id}
              className="rf-experience-card"
            >
              <div className="rf-experience-header">
                <div>
                  <div className="rf-experience-number">
                    Experience {experienceIndex + 1}
                  </div>

                  <h3>
                    {experience.title ||
                      "New Position"}
                  </h3>
                </div>

                <div className="rf-actions">
                  <button
                    type="button"
                    className="rf-button rf-button-danger"
                    onClick={() =>
                      dispatch({
                        type: "experience/remove",
                        id: experience.id,
                      })
                    }
                  >
                    Delete experience
                  </button>
                </div>
              </div>

              <div className="rf-fields">
                <div className="rf-fields rf-fields-2">
                  <TextField
                    label="Job Title"
                    value={experience.title}
                    onChange={(value) =>
                      dispatch({
                        type: "experience/update",
                        id: experience.id,
                        updater: (item) => ({
                          ...item,
                          title: value,
                        }),
                      })
                    }
                  />

                  <TextField
                    label="Company"
                    value={experience.company}
                    onChange={(value) =>
                      dispatch({
                        type: "experience/update",
                        id: experience.id,
                        updater: (item) => ({
                          ...item,
                          company: value,
                        }),
                      })
                    }
                  />
                </div>

                <div className="rf-fields rf-fields-2">
                  <TextField
                    label="Location"
                    value={experience.location ?? ""}
                    onChange={(value) =>
                      dispatch({
                        type: "experience/update",
                        id: experience.id,
                        updater: (item) => ({
                          ...item,
                          location: value,
                        }),
                      })
                    }
                  />

                  <TextField
                    label="Start Date"
                    value={experience.startDate}
                    onChange={(value) =>
                      dispatch({
                        type: "experience/update",
                        id: experience.id,
                        updater: (item) => ({
                          ...item,
                          startDate: value,
                        }),
                      })
                    }
                  />
                </div>

                <TextField
                  label="End Date"
                  value={
                    experience.current
                      ? ""
                      : experience.endDate ?? ""
                  }
                  disabled={experience.current}
                  onChange={(value) =>
                    dispatch({
                      type: "experience/update",
                      id: experience.id,
                      updater: (item) => ({
                        ...item,
                        endDate: value,
                      }),
                    })
                  }
                />

                <label className="rf-checkbox">
                  <input
                    type="checkbox"
                    checked={experience.current}
                    onChange={(event) => {
                      const checked =
                        event.target.checked;

                      dispatch({
                        type: "experience/update",
                        id: experience.id,
                        updater: (item) => ({
                          ...item,
                          current: checked,
                          endDate: checked
                            ? ""
                            : item.endDate,
                        }),
                      });
                    }}
                  />

                  <span>Current position</span>
                </label>
              </div>

              <div className="rf-bullets">
                <div className="rf-bullets-header">
                  Work Experience Details
                </div>

                {experience.bullets.map(
                  (bullet, bulletIndex) => (
                    <div
                      key={`${experience.id}-bullet-${bulletIndex}`}
                      className="rf-bullet-row"
                    >
                      <div style={{ flex: 1 }}>
                        <RichTextField
                          label={`Work Experience Detail ${
                            bulletIndex + 1
                          }`}
                          value={bullet}
                          onChange={(value) =>
                            dispatch({
                              type: "experience/update-bullet",
                              id: experience.id,
                              bulletIndex,
                              value,
                            })
                          }
                          rows={3}
                        />
                      </div>

                      <button
                        type="button"
                        className="rf-button rf-button-secondary"
                        onClick={() =>
                          dispatch({
                            type: "experience/remove-bullet",
                            id: experience.id,
                            bulletIndex,
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ),
                )}

                <div className="rf-actions">
                  <button
                    type="button"
                    className="rf-button rf-button-secondary"
                    onClick={() =>
                      dispatch({
                        type: "experience/add-bullet",
                        id: experience.id,
                      })
                    }
                  >
                    + Add work experience detail
                  </button>
                </div>
              </div>
            </article>
          ),
        )
      )}
    </section>
  );
}