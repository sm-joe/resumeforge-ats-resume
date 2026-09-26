"use client";

import { useState } from "react";

import { useEditor } from "@/lib/editor/EditorProvider";

type ExportFormat = "pdf" | "word";

export function ExportActions() {
  const { state } = useEditor();
  const [exporting, setExporting] =
    useState<ExportFormat | null>(null);
  const [error, setError] = useState("");

  const handlePdfExport = () => {
    setError("");
    setExporting("pdf");

    const handleAfterPrint = () => {
      setExporting(null);
      window.removeEventListener(
        "afterprint",
        handleAfterPrint,
      );
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint,
    );

    window.print();
  };

  const handleWordExport = async () => {
    setExporting("word");
    setError("");

    try {
      const response = await fetch(
        "/api/export/word",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state.resume),
        },
      );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => null);

        throw new Error(
          payload?.detail ||
            `Export failed with status ${response.status}`,
        );
      }

      const blob = await response.blob();

      const contentDisposition =
        response.headers.get(
          "Content-Disposition",
        );

      const filenameMatch =
        contentDisposition?.match(
          /filename="?([^"]+)"?/i,
        );

      const filename =
        filenameMatch?.[1] ||
        `${
          state.resume.metadata.title ||
          "resumeforge-resume"
        }.docx`;

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Word export failed.",
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={handlePdfExport}
        disabled={exporting !== null}
        style={{
          padding: "9px 14px",
          border: "1px solid #4545b8",
          borderRadius: "9px",
          background: "#4545b8",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 650,
          cursor:
            exporting !== null
              ? "not-allowed"
              : "pointer",
          opacity:
            exporting !== null ? 0.65 : 1,
        }}
      >
        {exporting === "pdf"
          ? "Preparing PDF..."
          : "Export PDF"}
      </button>

      <button
        type="button"
        onClick={handleWordExport}
        disabled={exporting !== null}
        style={{
          padding: "9px 14px",
          border: "1px solid #4545b8",
          borderRadius: "9px",
          background: "#4545b8",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 650,
          cursor:
            exporting !== null
              ? "not-allowed"
              : "pointer",
          opacity:
            exporting !== null ? 0.65 : 1,
        }}
      >
        {exporting === "word"
          ? "Exporting Word..."
          : "Export Word"}
      </button>

      {error && (
        <span
          role="alert"
          style={{
            width: "100%",
            color: "#b42318",
            fontSize: "12px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}