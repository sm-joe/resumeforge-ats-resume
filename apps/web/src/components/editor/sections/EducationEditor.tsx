"use client";

import { TextField } from "@/components/editor/fields/TextField";
import { useEditor } from "@/lib/editor/EditorProvider";

export function EducationEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Education</h3>
          <p>
            Add your academic background and qualifications.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "education/add",
            })
          }
        >
          + Add education
        </button>
      </div>

      {state.resume.education.map(
        (education, educationIndex) => (
          <article
            key={education.id}
            className="rf-experience-card"
          >
            <div className="rf-experience-header">
              <div>
                <div className="rf-experience-number">
                  Education {educationIndex + 1}
                </div>

                <h3>
                  {education.degree ||
                    "New Education"}
                </h3>
              </div>

              <button
                type="button"
                className="rf-button rf-button-danger"
                onClick={() =>
                  dispatch({
                    type: "education/remove",
                    id: education.id,
                  })
                }
              >
                Delete
              </button>
            </div>

            <div className="rf-fields">
              <div className="rf-fields rf-fields-2">
                <TextField
                  label="Degree"
                  value={education.degree}
                  onChange={(value) =>
                    dispatch({
                      type: "education/update",
                      id: education.id,
                      updater: (item) => ({
                        ...item,
                        degree: value,
                      }),
                    })
                  }
                />

                <TextField
                  label="Field of Study"
                  value={education.field ?? ""}
                  onChange={(value) =>
                    dispatch({
                      type: "education/update",
                      id: education.id,
                      updater: (item) => ({
                        ...item,
                        field: value,
                      }),
                    })
                  }
                />
              </div>

              <TextField
                label="Institution"
                value={education.institution}
                onChange={(value) =>
                  dispatch({
                    type: "education/update",
                    id: education.id,
                    updater: (item) => ({
                      ...item,
                      institution: value,
                    }),
                  })
                }
              />

              <div className="rf-fields rf-fields-2">
                <TextField
                  label="Location"
                  value={education.location ?? ""}
                  onChange={(value) =>
                    dispatch({
                      type: "education/update",
                      id: education.id,
                      updater: (item) => ({
                        ...item,
                        location: value,
                      }),
                    })
                  }
                />

                <TextField
                  label="Start Date"
                  value={education.startDate ?? ""}
                  onChange={(value) =>
                    dispatch({
                      type: "education/update",
                      id: education.id,
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
                value={education.endDate ?? ""}
                onChange={(value) =>
                  dispatch({
                    type: "education/update",
                    id: education.id,
                    updater: (item) => ({
                      ...item,
                      endDate: value,
                    }),
                  })
                }
              />
            </div>
          </article>
        ),
      )}
    </section>
  );
}