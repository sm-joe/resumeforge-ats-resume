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
        ) as Resume;

        dispatch({
          type: "resume/replace",
          resume: parsedResume,
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
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state.resume),
        );

        dispatch({
          type: "editor/mark-saved",
          savedAt: new Date().toISOString(),
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