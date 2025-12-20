import type { ColumnDefinition } from '../types';

interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
  visibleColumnsOnly?: boolean;
}

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  filename: 'query_results',
  includeHeaders: true,
  delimiter: ',',
  visibleColumnsOnly: true,
};

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function convertToCSV(
  columns: ColumnDefinition[],
  rows: Record<string, unknown>[],
  options: ExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const columnsToExport = opts.visibleColumnsOnly
    ? columns.filter((col) => col.visible)
    : columns;

  const lines: string[] = [];

  if (opts.includeHeaders) {
    const headerLine = columnsToExport
      .map((col) => escapeCSVValue(col.label))
      .join(opts.delimiter);
    lines.push(headerLine);
  }

  for (const row of rows) {
    const rowLine = columnsToExport
      .map((col) => escapeCSVValue(row[col.key]))
      .join(opts.delimiter);
    lines.push(rowLine);
  }

  return lines.join('\n');
}

export function downloadCSV(
  columns: ColumnDefinition[],
  rows: Record<string, unknown>[],
  options: ExportOptions = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const csvContent = convertToCSV(columns, rows, opts);

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${opts.filename}_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function estimateCSVSize(
  columns: ColumnDefinition[],
  rows: Record<string, unknown>[]
): number {
  const avgCellSize = 20;
  const visibleColumns = columns.filter((c) => c.visible).length;
  return rows.length * visibleColumns * avgCellSize;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

