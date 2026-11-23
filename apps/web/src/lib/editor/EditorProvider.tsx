"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import type { Resume } from "@resumeforge/resume-schema";

import { saveResume } from "../api";
import { editorReducer } from "./reducer";
import type { EditorState, ResumeAction } from "./types";

const STORAGE_KEY = "resumeforge:resume:draft";
const VERSIONS_STORAGE_KEY =
  "resumeforge:resume:versions";

const MAX_RESUME_VERSIONS = 50;

interface ResumeVersion {
  id: string;
  resume: Resume;
  savedAt: string;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<ResumeAction>;
}

const EditorContext =
  createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  initialResume: Resume;
  children: ReactNode;
}

export function EditorProvider({
  initialResume,
  children,
}: EditorProviderProps) {
  const [state, dispatch] = useReducer(
    editorReducer,
    {
      resume: initialResume,
      isDirty: false,
      lastSavedAt: null,
    },
  );

  const hasHydratedDraft = useRef(false);

  // Keep server demo data immutable. Each browser gets its own draft ID.
  const latestResumeRef = useRef(state.resume);
  latestResumeRef.current = state.resume;
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let restored: Resume = initialResume;
    try {
      const draft = window.localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft) as Resume & { sectionOrder?: unknown };
        const { sectionOrder: _sectionOrder, ...resume } = parsed;
        if (resume.metadata?.id && resume.profile && resume.skills) {
          restored = resume as Resume;
        }
      }
    } catch (error) {
      console.error("Failed to restore ResumeForge draft:", error);
    }

    // Previously saved, unowned server records cannot be claimed securely.
    // Preserve their browser content under a fresh private ID on migration.
    const needsOwnershipMigration =
      !window.localStorage.getItem("resumeforge:owner-key");
    if (needsOwnershipMigration && restored.metadata.id !== "demo-resume-001") {
      restored = {
        ...restored,
        metadata: {
          ...restored.metadata,
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    if (restored.metadata.id === "demo-resume-001") {
      restored = {
        ...restored,
        metadata: {
          ...restored.metadata,
          id: crypto.randomUUID(),
          title: restored.metadata.title || "My Resume",
          updatedAt: new Date().toISOString(),
        },
      };
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    } catch (error) {
      console.error("Unable to persist local resume draft:", error);
    }
    hasHydratedDraft.current = true;
    // Mark dirty to create or reconcile the browser-owned draft with the API.
    dispatch({ type: "resume/replace", resume: restored });
  }, [initialResume]);

  // Browser recovery does not depend on network availability or a successful API save.
  useEffect(() => {
    if (!hasHydratedDraft.current || !state.isDirty) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.resume));
    } catch (error) {
      console.error("Unable to persist local resume changes:", error);
    }
  }, [state.resume, state.isDirty]);

  /*
   * Persist changes automatically after a short debounce.
   *
   * We intentionally wait until draft hydration has completed
   * so the initial API resume cannot overwrite an existing draft.
   */
  useEffect(() => {
    if (!hasHydratedDraft.current) {
      return;
    }

    if (!state.isDirty) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const savedAt = new Date().toISOString();
      const serializedResume = JSON.stringify(
        state.resume,
      );

      try {
        /*
         * Persist the resume through the API.
         */
        // Serialize remote writes so an older response cannot overtake a newer one.
        const snapshot = state.resume;
        const pending = saveQueueRef.current.then(async () => {
          await saveResume(snapshot);
        });
        saveQueueRef.current = pending.catch(() => undefined);
        await pending;

        /*
         * Existing draft persistence.
         * Keep this behavior unchanged.
         */
        window.localStorage.setItem(
          STORAGE_KEY,
          serializedResume,
        );

        /*
         * Version history.
         *
         * Store complete resume snapshots so a future
         * Versions UI can restore any previous state.
         */
        const storedVersions =
          window.localStorage.getItem(
            VERSIONS_STORAGE_KEY,
          );

        let versions: ResumeVersion[] = [];

        if (storedVersions) {
          try {
            const parsedVersions = JSON.parse(
              storedVersions,
            );

            if (Array.isArray(parsedVersions)) {
              versions = parsedVersions;
            }
          } catch {
            versions = [];
          }
        }

        /*
         * Avoid creating duplicate versions when the same
         * resume content is saved more than once.
         */
        const latestVersion =
          versions[0];

        const latestSerializedResume =
          latestVersion
            ? JSON.stringify(latestVersion.resume)
            : null;

        if (
          latestSerializedResume !==
          serializedResume
        ) {
          const newVersion: ResumeVersion = {
            id: `${state.resume.metadata.id}:${Date.now()}`,
            resume: state.resume,
            savedAt,
          };

          versions = [
            newVersion,
            ...versions,
          ].slice(0, MAX_RESUME_VERSIONS);

          window.localStorage.setItem(
            VERSIONS_STORAGE_KEY,
            JSON.stringify(versions),
          );
        }

        if (JSON.stringify(latestResumeRef.current) === serializedResume) {
          dispatch({ type: "editor/mark-saved", savedAt });
        }
      } catch (error) {
        console.error(
          "Failed to auto-save ResumeForge resume:",
          error,
        );
      }
    }, 600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.resume, state.isDirty]);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used within an EditorProvider",
    );
  }

  return context;
}