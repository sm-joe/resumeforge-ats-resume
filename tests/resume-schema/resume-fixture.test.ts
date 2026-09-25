import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { ResumeSchema } from "../../packages/resume-schema/src/index.js";

describe("canonical resume fixture", () => {
  it("matches the ResumeForge schema", () => {
    const filePath = resolve(
      import.meta.dirname,
      "../../examples/resume.json",
    );

    const content = readFileSync(filePath, "utf-8");
    const resume = JSON.parse(content);

    const result = ResumeSchema.safeParse(resume);

    expect(result.success).toBe(true);
  });
});