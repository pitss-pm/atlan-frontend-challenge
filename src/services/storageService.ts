const STORAGE_KEYS = {
  QUERY_TABS: 'sql_runner_query_tabs',
  QUERY_HISTORY: 'sql_runner_query_history',
  SAVED_QUERIES: 'sql_runner_saved_queries',
  SHARED_QUERIES: 'sql_runner_shared_queries',
  LAYOUT: 'sql_runner_layout',
  THEME: 'sql_runner_theme',
  COLUMN_VISIBILITY: 'sql_runner_column_visibility',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const storageService = {
  
  get<T>(key: StorageKey, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Failed to parse storage key "${key}":`, error);
      return defaultValue;
    }
  },

  
  set<T>(key: StorageKey, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save to storage key "${key}":`, error);
      return false;
    }
  },

  
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove storage key "${key}":`, error);
    }
  },

  
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.remove(key);
    });
  },
};

export { STORAGE_KEYS };
