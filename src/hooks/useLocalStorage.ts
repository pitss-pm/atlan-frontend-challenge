import { useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storageService.get(key as any, initialValue);
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          storageService.set(key as any, valueToStore);
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const unsubscribe = storageService.subscribe((k, v) => {
      if (k === key) {
        setStoredValue(v);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, [key]);

  return [storedValue, setValue];
}
