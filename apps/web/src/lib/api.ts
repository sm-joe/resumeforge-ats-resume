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

export async function getResume(
  resumeId: string,
): Promise<Resume> {
  const response = await apiFetch(
    `/api/v1/resumes/${encodeURIComponent(resumeId)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load resume: ${response.status}`,
    );
  }

  return response.json() as Promise<Resume>;
}

export async function createResume(
  resume: Resume,
): Promise<Resume> {
  const response = await apiFetch(
    "/api/v1/resumes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resume),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create resume: ${response.status}`,
    );
  }

  return response.json() as Promise<Resume>;
}

export async function updateResume(
  resumeId: string,
  resume: Resume,
): Promise<Resume> {
  const response = await apiFetch(
    `/api/v1/resumes/${encodeURIComponent(resumeId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resume),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update resume: ${response.status}`,
    );
  }

  return response.json() as Promise<Resume>;
}

export async function deleteResume(
  resumeId: string,
): Promise<void> {
  const response = await apiFetch(
    `/api/v1/resumes/${encodeURIComponent(resumeId)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete resume: ${response.status}`,
    );
  }
}