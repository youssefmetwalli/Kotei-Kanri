// src/types/backend.ts

export type ExecutionResultCode = "pass" | "fail" | "warn" | "" | null;
export type ExecutionStatusCode =
  | "draft"
  | "running"
  | "completed"
  | "approved"
  | "rejected";

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Checklist {
  id: number;
  name: string;
  // From ChecklistSerializer in the backend; can be null
  category: Category | null;
}

export interface Execution {
  id: number;
  result: ExecutionResultCode;
  status: ExecutionStatusCode;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;

  // for quality control
  checklist?: Checklist | null;
  process_sheet?: ProcessSheet | null;
  executor?: string | { id: number; username: string } | null;
}

export type ProcessStatusCode = "planning" | "preparing" | "running" | "done";

export interface ProcessSheet {
  id: number;
  name: string;
  project_name: string;
  status: ProcessStatusCode;
  status_display: string;
  priority: number;
  assignee: string;
  planned_start: string | null;
  planned_end: string | null;
  checklist: Checklist | null;
  notes: string | null;
  lot_number: string;
  inspector: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export type ItemStatusCode = "OK" | "NG" | "SKIP";

export interface ExecutionItemResult {
  id: number;
  status: ItemStatusCode;
  value: string;
  note: string;
  created_at: string;
}

export type CheckItemType = "number" | "text" | "select" | "boolean" | "photo";

export interface CheckItem {
  id: number;
  name: string;
  type: CheckItemType;
  category: number | null;
  category_detail?: { id: number; name: string } | null;
  required: boolean;
  unit: string;
  description: string;
  options: any[];

  tags: string;
  min_value: number | null;
  max_value: number | null;
  decimal_places: number;
  default_value: number | null;
  error_message: string;
  allow_handwriting: boolean;
  reference_image: string;

  created_at: string;
  updated_at: string;
}