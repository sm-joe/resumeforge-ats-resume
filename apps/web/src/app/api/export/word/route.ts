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
      `${API_URL}/api/v1/export/word`,
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
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          response.headers.get(
            "Content-Disposition",
          ) ??
          'attachment; filename="resume.docx"',
      },
    });
  } catch (error) {
    console.error("Word export proxy failed:", error);

    return Response.json(
      {
        detail:
          "Unable to connect to the ResumeForge API.",
      },
      { status: 502 },
    );
  }
}