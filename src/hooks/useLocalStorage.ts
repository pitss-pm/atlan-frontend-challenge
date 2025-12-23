import { useState, useCallback, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  transform?: (value: T) => T
): [T, (value: T | ((prev: T) => T)) => void] {
  const instanceId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const value = storageService.get(key as any, initialValue);
    return transform ? transform(value) : value;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const nextValue = value instanceof Function ? value(prev) : value;
          const valueToStore = transform ? transform(nextValue) : nextValue;
          storageService.set(key as any, valueToStore, instanceId);
          return nextValue;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, transform, instanceId]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as T;
          setStoredValue(transform ? transform(parsed) : parsed);
        } catch {
          console.warn(`Failed to parse localStorage key "${key}":`, e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = storageService.subscribe((k, v, senderId) => {
      if (k === key && senderId !== instanceId) {
        setStoredValue(transform ? transform(v) : v);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, [key, transform, instanceId]);

  return [storedValue, setValue];
}
