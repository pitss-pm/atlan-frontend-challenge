import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { QueryTab, QueryResult } from '../types';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SQL = `-- Write your SQL query here
-- Try: SELECT * FROM employees (10,000 rows available)
SELECT * FROM employees
WHERE is_active = true;
`;

function createNewTab(name?: string): QueryTab {
  return {
    id: uuidv4(),
    name: name || 'New Query',
    sql: DEFAULT_SQL,
    isExecuting: false,
    result: null,
    error: null,
    executedAt: null,
  };
}

export function useQueryTabs() {
  const [tabs, setTabs] = useLocalStorage<QueryTab[]>(
    'sql_runner_tabs',
    [createNewTab('Query 1')],
    useCallback(
      (tabs: QueryTab[]) =>
        tabs.map((tab) => ({
          ...tab,
          result: null,
          error: null,
          isExecuting: false,
          executedAt: null,
        })),
      []
    )
  );
  const [activeTabId, setActiveTabId] = useLocalStorage<string>(
    'sql_runner_active_tab',
    tabs[0]?.id || ''
  );

  const ensuredTabs = useMemo(() => {
    if (tabs.length === 0) {
      const newTab = createNewTab('Query 1');
      return [newTab];
    }
    return tabs;
  }, [tabs]);

  const activeTab = useMemo(() => {
    return ensuredTabs.find((t) => t.id === activeTabId) || ensuredTabs[0];
  }, [ensuredTabs, activeTabId]);

  const addTab = useCallback(
    (name?: string) => {
      const newTab = createNewTab(name || `Query ${ensuredTabs.length + 1}`);
      setTabs([...ensuredTabs, newTab]);
      setActiveTabId(newTab.id);
      return newTab;
    },
    [ensuredTabs, setTabs, setActiveTabId]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      if (ensuredTabs.length <= 1) {
        const freshTab = createNewTab('Query 1');
        setTabs([freshTab]);
        setActiveTabId(freshTab.id);
        return;
      }

      const tabIndex = ensuredTabs.findIndex((t) => t.id === tabId);
      const newTabs = ensuredTabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);

      if (tabId === activeTabId) {
        const newIndex = Math.min(tabIndex, newTabs.length - 1);
        setActiveTabId(newTabs[newIndex].id);
      }
    },
    [ensuredTabs, activeTabId, setTabs, setActiveTabId]
  );

  const updateTabSQL = useCallback(
    (tabId: string, sql: string) => {
      setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, sql } : tab)));
    },
    [setTabs]
  );

  const updateTabName = useCallback(
    (tabId: string, name: string) => {
      setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, name } : tab)));
    },
    [setTabs]
  );

  const setTabExecuting = useCallback(
    (tabId: string, isExecuting: boolean) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === tabId ? { ...tab, isExecuting } : tab))
      );
    },
    [setTabs]
  );

  const setTabResult = useCallback(
    (tabId: string, result: QueryResult | null, error: string | null = null) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                result,
                error,
                isExecuting: false,
                executedAt: Date.now(),
              }
            : tab
        )
      );
    },
    [setTabs]
  );

  const loadSQL = useCallback(
    (sql: string) => {
      if (activeTab) {
        updateTabSQL(activeTab.id, sql);
      }
    },
    [activeTab, updateTabSQL]
  );

  const duplicateTab = useCallback(
    (tabId: string) => {
      const tabToDuplicate = ensuredTabs.find((t) => t.id === tabId);
      if (!tabToDuplicate) return null;

      const newTab: QueryTab = {
        ...tabToDuplicate,
        id: uuidv4(),
        name: `${tabToDuplicate.name} (copy)`,
        isExecuting: false,
      };
      setTabs([...ensuredTabs, newTab]);
      setActiveTabId(newTab.id);
      return newTab;
    },
    [ensuredTabs, setTabs, setActiveTabId]
  );

  return {
    tabs: ensuredTabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    updateTabSQL,
    updateTabName,
    setTabExecuting,
    setTabResult,
    loadSQL,
    duplicateTab,
  };
}
