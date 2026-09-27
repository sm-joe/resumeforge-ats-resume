import { z } from "zod";

export const LinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(LinkSchema).default([]),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  technologies: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
});

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().optional(),
});

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  proficiency: z.string().optional(),
});

export const SkillsSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      items: z.array(z.string()).default([]),
    }),
  ).default([]),
});

export const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  items: z.array(z.string()).default([]),
});

export const ResumeDesignSchema = z.object({
  template: z.string().default("modern"),
  pageSize: z.enum(["A4", "LETTER"]).default("A4"),
  fontFamily: z.string().default("Inter"),
  accentColor: z.string().default("#24312d"),
  spacing: z
    .enum(["compact", "comfortable", "spacious"])
    .default("comfortable"),
});

export const ResumeSchema = z.object({
  schemaVersion: z.literal("1.0"),

  metadata: z.object({
    id: z.string(),
    title: z.string().default("Untitled Resume"),
    updatedAt: z.string(),
  }),

    design: ResumeDesignSchema.default({
    template: "modern",
    pageSize: "A4",
    fontFamily: "Inter",
    accentColor: "#24312d",
    spacing: "comfortable",
  }),

  profile: ProfileSchema,

  summary: z.string().default(""),

  experience: z.array(ExperienceSchema).default([]),

  education: z.array(EducationSchema).default([]),

  projects: z.array(ProjectSchema).default([]),

  skills: SkillsSchema,

  certifications: z.array(CertificationSchema).default([]),

  languages: z.array(LanguageSchema).default([]),

  customSections: z.array(CustomSectionSchema).default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;