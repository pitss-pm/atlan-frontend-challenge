/**
 * CSV Export Utility Tests
 * Tests CSV conversion and export functionality
 */

import { convertToCSV, estimateCSVSize, formatBytes } from '../utils/csvExport';
import type { ColumnDefinition } from '../types';

describe('csvExport', () => {
  const mockColumns: ColumnDefinition[] = [
    { key: 'id', label: 'ID', type: 'number', width: 80, visible: true },
    { key: 'name', label: 'Name', type: 'string', width: 150, visible: true },
    { key: 'email', label: 'Email', type: 'string', width: 200, visible: true },
    {
      key: 'hidden',
      label: 'Hidden',
      type: 'string',
      width: 100,
      visible: false,
    },
  ];

  const mockRows = [
    { id: 1, name: 'John Doe', email: 'john@example.com', hidden: 'secret1' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', hidden: 'secret2' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', hidden: 'secret3' },
  ];

  describe('convertToCSV', () => {
    it('should convert data to CSV format with headers', () => {
      const result = convertToCSV(mockColumns, mockRows);
      const lines = result.split('\n');

      expect(lines[0]).toBe('ID,Name,Email');
      expect(lines[1]).toBe('1,John Doe,john@example.com');
      expect(lines[2]).toBe('2,Jane Smith,jane@example.com');
      expect(lines[3]).toBe('3,Bob Wilson,bob@example.com');
    });

    it('should exclude hidden columns by default', () => {
      const result = convertToCSV(mockColumns, mockRows);

      expect(result).not.toContain('Hidden');
      expect(result).not.toContain('secret1');
    });

    it('should include all columns when visibleColumnsOnly is false', () => {
      const result = convertToCSV(mockColumns, mockRows, {
        visibleColumnsOnly: false,
      });
      const lines = result.split('\n');

      expect(lines[0]).toBe('ID,Name,Email,Hidden');
      expect(lines[1]).toContain('secret1');
    });

    it('should skip headers when includeHeaders is false', () => {
      const result = convertToCSV(mockColumns, mockRows, {
        includeHeaders: false,
      });
      const lines = result.split('\n');

      expect(lines[0]).toBe('1,John Doe,john@example.com');
    });

    it('should escape values containing commas', () => {
      const rowsWithCommas = [
        { id: 1, name: 'Doe, John', email: 'john@example.com', hidden: '' },
      ];
      const result = convertToCSV(mockColumns, rowsWithCommas);

      expect(result).toContain('"Doe, John"');
    });

    it('should escape values containing quotes', () => {
      const rowsWithQuotes = [
        {
          id: 1,
          name: 'John "Johnny" Doe',
          email: 'john@example.com',
          hidden: '',
        },
      ];
      const result = convertToCSV(mockColumns, rowsWithQuotes);

      expect(result).toContain('"John ""Johnny"" Doe"');
    });

    it('should escape values containing newlines', () => {
      const rowsWithNewlines = [
        { id: 1, name: 'John\nDoe', email: 'john@example.com', hidden: '' },
      ];
      const result = convertToCSV(mockColumns, rowsWithNewlines);

      expect(result).toContain('"John\nDoe"');
    });

    it('should handle null and undefined values', () => {
      const rowsWithNulls = [{ id: 1, name: null, email: undefined, hidden: '' }];
      const result = convertToCSV(mockColumns, rowsWithNulls);
      const lines = result.split('\n');

      expect(lines[1]).toBe('1,,');
    });

    it('should use custom delimiter when specified', () => {
      const result = convertToCSV(mockColumns, mockRows, { delimiter: ';' });
      const lines = result.split('\n');

      expect(lines[0]).toBe('ID;Name;Email');
      expect(lines[1]).toBe('1;John Doe;john@example.com');
    });

    it('should handle empty rows array', () => {
      const result = convertToCSV(mockColumns, []);

      expect(result).toBe('ID,Name,Email');
    });
  });

  describe('estimateCSVSize', () => {
    it('should estimate file size based on row and column count', () => {
      const size = estimateCSVSize(mockColumns, mockRows);

      // 3 visible columns * 3 rows * ~20 chars average = ~180 bytes
      expect(size).toBeGreaterThan(0);
      expect(size).toBe(3 * 3 * 20); // 180
    });

    it('should only count visible columns', () => {
      const allVisible: ColumnDefinition[] = mockColumns.map((c) => ({
        ...c,
        visible: true,
      }));
      const sizeAllVisible = estimateCSVSize(allVisible, mockRows);
      const sizeDefault = estimateCSVSize(mockColumns, mockRows);

      expect(sizeAllVisible).toBeGreaterThan(sizeDefault);
    });

    it('should return 0 for empty rows', () => {
      const size = estimateCSVSize(mockColumns, []);
      expect(size).toBe(0);
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes under 1KB', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });
});
