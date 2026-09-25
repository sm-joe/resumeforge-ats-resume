import { describe, expect, it } from "vitest";
import { ResumeSchema } from "../../packages/resume-schema/src/index.js";

describe("ResumeSchema", () => {
  it("accepts a valid resume", () => {
    const resume = {
      schemaVersion: "1.0",

      metadata: {
        id: "resume-demo-001",
        title: "Demo Resume",
        updatedAt: "2026-09-25T00:00:00Z",
      },

      profile: {
        name: "Jane Doe",
        headline: "Senior Cloud Architect",
        email: "jane@example.com",
        phone: "+91 98765 43210",
        location: "India",
        links: [
          {
            label: "LinkedIn",
            url: "https://www.linkedin.com/in/janedoe",
          },
          {
            label: "GitHub",
            url: "https://github.com/janedoe",
          },
        ],
      },

      summary:
        "Senior cloud architect with extensive experience designing secure, scalable cloud infrastructure.",

      experience: [
        {
          id: "experience-001",
          company: "Example Technologies",
          title: "Senior Cloud Architect",
          location: "India",
          startDate: "2023-01",
          current: true,
          bullets: [
            "Designed secure multi-account AWS infrastructure.",
            "Improved deployment reliability through infrastructure automation.",
          ],
        },
      ],

      education: [
        {
          id: "education-001",
          institution: "Example University",
          degree: "Bachelor of Technology",
          field: "Computer Science",
          location: "India",
          startDate: "2008",
          endDate: "2012",
        },
      ],

      projects: [
        {
          id: "project-001",
          name: "ResumeForge",
          description: "Portable ATS-friendly resume engineering platform.",
          url: "https://github.com/example/resumeforge",
          technologies: ["Next.js", "FastAPI", "Docker", "Kubernetes"],
          bullets: [
            "Built a portable resume platform with local ATS analysis.",
          ],
        },
      ],

      skills: {
        categories: [
          {
            id: "skills-cloud",
            name: "Cloud",
            items: ["AWS", "Azure", "Terraform"],
          },
          {
            id: "skills-security",
            name: "Security",
            items: ["IAM", "CloudTrail", "GuardDuty"],
          },
        ],
      },

      certifications: [
        {
          id: "certification-001",
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2025",
        },
      ],

      languages: [
        {
          id: "language-001",
          name: "English",
          proficiency: "Professional",
        },
      ],

      customSections: [],
    };

    const result = ResumeSchema.safeParse(resume);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const resume = {
      schemaVersion: "1.0",

      metadata: {
        id: "resume-invalid-001",
        title: "Invalid Resume",
        updatedAt: "2026-09-25T00:00:00Z",
      },

      profile: {
        name: "Jane Doe",
        email: "not-an-email",
      },

      skills: {
        categories: [],
      },
    };

    const result = ResumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported schema version", () => {
    const resume = {
      schemaVersion: "2.0",

      metadata: {
        id: "resume-invalid-002",
        title: "Invalid Resume",
        updatedAt: "2026-09-25T00:00:00Z",
      },

      profile: {
        name: "Jane Doe",
      },

      skills: {
        categories: [],
      },
    };

    const result = ResumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
  });
});