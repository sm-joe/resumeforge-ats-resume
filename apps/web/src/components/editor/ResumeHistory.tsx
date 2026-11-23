"use client";

import { useEffect, useState } from "react";
import type { Resume } from "@resumeforge/resume-schema";
import { useEditor } from "@/lib/editor/EditorProvider";

const VERSION_KEY = "resumeforge:resume:versions";

type Snapshot = { id: string; resume: Resume; savedAt: string };

export function ResumeHistory() {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Snapshot[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(VERSION_KEY) || "[]");
      if (!Array.isArray(parsed)) throw new Error("Invalid version history");
      setVersions(
        parsed.filter((item): item is Snapshot =>
          !!item && typeof item === "object" &&
          "resume" in item && !!item.resume &&
          (item as Snapshot).resume.metadata?.id === state.resume.metadata.id &&
          typeof (item as Snapshot).savedAt === "string",
        ),
      );
      setError("");
    } catch {
      setError("Local version history could not be read.");
      setVersions([]);
    }
  }, [open, state.lastSavedAt, state.resume.metadata.id]);

  function restore(snapshot: Snapshot) {
    if (!window.confirm("Restore this version? Your current unsaved edits will be replaced.")) return;
    dispatch({ type: "resume/replace", resume: structuredClone(snapshot.resume) });
    setOpen(false);
  }

  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls="resume-version-list"
        onClick={() => setOpen(!open)}
        style={{ border: "1px solid #cbd8d1", borderRadius: 8, padding: "8px 12px", background: "#fff", color: "#304f43", cursor: "pointer" }}>
        Version History
      </button>
      {open && (
        <section id="resume-version-list" aria-label="Resume version history"
          style={{ position: "absolute", zIndex: 40, right: 20, top: 100, background: "#fff", border: "1px solid #d0d5dd", boxShadow: "0 12px 32px #102a201f", borderRadius: 12, padding: 16, minWidth: 280, maxWidth: "min(90vw, 400px)", maxHeight: 380, overflow: "auto" }}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Saved Versions</h2>
          {error && <p role="alert">{error}</p>}
          {!error && versions.length === 0 && <p>No saved versions for this resume yet.</p>}
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {versions.map((snapshot) => (
              <li key={snapshot.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #e4e7ec" }}>
                <time dateTime={snapshot.savedAt} style={{ fontSize: 13, color: "#475467" }}>
                  {new Date(snapshot.savedAt).toLocaleString()}
                </time>
                <button type="button" onClick={() => restore(snapshot)}
                  style={{ background: "#edf3ef", border: "1px solid #cbd8d1", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>
                  Restore
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setOpen(false)}
            style={{ marginTop: 12, border: "none", background: "transparent", cursor: "pointer", textDecoration: "underline" }}>
            Close
          </button>
        </section>
      )}
    </div>
  );
}
