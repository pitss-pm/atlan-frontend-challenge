export interface QueryTab {
  id: string;
  name: string;
  sql: string;
  isExecuting: boolean;
  result: QueryResult | null;
  error: string | null;
  executedAt: number | null;
}

export interface QueryResult {
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
  totalRows: number;
  executionTime: number;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width: number;
  visible: boolean;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  executedAt: number;
  rowCount: number;
  executionTime: number;
  tabId: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface SharedQuery {
  id: string;
  sql: string;
  result: QueryResult | null;
  sharedAt: number;
  expiresAt: number;
}

export type ExecutionStatus = 'idle' | 'executing' | 'success' | 'error' | 'cancelled';
