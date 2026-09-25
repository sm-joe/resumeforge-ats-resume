"use client";

import { useEditor } from "@/lib/editor/EditorProvider";
import { TextAreaField } from "@/components/editor/fields/TextAreaField";

export function SummaryEditor() {
  const { state, dispatch } = useEditor();

  function updateSummary(value: string) {
    dispatch({
      type: "resume/update",
      updater: (resume) => ({
        ...resume,
        summary: value,
      }),
    });
  }

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Professional Summary</h3>
          <p>
            Give recruiters a concise overview of your
            professional profile.
          </p>
        </div>
      </div>

      <TextAreaField
        label="Summary"
        value={state.resume.summary}
        onChange={updateSummary}
        placeholder="Write a concise professional summary..."
        rows={8}
      />
    </section>
  );
}