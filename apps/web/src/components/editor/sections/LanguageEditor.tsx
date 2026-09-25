"use client";

import { SelectField } from "@/components/editor/fields/SelectField";
import { TextField } from "@/components/editor/fields/TextField";
import { useEditor } from "@/lib/editor/EditorProvider";

const proficiencyOptions = [
  {
    label: "Beginner",
    value: "Beginner",
  },
  {
    label: "Intermediate",
    value: "Intermediate",
  },
  {
    label: "Fluent",
    value: "Fluent",
  },
  {
    label: "Native",
    value: "Native",
  },
];

export function LanguageEditor() {
  const { state, dispatch } = useEditor();

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Languages</h3>

          <p>
            Add the languages you can communicate in
            and describe your proficiency.
          </p>
        </div>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            dispatch({
              type: "language/add",
            })
          }
        >
          + Add language
        </button>
      </div>

      {state.resume.languages.length === 0 ? (
        <div className="rf-empty-state">
          <p>No languages added yet.</p>

          <button
            type="button"
            className="rf-button rf-button-secondary"
            onClick={() =>
              dispatch({
                type: "language/add",
              })
            }
          >
            + Add your first language
          </button>
        </div>
      ) : (
        state.resume.languages.map(
          (language, languageIndex) => (
            <article
              key={language.id}
              className="rf-experience-card"
            >
              <div className="rf-experience-header">
                <div>
                  <div className="rf-experience-number">
                    Language {languageIndex + 1}
                  </div>

                  <h3>
                    {language.name ||
                      "New Language"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="rf-button rf-button-danger"
                  onClick={() =>
                    dispatch({
                      type: "language/remove",
                      id: language.id,
                    })
                  }
                >
                  Delete
                </button>
              </div>

              <div className="rf-fields">
                <div className="rf-fields-2">
                  <TextField
                    label="Language"
                    value={language.name}
                    placeholder="e.g. English"
                    onChange={(value) =>
                      dispatch({
                        type: "language/update",
                        id: language.id,
                        updater: (item) => ({
                          ...item,
                          name: value,
                        }),
                      })
                    }
                  />

                  <SelectField
                    label="Proficiency"
                    value={
                      language.proficiency ?? ""
                    }
                    options={proficiencyOptions}
                    onChange={(value) =>
                      dispatch({
                        type: "language/update",
                        id: language.id,
                        updater: (item) => ({
                          ...item,
                          proficiency: value,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            </article>
          ),
        )
      )}
    </section>
  );
}