export type AtsSeverity =
  | "info"
  | "warning"
  | "error";

export interface AtsCategoryScore {
  category: string;
  score: number;
  max_score: number;
}

export interface AtsFinding {
  id: string;
  severity: AtsSeverity;
  category: string;
  message: string;
}

export interface AtsAnalysisResult {
  overall_score: number;
  category_scores: AtsCategoryScore[];
  findings: AtsFinding[];
}