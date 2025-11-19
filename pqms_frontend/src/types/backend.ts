export type ExecutionResultCode = "pass" | "fail" | "warn" | "" | null;

export type ExecutionStatusCode =
  | "draft"
  | "running"
  | "completed"
  | "approved"
  | "rejected";

export interface Execution {
  id: number;
  result: ExecutionResultCode;
  status: ExecutionStatusCode;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  checklist?: Checklist | null;
  process_sheet?: ProcessSheet | null;

  executor?: string | { id: number; username: string } | null;
}

// --------------------------------------------------------
// Category
// --------------------------------------------------------
export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// --------------------------------------------------------
// CheckItem
// --------------------------------------------------------
export type CheckItemType =
  | "number"
  | "text"
  | "select"
  | "boolean"
  | "photo";

export interface CheckItem {
  id: number;
  name: string;
  type: CheckItemType;
  category: number | Category | null;
  required: boolean;
  unit: string;
  description: string | null;
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

// --------------------------------------------------------
// ChecklistItem
// --------------------------------------------------------
export interface ChecklistItem {
  id: number;

  checklist: number;
  check_item: CheckItem | number;

  order: number;
  required: boolean;
  instruction: string | null;
  unit: string;
  options: any[];

  created_at: string;
  updated_at: string;
}

// --------------------------------------------------------
// Checklist
// --------------------------------------------------------
export interface Checklist {
  id: number;
  name: string;
  description: string | null;
  category: Category | number | null;
  items?: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export type ProcessStatusCode =
  | "planning"
  | "preparing"
  | "running"
  | "done";

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
