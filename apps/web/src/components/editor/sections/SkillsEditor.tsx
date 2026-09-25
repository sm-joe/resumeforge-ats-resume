"use client";

import { TextField } from "@/components/editor/fields/TextField";
import { useEditor } from "@/lib/editor/EditorProvider";

export function SkillsEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Skills</h3>
          <p>
            Organize your skills into categories for a
            structured, ATS-friendly resume.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "skill-category/add",
            })
          }
        >
          + Add category
        </button>
      </div>

      {state.resume.skills.categories.length === 0 ? (
        <div className="rf-empty-state">
          <p>No skill categories yet.</p>

          <button
            type="button"
            className="rf-button rf-button-secondary"
            onClick={() =>
              dispatch({
                type: "skill-category/add",
              })
            }
          >
            + Add your first category
          </button>
        </div>
      ) : (
        state.resume.skills.categories.map(
          (category, categoryIndex) => (
            <article
              key={category.id}
              className="rf-experience-card"
            >
              <div className="rf-experience-header">
                <div>
                  <div className="rf-experience-number">
                    Skill Category {categoryIndex + 1}
                  </div>

                  <h3>
                    {category.name ||
                      "New Skill Category"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="rf-button rf-button-danger"
                  onClick={() =>
                    dispatch({
                      type: "skill-category/remove",
                      id: category.id,
                    })
                  }
                >
                  Delete category
                </button>
              </div>

              <div className="rf-fields">
                <TextField
                  label="Category Name"
                  value={category.name}
                  placeholder="e.g. Cloud, Security, DevOps"
                  onChange={(value) =>
                    dispatch({
                      type: "skill-category/update",
                      id: category.id,
                      updater: (item) => ({
                        ...item,
                        name: value,
                      }),
                    })
                  }
                />
              </div>

              <div className="rf-bullets">
                <div className="rf-bullets-header">
                  Skills
                </div>

                {category.items.map(
                  (skill, skillIndex) => (
                    <div
                      key={`${category.id}-skill-${skillIndex}`}
                      className="rf-bullet-row"
                    >
                      <div style={{ flex: 1 }}>
                        <TextField
                          label={`Skill ${
                            skillIndex + 1
                          }`}
                          value={skill}
                          placeholder="e.g. AWS"
                          onChange={(value) =>
                            dispatch({
                              type: "skill/update",
                              categoryId:
                                category.id,
                              skillIndex,
                              value,
                            })
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="rf-button rf-button-secondary"
                        onClick={() =>
                          dispatch({
                            type: "skill/remove",
                            categoryId:
                              category.id,
                            skillIndex,
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
                        type: "skill/add",
                        categoryId: category.id,
                      })
                    }
                  >
                    + Add skill
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