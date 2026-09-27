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

  /*
   * Restore the user's locally saved resume once the
   * browser is available.
   */
  useEffect(() => {
    try {
      const storedResume =
        window.localStorage.getItem(STORAGE_KEY);

      if (storedResume) {
        const parsedResume = JSON.parse(
          storedResume,
        ) as Resume & {
          sectionOrder?: unknown;
        };

        const {
          sectionOrder: _sectionOrder,
          ...resumeWithoutSectionOrder
        } = parsedResume;

        dispatch({
          type: "resume/replace",
          resume: resumeWithoutSectionOrder as Resume,
        });

        dispatch({
          type: "editor/mark-saved",
          savedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(
        "Failed to restore ResumeForge draft:",
        error,
      );
    } finally {
      hasHydratedDraft.current = true;
    }
  }, []);

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

    const timeout = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        const serializedResume = JSON.stringify(
          state.resume,
        );

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

        dispatch({
          type: "editor/mark-saved",
          savedAt,
        });
      } catch (error) {
        console.error(
          "Failed to auto-save ResumeForge draft:",
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