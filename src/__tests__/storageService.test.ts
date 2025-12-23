/**
 * Storage Service Tests
 * Tests localStorage abstraction and persistence logic
 */

import { jest } from '@jest/globals';
import { storageService, STORAGE_KEYS } from '../services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get', () => {
    it('should return default value when key does not exist', () => {
      const result = storageService.get(STORAGE_KEYS.QUERY_TABS, []);
      expect(result).toEqual([]);
    });

    it('should return stored value when key exists', () => {
      const testData = [{ id: '1', name: 'Test' }];
      localStorage.setItem(STORAGE_KEYS.QUERY_TABS, JSON.stringify(testData));

      const result = storageService.get(STORAGE_KEYS.QUERY_TABS, []);
      expect(result).toEqual(testData);
    });

    it('should return default value when stored value is invalid JSON', () => {
      localStorage.setItem(STORAGE_KEYS.QUERY_TABS, 'invalid-json');

      const result = storageService.get(STORAGE_KEYS.QUERY_TABS, ['default']);
      expect(result).toEqual(['default']);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        tabs: [{ id: '1', sql: 'SELECT * FROM users', result: { rows: 100 } }],
        settings: { theme: 'dark' },
      };
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(complexData));

      const result = storageService.get(STORAGE_KEYS.QUERY_HISTORY, null);
      expect(result).toEqual(complexData);
    });
  });

  describe('set', () => {
    it('should store value in localStorage', () => {
      const testData = { id: '1', name: 'Query 1' };
      const result = storageService.set(STORAGE_KEYS.QUERY_TABS, testData);

      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.QUERY_TABS)).toBe(
        JSON.stringify(testData)
      );
    });

    it('should return true on successful save', () => {
      const result = storageService.set(STORAGE_KEYS.THEME, 'dark');
      expect(result).toBe(true);
    });

    it('should overwrite existing values', () => {
      storageService.set(STORAGE_KEYS.THEME, 'light');
      storageService.set(STORAGE_KEYS.THEME, 'dark');

      const result = storageService.get(STORAGE_KEYS.THEME, 'light');
      expect(result).toBe('dark');
    });
  });

  describe('remove', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.THEME, '"dark"');
      storageService.remove(STORAGE_KEYS.THEME);

      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => storageService.remove(STORAGE_KEYS.LAYOUT)).not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should remove all app-related keys', () => {
      // Set some values
      storageService.set(STORAGE_KEYS.THEME, 'dark');
      storageService.set(STORAGE_KEYS.QUERY_TABS, [{ id: '1' }]);
      storageService.set(STORAGE_KEYS.LAYOUT, { test: true });

      // Clear all
      storageService.clearAll();

      // Verify all are removed
      expect(storageService.get(STORAGE_KEYS.THEME, 'default')).toBe('default');
      expect(storageService.get(STORAGE_KEYS.QUERY_TABS, [])).toEqual([]);
      expect(storageService.get(STORAGE_KEYS.LAYOUT, null)).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should call listener when set is called', () => {
      const listener = jest.fn();
      const unsubscribe = storageService.subscribe(listener);

      const testData = { theme: 'dark' };
      storageService.set(STORAGE_KEYS.THEME, testData);

      expect(listener).toHaveBeenCalledWith(STORAGE_KEYS.THEME, testData);
      unsubscribe();
    });

    it('should call listener when remove is called', () => {
      const listener = jest.fn();
      const unsubscribe = storageService.subscribe(listener);

      storageService.remove(STORAGE_KEYS.THEME);

      expect(listener).toHaveBeenCalledWith(STORAGE_KEYS.THEME, null);
      unsubscribe();
    });

    it('should not call listener after unsubscribe', () => {
      const listener = jest.fn();
      const unsubscribe = storageService.subscribe(listener);

      unsubscribe();
      storageService.set(STORAGE_KEYS.THEME, 'dark');

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
