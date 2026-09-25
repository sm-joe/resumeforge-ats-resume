export type MatchFindingSeverity =
  | "info"
  | "warning"
  | "error";

export type MatchRequirementStatus =
  | "matched"
  | "partial"
  | "missing";

export interface MatchFinding {
  id: string;
  severity: MatchFindingSeverity;
  category: string;
  message: string;
}

export interface MatchCategoryScore {
  category: string;
  score: number;
  max_score: number;
}

export interface MatchRequirement {
  term: string;
  status: MatchRequirementStatus;
  evidence: string[];
}

export interface ResponsibilityRequirement {
  requirement: string;
  status: MatchRequirementStatus;
  matched_terms: string[];
  evidence: string[];
}

export interface ExperienceAlignment {
  required_years: number | null;
  resume_years: number | null;
  status:
    | "matched"
    | "partial"
    | "missing"
    | "missing_evidence"
    | "not_specified";
}

export interface JobMatchRequirements {
  required_skills: MatchRequirement[];
  preferred_skills: MatchRequirement[];
  responsibilities: ResponsibilityRequirement[];
  experience: ExperienceAlignment;
  education: MatchRequirement[];
  certifications: MatchRequirement[];
}

export interface JobMatchResult {
  overall_score: number;
  role_title: string;
  category_scores: MatchCategoryScore[];
  requirements: JobMatchRequirements;
  matched_keywords: string[];
  missing_keywords: string[];
  partial_keywords: string[];
  keyword_coverage: number;
  findings: MatchFinding[];
  recommendations: string[];
}