"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  plainTextToRichTextHtml,
  sanitizeRichTextHtml,
} from "@/lib/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type Command =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "removeFormat";

const FONT_OPTIONS = [
  "Arial",
  "Calibri",
  "Georgia",
  "Helvetica",
  "Inter",
  "Times New Roman",
  "Verdana",
];

const SIZE_OPTIONS = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "XL", value: "5" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 150,
}: RichTextEditorProps) {
  const editorRef =
    useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || initializedRef.current) return;

    editor.innerHTML = value.includes("<")
      ? sanitizeRichTextHtml(value)
      : plainTextToRichTextHtml(value);

    initializedRef.current = true;
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    onChange(
      sanitizeRichTextHtml(editor.innerHTML),
    );
  };

  const execute = (command: Command) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    emitChange();
  };

  const setFont = (font: string) => {
    if (!font) return;

    editorRef.current?.focus();
    document.execCommand(
      "fontName",
      false,
      font,
    );
    emitChange();
  };

  const setSize = (size: string) => {
    if (!size) return;

    editorRef.current?.focus();
    document.execCommand(
      "fontSize",
      false,
      size,
    );
    emitChange();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "b"
    ) {
      event.preventDefault();
      execute("bold");
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "i"
    ) {
      event.preventDefault();
      execute("italic");
    }
  };

  return (
    <div
      className={`rf-rich-text-editor${
        focused ? " rf-rich-text-editor--focused" : ""
      }`}
    >
      <div
        className="rf-rich-text-toolbar"
        role="toolbar"
        aria-label="Rich text formatting"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
      >
        <button
          type="button"
          className="rf-rich-text-tool rf-rich-text-tool--strong"
          onClick={() => execute("bold")}
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>

        <button
          type="button"
          className="rf-rich-text-tool rf-rich-text-tool--italic"
          onClick={() => execute("italic")}
          title="Italic"
          aria-label="Italic"
        >
          I
        </button>

        <button
          type="button"
          className="rf-rich-text-tool rf-rich-text-tool--underline"
          onClick={() => execute("underline")}
          title="Underline"
          aria-label="Underline"
        >
          U
        </button>

        <span className="rf-rich-text-divider" />

        <button
          type="button"
          className="rf-rich-text-tool"
          onClick={() =>
            execute("insertUnorderedList")
          }
          title="Bulleted list"
          aria-label="Bulleted list"
        >
          • List
        </button>

        <button
          type="button"
          className="rf-rich-text-tool"
          onClick={() =>
            execute("insertOrderedList")
          }
          title="Numbered list"
          aria-label="Numbered list"
        >
          1. List
        </button>

        <span className="rf-rich-text-divider" />

        <select
          className="rf-rich-text-select"
          defaultValue=""
          onChange={(event) => {
            setFont(event.target.value);
            event.currentTarget.value = "";
          }}
          aria-label="Font family"
        >
          <option value="" disabled>
            Font
          </option>
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <select
          className="rf-rich-text-select"
          defaultValue=""
          onChange={(event) => {
            setSize(event.target.value);
            event.currentTarget.value = "";
          }}
          aria-label="Font size"
        >
          <option value="" disabled>
            Size
          </option>
          {SIZE_OPTIONS.map((size) => (
            <option
              key={size.value}
              value={size.value}
            >
              {size.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rf-rich-text-tool"
          onClick={() => execute("removeFormat")}
          title="Clear formatting"
        >
          Clear
        </button>
      </div>

      <div
        ref={editorRef}
        className="rf-rich-text-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        role="textbox"
        aria-multiline="true"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onInput={emitChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
