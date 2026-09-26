"use client";

import { sanitizeRichTextHtml } from "@/lib/richText";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const editorStyle: CSSProperties = {
  minHeight: "120px",
  padding: "10px 12px",
  border: "1px solid #d0d5d2",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#1f2925",
  fontSize: "14px",
  lineHeight: 1.6,
  outline: "none",
  whiteSpace: "pre-wrap",
};

const toolbarButtonStyle: CSSProperties = {
  minWidth: "32px",
  height: "30px",
  padding: "0 8px",
  border: "1px solid #d9dfdc",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#34413c",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};

function ToolbarButton({
  label,
  children,
  onMouseDown,
}: {
  label: string;
  children: ReactNode;
  onMouseDown: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      style={toolbarButtonStyle}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  );
}

export function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const sanitizedValue =
      sanitizeRichTextHtml(value);

    const currentHtml = editor.innerHTML;

    if (
      currentHtml !== sanitizedValue &&
      sanitizedValue !== ""
    ) {
      editor.innerHTML = sanitizedValue;
    } else if (sanitizedValue === "") {
      editor.innerHTML = "";
    }
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    onChange(
      sanitizeRichTextHtml(editor.innerHTML),
    );
  };

  const runCommand = (
    command:
      | "bold"
      | "italic"
      | "underline",
  ) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(command, false);

    emitChange();
  };

  const insertBulletList = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    // Use the browser's native list formatting.
    // This preserves native Enter/Backspace/Delete
    // behavior inside list items.
    document.execCommand(
      "insertUnorderedList",
      false,
    );

    emitChange();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const selection = window.getSelection();
    let isInsideList = false;

    if (
      selection &&
      selection.rangeCount > 0
    ) {
      const range = selection.getRangeAt(0);

      let currentNode: Node | null =
        range.commonAncestorContainer;

      while (
        currentNode &&
        currentNode !== editor
      ) {
        if (
          currentNode.nodeName === "LI" ||
          currentNode.nodeName === "UL"
        ) {
          isInsideList = true;
          break;
        }

        currentNode = currentNode.parentNode;
      }
    }

    if (event.key === "Enter") {
      if (isInsideList) {
        // Let the browser natively create a new
        // list item or exit the list.
        setTimeout(() => emitChange(), 0);
        return;
      }

      event.preventDefault();

      document.execCommand(
        "insertHTML",
        false,
        "<br>",
      );

      emitChange();
    }

    if (
      event.key === "Backspace" ||
      event.key === "Delete"
    ) {
      setTimeout(() => emitChange(), 0);
    }
  };

  const handleInput = () => {
    emitChange();
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const text =
      event.clipboardData.getData("text/plain");

    document.execCommand(
      "insertText",
      false,
      text,
    );

    emitChange();
  };

  const handleFocus = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (
      editor.innerHTML === "" ||
      editor.innerHTML === "<br>"
    ) {
      editor.innerHTML = "";
    }
  };

  const minHeight =
    `${Math.max(rows, 3) * 24}px`;

  return (
    <label
      style={{
        display: "grid",
        gap: "7px",
      }}
    >
      <span>{label}</span>

      <div
        style={{
          display: "grid",
          gap: "8px",
        }}
      >
        <div
          role="toolbar"
          aria-label={`${label} formatting`}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <ToolbarButton
            label="Bold"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("bold");
            }}
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("italic");
            }}
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            label="Underline"
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand("underline");
            }}
          >
            <span
              style={{
                textDecoration: "underline",
              }}
            >
              U
            </span>
          </ToolbarButton>

          <ToolbarButton
            label="Bulleted list"
            onMouseDown={(event) => {
              event.preventDefault();
              insertBulletList();
            }}
          >
            • List
          </ToolbarButton>
        </div>

        <style>
          {`
            [data-rich-editor] ul {
              list-style-type: disc !important;
              margin: 0 !important;
              padding-left: 20px !important;
            }

            [data-rich-editor] li {
              display: list-item !important;
              text-align: left !important;
            }
          `}
        </style>

        <div
          ref={editorRef}
          data-rich-editor
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          data-placeholder={placeholder}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onPaste={handlePaste}
          style={{
            ...editorStyle,
            minHeight,
          }}
        />
      </div>
    </label>
  );
}