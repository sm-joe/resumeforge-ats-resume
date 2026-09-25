import type { Resume } from "@resumeforge/resume-schema";

const API_URL =
  process.env.RESUMEFORGE_API_URL ??
  "http://localhost:8000";

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_URL}${path}`, init);
}

export async function getDemoResume(): Promise<Resume> {
  const response = await apiFetch(
    "/api/v1/resumes/demo",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load demo resume: ${response.status}`,
    );
  }

  return response.json() as Promise<Resume>;
}