"use client";

import { useEffect, useState } from "react";
import type { Resume } from "@resumeforge/resume-schema";
import { createResume, deleteResume, listResumes } from "@/lib/api";

const ACTIVE_DRAFT_KEY = "resumeforge:resume:draft";

function activate(resume: Resume) {
  window.localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(resume));
  // A full navigation remounts the editor and restores the selected draft.
  window.location.assign("/");
}

function makeBlankResume(): Resume {
  return {
    schemaVersion: "1.0",
    metadata: {
      id: crypto.randomUUID(),
      title: "Untitled Resume",
      updatedAt: new Date().toISOString(),
    },
    design: {
      template: "modern",
      pageSize: "A4",
      fontFamily: "Inter",
      accentColor: "#24312d",
      spacing: "comfortable",
    },
    profile: { name: "Your Name", links: [] },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: { categories: [] },
    certifications: [],
    languages: [],
    customSections: [],
  };
}

const actionStyle: React.CSSProperties = {
  border: "1px solid #d0d5dd",
  backgroundColor: "#fff",
  color: "#344054",
  borderRadius: 8,
  padding: "8px 12px",
  fontWeight: 600,
  cursor: "pointer",
};

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listResumes()
      .then((records) => {
        if (!cancelled) setResumes(records);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load your resumes. Check the API connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function run(operation: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await operation();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Resume operation failed");
    } finally {
      setBusy(false);
    }
  }

  function createNew() {
    void run(async () => {
      const saved = await createResume(makeBlankResume());
      activate(saved);
    });
  }

  function duplicate(resume: Resume) {
    void run(async () => {
      const copy: Resume = {
        ...structuredClone(resume),
        metadata: {
          ...resume.metadata,
          id: crypto.randomUUID(),
          title: `${resume.metadata.title} (Copy)`,
          updatedAt: new Date().toISOString(),
        },
      };
      const saved = await createResume(copy);
      setResumes((current) => [saved, ...current]);
    });
  }

  function remove(resume: Resume) {
    if (!window.confirm(`Permanently delete "${resume.metadata.title}"? This cannot be undone.`)) return;
    void run(async () => {
      await deleteResume(resume.metadata.id);
      setResumes((current) => current.filter((r) => r.metadata.id !== resume.metadata.id));
      try {
        const active = window.localStorage.getItem(ACTIVE_DRAFT_KEY);
        if (active && (JSON.parse(active) as Resume).metadata.id === resume.metadata.id) {
          window.localStorage.removeItem(ACTIVE_DRAFT_KEY);
        }
      } catch {
        window.localStorage.removeItem(ACTIVE_DRAFT_KEY);
      }
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", padding: "clamp(20px, 5vw, 64px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ color: "#53776a", fontWeight: 800, letterSpacing: 1, margin: 0 }}>ResumeForge</p>
            <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "#1d2939", margin: "8px 0" }}>My Resumes</h1>
            <p style={{ color: "#667085", margin: 0 }}>Manage your private drafts and create role-specific copies.</p>
          </div>
          <button type="button" style={{ ...actionStyle, backgroundColor: "#304f43", color: "#fff" }} disabled={busy} onClick={createNew}>+ New Resume</button>
        </header>

        <p style={{ fontSize: 13, color: "#667085", marginBottom: 20 }}>
          Your resumes are accessible using this browser&apos;s private ownership key. Back up your drafts before clearing browser storage.
        </p>

        {error && <div role="alert" style={{ padding: 14, border: "1px solid #f2b8b5", borderRadius: 10, marginBottom: 20, color: "#912018", background: "#fff6f5" }}>{error}</div>}
        {loading ? <p role="status">Loading resumes…</p> : resumes.length === 0 ? (
          <section style={{ padding: "64px 24px", textAlign: "center", border: "1px dashed #cbd5d1", borderRadius: 16, background: "#fff" }}>
            <h2 style={{ color: "#344054" }}>No resumes yet</h2>
            <p style={{ color: "#667085" }}>Create your first resume to get started.</p>
            <button type="button" style={actionStyle} onClick={createNew} disabled={busy}>Create Resume</button>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 18 }}>
            {resumes.map((resume) => (
              <article key={resume.metadata.id} style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 14, padding: 22, boxShadow: "0 3px 12px rgba(16,24,40,.035)" }}>
                <div style={{ minHeight: 120 }}>
                  <p style={{ color: "#667085", fontSize: 12, margin: "0 0 12px" }}>Resume</p>
                  <h2 style={{ color: "#1d2939", fontSize: 19, overflowWrap: "anywhere", margin: "0 0 9px" }}>{resume.metadata.title}</h2>
                  <p style={{ color: "#667085", fontSize: 14, margin: 0 }}>{resume.profile.name}</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" disabled={busy} style={{ ...actionStyle, backgroundColor: "#edf3ef", borderColor: "#cbd8d1" }} onClick={() => activate(resume)}>Open</button>
                  <button type="button" disabled={busy} style={actionStyle} onClick={() => duplicate(resume)}>Duplicate</button>
                  <button type="button" disabled={busy} style={{ ...actionStyle, color: "#b42318" }} onClick={() => remove(resume)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
