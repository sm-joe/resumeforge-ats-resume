"use client";

import { useEffect, useState } from "react";
import { createResume, deleteResume, listResumes, updateResume, trackResumeRevision } from "@/lib/api";
import { ResumeSchema, type Resume } from "@resumeforge/resume-schema";

const ACTIVE_DRAFT_KEY = "resumeforge:resume:draft";

function activate(resume: Resume) {
  trackResumeRevision(resume);
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
    const hadOwnershipKey = !!window.localStorage.getItem("resumeforge:owner-key");
    listResumes()
      .then((records) => {
        // Prefer the browser draft when an autosave is still in flight.
        try {
          const raw = window.localStorage.getItem(ACTIVE_DRAFT_KEY);
          if (raw) {
            let draft = JSON.parse(raw) as Resume;
            if (draft.metadata?.id && draft.profile && draft.skills) {
              if (!hadOwnershipKey || draft.metadata.id === "demo-resume-001") {
                draft = {
                  ...draft,
                  metadata: {
                    ...draft.metadata,
                    id: crypto.randomUUID(),
                    updatedAt: new Date().toISOString(),
                  },
                };
                window.localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(draft));
              }
              records = [
                draft,
                ...records.filter((r) => r.metadata.id !== draft.metadata.id),
              ];
            }
          }
        } catch {
          // Corrupt local data must not block the remote list.
        }
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

  function rename(resume: Resume) {
    const title = window.prompt("Resume title", resume.metadata.title)?.trim();
    if (!title || title === resume.metadata.title) return;
    if (title.length > 120) {
      setError("Resume title must be at most 120 characters.");
      return;
    }
    void run(async () => {
      const saved = await updateResume(resume.metadata.id, {
        ...resume,
        metadata: { ...resume.metadata, title, updatedAt: new Date().toISOString() },
      });
      setResumes((current) => current.map((r) =>
        r.metadata.id === saved.metadata.id ? saved : r,
      ));
      try {
        const draft = JSON.parse(localStorage.getItem(ACTIVE_DRAFT_KEY) || "null") as Resume | null;
        if (draft?.metadata.id === saved.metadata.id) {
          localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(saved));
        }
      } catch {
        // Corrupt draft storage should not prevent a server-side rename.
      }
    });
  }

  function downloadBackup() {
    // Resume data only; the ownership key is intentionally not exported.
    const backup = { schemaVersion: 1, exportedAt: new Date().toISOString(), resumes };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resumeforge-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(file: File) {
    await run(async () => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Import file exceeds the 5 MB limit.");
      }
      const payload: unknown = JSON.parse(await file.text());
      // Accept a single resume or an exported backup, but always validate
      // against the shared schema and allocate new private IDs.
      const raw: unknown[] = (
        payload && typeof payload === "object" && "resumes" in payload &&
        Array.isArray((payload as { resumes: unknown }).resumes)
      ) ? (payload as { resumes: unknown[] }).resumes : [payload];
      if (raw.length > 30) throw new Error("Import is limited to 30 resumes at a time.");
      const validated = raw.map((item) => ResumeSchema.parse(item));
      const imported: Resume[] = [];
      for (const resume of validated) {
        const copy: Resume = {
          ...resume,
          metadata: {
            ...resume.metadata,
            id: crypto.randomUUID(),
            updatedAt: new Date().toISOString(),
          },
        };
        imported.push(await createResume(copy));
      }
      setResumes((current) => [...imported, ...current]);
    });
  }

  function remove(resume: Resume) {
    if (!window.confirm(`Permanently delete "${resume.metadata.title}"? This cannot be undone.`)) return;
    void run(async () => {
      try {
        await deleteResume(resume.metadata.id);
      } catch (error) {
        // Browser-only drafts may not yet exist on the remote API.
        if (!(error instanceof Error && error.message.endsWith(": 404"))) throw error;
      }
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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <button type="button" style={actionStyle} disabled={busy || loading} onClick={downloadBackup}>Export Backup</button>
            <label style={{ ...actionStyle, display: "inline-block" }}>
              Import JSON
              <input type="file" accept=".json,application/json" disabled={busy} style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importBackup(file);
                  event.target.value = "";
                }} />
            </label>
            <button type="button" style={{ ...actionStyle, backgroundColor: "#304f43", color: "#fff" }} disabled={busy} onClick={createNew}>+ New Resume</button>
          </div>
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
                  <button type="button" disabled={busy} style={actionStyle} onClick={() => rename(resume)}>Rename</button>
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
