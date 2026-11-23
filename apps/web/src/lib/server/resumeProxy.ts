import "server-only";
import { NextRequest } from "next/server";

const API_URL = process.env.RESUMEFORGE_API_URL ?? "http://localhost:8000";
const KEY_PATTERN = /^[0-9a-f]{64}$/;

// Restrict forwarding to known CRUD resources and methods; never proxy arbitrary URLs.
export async function forwardResumeRequest(
  request: NextRequest,
  segments: string[],
): Promise<Response> {
  const key = request.headers.get("X-Resume-Key") ?? "";
  if (!KEY_PATTERN.test(key)) {
    return Response.json({ detail: "Resume ownership key required" }, { status: 401 });
  }
  if (segments.length > 1 || (segments.length === 1 && !/^[a-zA-Z0-9_-]{1,255}$/.test(segments[0]))) {
    return Response.json({ detail: "Invalid resume identifier" }, { status: 400 });
  }
  const path = segments.length ? `/${encodeURIComponent(segments[0])}` : "";
  const upstream = `${API_URL}/api/v1/resumes${path}`;
  try {
    const method = request.method;
    const body = method === "POST" || method === "PUT" ? await request.text() : undefined;
    if (body && body.length > 1024 * 1024) {
      return Response.json({ detail: "Resume payload too large" }, { status: 413 });
    }
    const response = await fetch(upstream, {
      method,
      headers: {
        "X-Resume-Key": key,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(response.status === 204 ? null : await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Resume API proxy failed:", error);
    return Response.json({ detail: "Unable to connect to ResumeForge API" }, { status: 502 });
  }
}
