"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  plainTextToRichTextHtml,
  sanitizeRichTextHtml,
} from "@/lib/rich-text/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

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
  { label: "Small", value: "12px" },  // 🌟 CHANGE: Switched legacy string digits to standard CSS sizes
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "XL", value: "24px" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 150,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);
  
  // 🌟 CHANGE: Added a saved selection ref to prevent select boxes from dropping user highlighting
  const savedSelectionRef = useRef<Range | null>(null);

  // 🌟 CHANGE: Smarter value synchronization that avoids resetting the cursor on every single keypress
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalizedValue = value.includes("<")
      ? sanitizeRichTextHtml(value)
      : plainTextToRichTextHtml(value);

    // Only update innerHTML if it's genuinely different from the editor's current internal state
    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    onChange(sanitizeRichTextHtml(editor.innerHTML));
  };

  // 🌟 CHANGE: Helper to capture and restore highlighted text nodes safely across clicks and selections
  const restoreSelection = () => {
    if (!savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // 🌟 CHANGE: Replaced deprecated execCommand with safe, future-proof semantic DOM node injection 
  const executeToggle = (tagName: string) => {
    editorRef.current?.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Fallback wrapper for un-highlighted text points
    if (range.collapsed) {
      const element = document.createElement(tagName);
      element.innerHTML = "&#8203;"; // Zero-width space allows typing inside the tag immediately
      range.insertNode(element);
      
      // Relocate the user's cursor inside the new tag element layout cleanly
      const newRange = document.createRange();
      newRange.setStart(element, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const element = document.createElement(tagName);
      try {
        element.appendChild(range.extractContents());
        range.insertNode(element);
      } catch (e) {
        // Fallback execution if the DOM extraction catches crossed boundaries
        document.execCommand(tagName === "strong" ? "bold" : "italic", false);
      }
    }
    emitChange();
  };

  // 🌟 CHANGE: Refactored Style/Font engine using standards-compliant inline style wrappers
  const applyInlineStyle = (styleName: string, styleValue: string) => {
    editorRef.current?.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.setProperty(styleName, styleValue);

    span.appendChild(range.extractContents());
    range.insertNode(span);
    emitChange();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      executeToggle("strong");
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      executeToggle("em");
    }
  };

  // 🌟 CHANGE: Tracks blur selection states to cleanly support toolbar custom changes without losing text ranges
  const handleEditorBlur = () => {
    setFocused(false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  return (
    <div className={`rf-rich-text-editor${focused ? " rf-rich-text-editor--focused" : ""}`}>
      <div
        className="rf-rich-text-toolbar"
        role="toolbar"
        aria-label="Rich text formatting"
        onMouseDown={(event) => {
          event.preventDefault(); // Prevents drop focus structural shifts
        }}
      >
        <button
          type="button"
          className="rf-rich-text-tool rf-rich-text-tool--strong"
          onClick={() => executeToggle("strong")} // 🌟 CHANGE: Switched to robust DOM toggle engine
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>

        <button
          type="button"
          className="rf-rich-text-tool rf-rich-text-tool--italic"
          onClick={() => executeToggle("em")} // 🌟 CHANGE: Changed from 'i' to standard 'em' semantic structure
          title="Italic"
          aria-label="Italic"
        >
          I
        </button>

        <span className="rf-rich-text-divider" />

        <select
          className="rf-rich-text-select"
          defaultValue=""
          onChange={(event) => {
            applyInlineStyle("font-family", event.target.value);
            event.currentTarget.value = "";
          }}
          aria-label="Font family"
        >
          <option value="" disabled>Font</option>
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <select
          className="rf-rich-text-select"
          defaultValue=""
          onChange={(event) => {
            applyInlineStyle("font-size", event.target.value);
            event.currentTarget.value = "";
          }}
          aria-label="Font size"
        >
          <option value="" disabled>Size</option>
          {SIZE_OPTIONS.map((size) => (
            <option key={size.value} value={size.value}>{size.label}</option>
          ))}
        </select>
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
        onBlur={handleEditorBlur} // 🌟 CHANGE: Calls updated blur cache mechanism
        onInput={emitChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
