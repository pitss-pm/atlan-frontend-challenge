import { useCallback, useRef } from 'react';
import { executeQuery, cancelQuery } from '../services/queryService';
import type { QueryTab } from '../types';

interface UseQueryExecutionProps {
  activeTab: QueryTab | null;
  setTabExecuting: (tabId: string, isExecuting: boolean) => void;
  setTabResult: (
    tabId: string,
    result: QueryTab['result'],
    error: string | null
  ) => void;
}

export function useQueryExecution({
  activeTab,
  setTabExecuting,
  setTabResult,
}: UseQueryExecutionProps) {
  const executingTabsRef = useRef<Set<string>>(new Set());

  const runQuery = useCallback(async () => {
    if (!activeTab) return;

    if (activeTab.isExecuting || executingTabsRef.current.has(activeTab.id)) {
      return;
    }

    const sql = activeTab.sql.trim();
    if (!sql) return;

    const tabId = activeTab.id;
    executingTabsRef.current.add(tabId);
    setTabExecuting(tabId, true);

    try {
      const result = await executeQuery(sql, tabId);
      setTabResult(tabId, result, null);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setTabResult(tabId, null, 'Query cancelled');
      } else {
        setTabResult(
          tabId,
          null,
          error instanceof Error ? error.message : 'Query execution failed'
        );
      }
    } finally {
      executingTabsRef.current.delete(tabId);
    }
  }, [activeTab, setTabExecuting, setTabResult]);

  const cancelCurrentQuery = useCallback(() => {
    if (!activeTab) return;
    cancelQuery(activeTab.id);
    executingTabsRef.current.delete(activeTab.id);
  }, [activeTab]);

  return {
    runQuery,
    cancelQuery: cancelCurrentQuery,
    isExecuting: activeTab?.isExecuting || false,
  };
}
