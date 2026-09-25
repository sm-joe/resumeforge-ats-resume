import { NextRequest } from "next/server";

const API_URL =
  process.env.RESUMEFORGE_API_URL ??
  "http://localhost:8000";

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.text();

    const response = await fetch(
      `${API_URL}/api/v1/export/pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      },
    );

    if (!response.ok) {
      const payload = await response.text();

      return new Response(payload, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ??
            "application/json",
        },
      });
    }

    const file = await response.arrayBuffer();

    return new Response(file, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ??
          "application/pdf",
        "Content-Disposition":
          response.headers.get(
            "Content-Disposition",
          ) ?? 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export proxy failed:", error);

    return Response.json(
      {
        detail:
          "Unable to connect to the ResumeForge API.",
      },
      { status: 502 },
    );
  }
}