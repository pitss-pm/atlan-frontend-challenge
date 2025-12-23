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
type StorageListener = (key: string, value: any, senderId?: string) => void;

const listeners = new Set<StorageListener>();

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

  
  set<T>(key: StorageKey, value: T, senderId?: string): boolean {
    try {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
      
      
      listeners.forEach((listener) => {
        if (senderId !== undefined) {
          listener(key, value, senderId);
        } else {
          listener(key, value);
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to save to storage key "${key}":`, error);
      return false;
    }
  },

  
  remove(key: StorageKey, senderId?: string): void {
    try {
      localStorage.removeItem(key);
      listeners.forEach((listener) => {
        if (senderId !== undefined) {
          listener(key, null, senderId);
        } else {
          listener(key, null);
        }
      });
    } catch (error) {
      console.warn(`Failed to remove storage key "${key}":`, error);
    }
  },

  
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.remove(key);
    });
  },

  subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export { STORAGE_KEYS };
