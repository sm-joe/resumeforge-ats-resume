"use client";

import type { CSSProperties } from "react";

import { sanitizeRichTextHtml } from "@/lib/richText";

interface SafeRichTextProps {
  html: string;
  style?: CSSProperties;
}

export function SafeRichText({
  html,
  style,
}: SafeRichTextProps) {
  return (
    <div
      className="rf-rich-text-content"
      style={style}
      dangerouslySetInnerHTML={{
        __html: sanitizeRichTextHtml(html),
      }}
    />
  );
}