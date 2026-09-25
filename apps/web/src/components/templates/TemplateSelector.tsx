"use client";

import { resumeTemplates } from "@/lib/templates";

interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function TemplateSelector({
  value,
  onChange,
}: TemplateSelectorProps) {
  return (
    <label className="rf-template-selector">
      <span>Template</span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {resumeTemplates.map((template) => (
          <option
            key={template.id}
            value={template.id}
          >
            {template.name}
          </option>
        ))}
      </select>
    </label>
  );
}