import { v4 as uuidv4 } from 'uuid';
import type { QueryResult, QueryHistoryItem, SavedQuery } from '../types';
import { generateMockDataAsync, detectQueryType, preloadSampleData } from '../utils/mockData';
import { storageService, STORAGE_KEYS } from './storageService';

preloadSampleData();

const executionControllers = new Map<string, AbortController>();

export async function executeQuery(sql: string, tabId: string): Promise<QueryResult> {
  const controller = new AbortController();
  executionControllers.set(tabId, controller);

  const startTime = performance.now();

  try {
    const delay = Math.random() * 1200 + 300;
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(resolve, delay);
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Query cancelled', 'AbortError'));
      });
    });

    if (controller.signal.aborted) {
      throw new DOMException('Query cancelled', 'AbortError');
    }

    const queryType = detectQueryType(sql);
    const { columns, rows } = await generateMockDataAsync(queryType, sql);

    const executionTime = performance.now() - startTime;

    const result: QueryResult = {
      columns,
      rows,
      totalRows: rows.length,
      executionTime,
    };

    addToHistory({
      id: uuidv4(),
      sql,
      executedAt: Date.now(),
      rowCount: rows.length,
      executionTime,
      tabId,
    });

    return result;
  } finally {
    executionControllers.delete(tabId);
  }
}

export function cancelQuery(tabId: string): boolean {
  const controller = executionControllers.get(tabId);
  if (controller) {
    controller.abort();
    executionControllers.delete(tabId);
    return true;
  }
  return false;
}

function addToHistory(item: QueryHistoryItem): void {
  const history = storageService.get<QueryHistoryItem[]>(
    STORAGE_KEYS.QUERY_HISTORY,
    []
  );

  const updatedHistory = [item, ...history].slice(0, 100);
  storageService.set(STORAGE_KEYS.QUERY_HISTORY, updatedHistory);
}

export function getQueryHistory(): QueryHistoryItem[] {
  return storageService.get<QueryHistoryItem[]>(STORAGE_KEYS.QUERY_HISTORY, []);
}

export function clearQueryHistory(): void {
  storageService.set(STORAGE_KEYS.QUERY_HISTORY, []);
}

export function saveQuery(name: string, sql: string, notes: string = ''): SavedQuery {
  const savedQueries = storageService.get<SavedQuery[]>(STORAGE_KEYS.SAVED_QUERIES, []);

  const newQuery: SavedQuery = {
    id: uuidv4(),
    name,
    sql,
    notes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  storageService.set(STORAGE_KEYS.SAVED_QUERIES, [newQuery, ...savedQueries]);
  return newQuery;
}

export function updateSavedQuery(
  id: string,
  updates: Partial<Omit<SavedQuery, 'id' | 'createdAt'>>
): SavedQuery | null {
  const savedQueries = storageService.get<SavedQuery[]>(STORAGE_KEYS.SAVED_QUERIES, []);

  const index = savedQueries.findIndex((q) => q.id === id);
  if (index === -1) return null;

  const updatedQuery = {
    ...savedQueries[index],
    ...updates,
    updatedAt: Date.now(),
  };

  savedQueries[index] = updatedQuery;
  storageService.set(STORAGE_KEYS.SAVED_QUERIES, savedQueries);
  return updatedQuery;
}

export function deleteSavedQuery(id: string): boolean {
  const savedQueries = storageService.get<SavedQuery[]>(STORAGE_KEYS.SAVED_QUERIES, []);

  const filtered = savedQueries.filter((q) => q.id !== id);
  if (filtered.length === savedQueries.length) return false;

  storageService.set(STORAGE_KEYS.SAVED_QUERIES, filtered);
  return true;
}

export function getSavedQueries(): SavedQuery[] {
  return storageService.get<SavedQuery[]>(STORAGE_KEYS.SAVED_QUERIES, []);
}
