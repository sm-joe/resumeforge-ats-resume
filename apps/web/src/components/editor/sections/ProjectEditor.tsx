"use client";

import { TextField } from "@/components/editor/fields/TextField";
import { TextAreaField } from "@/components/editor/fields/TextAreaField";
import { useEditor } from "@/lib/editor/EditorProvider";

export function ProjectEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Projects</h3>
          <p>
            Highlight relevant projects, technologies,
            and outcomes.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "project/add",
            })
          }
        >
          + Add project
        </button>
      </div>

      {state.resume.projects.map(
        (project, projectIndex) => (
          <article
            key={project.id}
            className="rf-experience-card"
          >
            <div className="rf-experience-header">
              <div>
                <div className="rf-experience-number">
                  Project {projectIndex + 1}
                </div>

                <h3>
                  {project.name || "New Project"}
                </h3>
              </div>

              <button
                type="button"
                className="rf-button rf-button-danger"
                onClick={() =>
                  dispatch({
                    type: "project/remove",
                    id: project.id,
                  })
                }
              >
                Delete
              </button>
            </div>

            <div className="rf-fields">
              <TextField
                label="Project Name"
                value={project.name}
                onChange={(value) =>
                  dispatch({
                    type: "project/update",
                    id: project.id,
                    updater: (item) => ({
                      ...item,
                      name: value,
                    }),
                  })
                }
              />

              <TextField
                label="Project URL"
                type="url"
                value={project.url ?? ""}
                onChange={(value) =>
                  dispatch({
                    type: "project/update",
                    id: project.id,
                    updater: (item) => ({
                      ...item,
                      url: value,
                    }),
                  })
                }
              />

              <TextAreaField
                label="Description"
                value={project.description ?? ""}
                onChange={(value) =>
                  dispatch({
                    type: "project/update",
                    id: project.id,
                    updater: (item) => ({
                      ...item,
                      description: value,
                    }),
                  })
                }
                rows={4}
              />
            </div>

            <div className="rf-bullets">
              <div className="rf-bullets-header">
                Project Highlights
              </div>

              {project.bullets.map(
                (bullet, bulletIndex) => (
                  <div
                    key={`${project.id}-bullet-${bulletIndex}`}
                    className="rf-bullet-row"
                  >
                    <div style={{ flex: 1 }}>
                      <TextAreaField
                        label={`Highlight ${
                          bulletIndex + 1
                        }`}
                        value={bullet}
                        onChange={(value) =>
                          dispatch({
                            type: "project/update-bullet",
                            id: project.id,
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
                          type: "project/remove-bullet",
                          id: project.id,
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
                      type: "project/add-bullet",
                      id: project.id,
                    })
                  }
                >
                  + Add highlight
                </button>
              </div>
            </div>
          </article>
        ),
      )}
    </section>
  );
}