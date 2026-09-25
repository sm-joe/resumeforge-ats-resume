export type ResumeSectionId =
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "languages"
  | "skills";

export interface ResumeSectionOrderItem {
  id: ResumeSectionId;
  label: string;
}

export const DEFAULT_RESUME_SECTION_ORDER: ResumeSectionOrderItem[] = [
  {
    id: "summary",
    label: "Summary",
  },
  {
    id: "experience",
    label: "Experience",
  },
  {
    id: "education",
    label: "Education",
  },
  {
    id: "projects",
    label: "Projects",
  },
  {
    id: "certifications",
    label: "Certifications",
  },
  {
    id: "languages",
    label: "Languages",
  },
  {
    id: "skills",
    label: "Skills",
  },
];

export const RESUME_SECTION_ORDER_STORAGE_KEY =
  "resumeforge:resume-section-order";

export function isResumeSectionId(
  value: string,
): value is ResumeSectionId {
  return DEFAULT_RESUME_SECTION_ORDER.some(
    (section) => section.id === value,
  );
}

export function normalizeResumeSectionOrder(
  value: unknown,
): ResumeSectionOrderItem[] {
  if (!Array.isArray(value)) {
    return DEFAULT_RESUME_SECTION_ORDER;
  }

  const ids = value.filter(
    (item): item is string =>
      typeof item === "string" &&
      isResumeSectionId(item),
  );

  const uniqueIds = [...new Set(ids)];

  const normalizedIds = [
    ...uniqueIds,
    ...DEFAULT_RESUME_SECTION_ORDER
      .map((section) => section.id)
      .filter((id) => !uniqueIds.includes(id)),
  ];

  return normalizedIds.map(
    (id) =>
      DEFAULT_RESUME_SECTION_ORDER.find(
        (section) => section.id === id,
      )!,
  );
}

export function moveResumeSection(
  order: ResumeSectionOrderItem[],
  index: number,
  targetIndex: number,
): ResumeSectionOrderItem[] {
  if (
    index < 0 ||
    index >= order.length ||
    targetIndex < 0 ||
    targetIndex >= order.length ||
    index === targetIndex
  ) {
    return order;
  }

  const nextOrder = [...order];

  const [movedSection] = nextOrder.splice(
    index,
    1,
  );

  nextOrder.splice(
    targetIndex,
    0,
    movedSection,
  );

  return nextOrder;
}

export function removeResumeSection(
  order: ResumeSectionOrderItem[],
  index: number,
): ResumeSectionOrderItem[] {
  if (
    index < 0 ||
    index >= order.length
  ) {
    return order;
  }

  return order.filter(
    (_, currentIndex) =>
      currentIndex !== index,
  );
}