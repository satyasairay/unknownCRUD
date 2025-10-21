export type ReviewState =
  | "draft"
  | "review_pending"
  | "approved"
  | "locked"
  | "rejected"
  | "flagged";

export interface WorkSummary {
  work_id: string;
  title: Record<string, string | null>;
  langs: string[];
}

export interface SourceEdition {
  id: string;
  lang: string;
  type: string;
  provenance?: string | null;
}

export interface WorkDetail extends WorkSummary {
  author?: string | null;
  canonical_lang: string;
  structure: Record<string, string | null>;
  source_editions: SourceEdition[];
  policy?: Record<string, unknown>;
}

export interface VerseDraft {
  verseId?: string;
  manualNumber: string;
  systemOrder: number | null;
  texts: Record<string, string>;
  tags: string[];
  origin: OriginEntry[];
  status: ReviewState;
}

export interface OriginEntry {
  edition: string;
  page?: number | null;
  para_index?: number | null;
}

export interface SavePayload {
  number_manual: string;
  texts: Record<string, string | null>;
  origin: OriginEntry[];
  tags: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  twoFactorEnabled?: boolean;
}
