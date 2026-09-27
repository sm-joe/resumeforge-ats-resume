import type { Resume } from "@resumeforge/resume-schema";

export const demoResume: Resume = {
  schemaVersion: "1.0",

  design: {
    template: "modern",
    pageSize: "A4",
    fontFamily: "Inter",
    accentColor: "#24312d",
    spacing: "comfortable",
  },

  metadata: {
    id: "demo-resume-001",
    title: "Senior Cloud Architect",
    updatedAt: "2026-09-25T00:00:00Z",
  },

  profile: {
    name: "Alex Morgan",
    headline: "Senior Cloud Architect",
    email: "alex.morgan@example.com",
    phone: "+1 555 010 2040",
    location: "Berlin, Germany",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/alex-morgan",
      },
      {
        label: "GitHub",
        url: "https://github.com/alex-morgan",
      },
    ],
  },

  summary:
    "Senior Cloud Architect with extensive experience designing secure, scalable cloud platforms, infrastructure automation, and DevSecOps solutions.",

  experience: [
    {
      id: "experience-001",
      company: "Example Cloud Systems",
      title: "Senior Cloud Architect",
      location: "Berlin, Germany",
      startDate: "2022-03",
      current: true,
      bullets: [
        "Designed secure multi-account cloud architectures supporting production workloads.",
        "Implemented infrastructure automation using Terraform and CI/CD pipelines.",
      ],
    },
  ],

  education: [],

  projects: [],

  skills: {
    categories: [
      {
        id: "skills-cloud",
        name: "Cloud",
        items: ["AWS", "Azure", "Kubernetes"],
      },
      {
        id: "skills-infrastructure",
        name: "Infrastructure",
        items: ["Terraform", "Ansible", "Packer"],
      },
    ],
  },

  certifications: [],

  languages: [],

  customSections: [],
};