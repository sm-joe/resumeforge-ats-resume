"use client";

import { useEditor } from "@/lib/editor/EditorProvider";

export function CustomSectionEditor() {
  const { state, dispatch } = useEditor();

  const customSections = state.resume.customSections;

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Custom Sections</h3>
          <p>
            Add sections that are not covered by the standard
            resume categories.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() => {
            dispatch({
              type: "custom-section/add",
            });
          }}
        >
          Add section
        </button>
      </div>

      {customSections.length === 0 ? (
        <div className="rf-empty-state">
          <strong>No custom sections yet</strong>
          <p>
            Add achievements, publications, volunteer work,
            awards, or any other resume content.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {customSections.map((section, sectionIndex) => (
            <article
              key={section.id}
              style={{
                border: "1px solid #eaecf0",
                borderRadius: "12px",
                padding: "16px",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    color: "#101828",
                  }}
                >
                  Section {sectionIndex + 1}
                </strong>

                <button
                  type="button"
                  className="rf-button rf-button-danger"
                  onClick={() => {
                    dispatch({
                      type: "custom-section/remove",
                      id: section.id,
                    });
                  }}
                >
                  Delete section
                </button>
              </div>

              <label>
                <span>Section title</span>

                <input
                  type="text"
                  value={section.title}
                  placeholder="e.g. Achievements"
                  onChange={(event) => {
                    dispatch({
                      type: "custom-section/update",
                      id: section.id,
                      updater: (currentSection) => ({
                        ...currentSection,
                        title: event.target.value,
                      }),
                    });
                  }}
                />
              </label>

              <div
                style={{
                  marginTop: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "13px",
                        color: "#344054",
                      }}
                    >
                      Items
                    </strong>

                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "11px",
                        color: "#98a2b3",
                      }}
                    >
                      Add one item per bullet.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rf-button rf-button-secondary"
                    onClick={() => {
                      dispatch({
                        type: "custom-section/add-item",
                        id: section.id,
                      });
                    }}
                  >
                    Add item
                  </button>
                </div>

                {section.items.length === 0 ? (
                  <div className="rf-empty-state">
                    <p>
                      No items yet. Add an item to this
                      section.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={`${section.id}-${itemIndex}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: "8px",
                          alignItems: "start",
                        }}
                      >
                        <input
                          type="text"
                          value={item}
                          placeholder={`Item ${itemIndex + 1}`}
                          onChange={(event) => {
                            dispatch({
                              type: "custom-section/update-item",
                              id: section.id,
                              itemIndex,
                              value: event.target.value,
                            });
                          }}
                        />

                        <button
                          type="button"
                          className="rf-button rf-button-danger"
                          onClick={() => {
                            dispatch({
                              type: "custom-section/remove-item",
                              id: section.id,
                              itemIndex,
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}