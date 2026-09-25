"use client";

import { useState } from "react";

import type { ResumeSectionOrderItem } from "@/lib/resume/sectionOrder";

interface SectionOrderEditorProps {
  order: ResumeSectionOrderItem[];
  onMove: (
    index: number,
    targetIndex: number,
  ) => void;
  onReset: () => void;
  onDelete: (index: number) => void;
}

export function SectionOrderEditor({
  order,
  onMove,
  onReset,
  onDelete,
}: SectionOrderEditorProps) {
  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const [dragOverIndex, setDragOverIndex] =
    useState<number | null>(null);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
    setDragOverIndex(index);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      String(index),
    );
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    if (
      draggedIndex !== null &&
      draggedIndex !== index
    ) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();

    const sourceIndex =
      draggedIndex ??
      Number(
        event.dataTransfer.getData("text/plain"),
      );

    if (
      Number.isInteger(sourceIndex) &&
      sourceIndex >= 0 &&
      sourceIndex < order.length &&
      sourceIndex !== targetIndex
    ) {
      onMove(sourceIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <section>
      {/* =================================================
          HEADER
          ================================================= */}

      <div className="rf-panel-header">
        <p className="rf-eyebrow">
          Resume Layout
        </p>

        <h2>Section Order</h2>

        <p>
          Drag sections to change their order in your
          resume.
        </p>
      </div>

      {/* =================================================
          ORDER LIST
          ================================================= */}

      <div
        style={{
          padding: "8px",
          display: "grid",
          gap: "6px",
        }}
      >
        {order.map((section, index) => {
          const isDragging =
            draggedIndex === index;

          const isDragTarget =
            dragOverIndex === index &&
            draggedIndex !== index;

          const isFirst = index === 0;
          const isLast =
            index === order.length - 1;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(event) =>
                handleDragStart(event, index)
              }
              onDragOver={(event) =>
                handleDragOver(event, index)
              }
              onDrop={(event) =>
                handleDrop(event, index)
              }
              onDragEnd={handleDragEnd}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr auto",
                alignItems: "center",
                gap: "8px",
                padding: "10px",
                border: isDragTarget
                  ? "1px solid #4545b8"
                  : "1px solid #eaecf0",
                borderRadius: "10px",
                background: isDragging
                  ? "#f5f5ff"
                  : "#ffffff",
                boxShadow: isDragging
                  ? "0 4px 12px rgba(16, 24, 40, 0.12)"
                  : "none",
                opacity: isDragging ? 0.65 : 1,
                cursor: "grab",
                transform: isDragTarget
                  ? "translateY(-2px)"
                  : "none",
                transition:
                  "border-color 120ms ease, background 120ms ease, box-shadow 120ms ease, transform 120ms ease",
              }}
            >
              {/* =================================================
                  SECTION NAME
                  ================================================= */}

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                {/* Drag handle */}

                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: "18px",
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    color: "#98a2b3",
                    fontSize: "11px",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  ⋮
                  ⋮
                </span>

                {/* Position */}

                <span
                  style={{
                    flexShrink: 0,
                    width: "24px",
                    height: "24px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "7px",
                    background: "#f2f4f7",
                    color: "#667085",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>

                {/* Name */}

                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#344054",
                    fontSize: "12px",
                    fontWeight: 650,
                  }}
                >
                  {section.label}
                </span>
              </div>

              {/* =================================================
                  CONTROLS
                  ================================================= */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <button
                  type="button"
                  aria-label={`Move ${section.label} up`}
                  title="Move up"
                  disabled={isFirst}
                  onClick={() =>
                    onMove(
                      index,
                      index - 1,
                    )
                  }
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border:
                      "1px solid #d0d5dd",
                    borderRadius: "7px",
                    background: isFirst
                      ? "#f9fafb"
                      : "#ffffff",
                    color: isFirst
                      ? "#d0d5dd"
                      : "#475467",
                    cursor: isFirst
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    lineHeight: 1,
                  }}
                >
                  ↑
                </button>

                <button
                  type="button"
                  aria-label={`Move ${section.label} down`}
                  title="Move down"
                  disabled={isLast}
                  onClick={() =>
                    onMove(
                      index,
                      index + 1,
                    )
                  }
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border:
                      "1px solid #d0d5dd",
                    borderRadius: "7px",
                    background: isLast
                      ? "#f9fafb"
                      : "#ffffff",
                    color: isLast
                      ? "#d0d5dd"
                      : "#475467",
                    cursor: isLast
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    lineHeight: 1,
                  }}
                >
                  ↓
                </button>

                <button
                  type="button"
                  aria-label={`Remove ${section.label} from section order`}
                  title="Remove"
                  onClick={() =>
                    onDelete(index)
                  }
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    border:
                      "1px solid #fecdca",
                    borderRadius: "7px",
                    background: "#ffffff",
                    color: "#b42318",
                    cursor: "pointer",
                    fontSize: "13px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================
          FOOTER
          ================================================= */}

      <div
        style={{
          padding:
            "8px 12px 12px",
          display: "flex",
          justifyContent:
            "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onReset}
          className="rf-button rf-button-secondary"
        >
          Reset order
        </button>
      </div>
    </section>
  );
}