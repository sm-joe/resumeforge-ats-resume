"use client";

import { TextField } from "@/components/editor/fields/TextField";
import { useEditor } from "@/lib/editor/EditorProvider";

export function CertificationEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Certifications</h3>
          <p>
            Add professional certifications and credentials.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "certification/add",
            })
          }
        >
          + Add certification
        </button>
      </div>

      {state.resume.certifications.map(
        (certification, certificationIndex) => (
          <article
            key={certification.id}
            className="rf-experience-card"
          >
            <div className="rf-experience-header">
              <div>
                <div className="rf-experience-number">
                  Certification {certificationIndex + 1}
                </div>

                <h3>
                  {certification.name ||
                    "New Certification"}
                </h3>
              </div>

              <button
                type="button"
                className="rf-button rf-button-danger"
                onClick={() =>
                  dispatch({
                    type: "certification/remove",
                    id: certification.id,
                  })
                }
              >
                Delete
              </button>
            </div>

            <div className="rf-fields">
              <TextField
                label="Certification Name"
                value={certification.name}
                onChange={(value) =>
                  dispatch({
                    type: "certification/update",
                    id: certification.id,
                    updater: (item) => ({
                      ...item,
                      name: value,
                    }),
                  })
                }
              />

              <div className="rf-fields rf-fields-2">
                <TextField
                  label="Issuer"
                  value={certification.issuer ?? ""}
                  onChange={(value) =>
                    dispatch({
                      type: "certification/update",
                      id: certification.id,
                      updater: (item) => ({
                        ...item,
                        issuer: value,
                      }),
                    })
                  }
                />

                <TextField
                  label="Date"
                  value={certification.date ?? ""}
                  onChange={(value) =>
                    dispatch({
                      type: "certification/update",
                      id: certification.id,
                      updater: (item) => ({
                        ...item,
                        date: value,
                      }),
                    })
                  }
                />
              </div>

              <TextField
                label="Credential URL"
                type="url"
                value={certification.url ?? ""}
                onChange={(value) =>
                  dispatch({
                    type: "certification/update",
                    id: certification.id,
                    updater: (item) => ({
                      ...item,
                      url: value,
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