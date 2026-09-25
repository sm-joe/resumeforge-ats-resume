"use client";

import { useState } from "react";

import type { Resume } from "@resumeforge/resume-schema";

type ExportFormat = "pdf" | "word";

interface ExportActionsProps {
  resume: Resume;
}

function getFilename(
  response: Response,
  resume: Resume,
  format: ExportFormat,
): string {
  const contentDisposition =
    response.headers.get(
      "content-disposition",
    );

  const filenameMatch =
    contentDisposition?.match(
      /filename="([^"]+)"/i,
    );

  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  const title =
    resume.metadata.title.trim() ||
    "resumeforge-resume";

  const safeTitle = title
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .trim();

  return `${safeTitle}.${format === "pdf" ? "pdf" : "docx"}`;
}

async function downloadExport(
  resume: Resume,
  format: ExportFormat,
): Promise<void> {
  const response = await fetch(
    `/api/export/${format}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resume),
    },
  );

  if (!response.ok) {
    let message =
      `Failed to export ${format.toUpperCase()}.`;

    try {
      const payload = await response.json();

      if (
        payload &&
        typeof payload.detail === "string"
      ) {
        message = payload.detail;
      }
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const filename = getFilename(
    response,
    resume,
    format,
  );

  const objectUrl =
    window.URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export function ExportActions({
  resume,
}: ExportActionsProps) {
  const [exporting, setExporting] =
    useState<ExportFormat | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const handleExport = async (
    format: ExportFormat,
  ) => {
    if (exporting) {
      return;
    }

    setError(null);
    setExporting(format);

    try {
      await downloadExport(
        resume,
        format,
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Export failed.",
      );
    } finally {
      setExporting(null);
    }
  };

  const isExporting =
    exporting !== null;

  return (
    <div
      style={{
        display: "grid",
        gap: "7px",
        justifyItems: "end",
      }}
    >
      <div
        className="rf-actions"
        style={{
          marginTop: 0,
          gap: "8px",
        }}
      >
        <button
          type="button"
          className="rf-button rf-button-secondary"
          onClick={() =>
            handleExport("word")
          }
          disabled={isExporting}
          aria-label="Export resume as Word document"
        >
          {exporting === "word"
            ? "Exporting Word..."
            : "Word"}
        </button>

        <button
          type="button"
          className="rf-button rf-button-primary"
          onClick={() =>
            handleExport("pdf")
          }
          disabled={isExporting}
          aria-label="Export resume as PDF"
        >
          {exporting === "pdf"
            ? "Exporting PDF..."
            : "PDF"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            maxWidth: "360px",
            margin: 0,
            color: "var(--danger)",
            fontSize: "11px",
            lineHeight: 1.4,
            textAlign: "right",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}