"use client";

import { useEditor } from "@/lib/editor/EditorProvider";
import { RichTextField } from "@/components/editor/fields/RichTextField";

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

      <RichTextField
        label="Summary"
        value={state.resume.summary}
        onChange={updateSummary}
        placeholder="Write a concise professional summary..."
        rows={8}
      />
    </section>
  );
}