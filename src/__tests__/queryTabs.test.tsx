/**
 * Query Tabs Hook Tests
 * Tests tab management functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useQueryTabs } from '../hooks/useQueryTabs';

describe('useQueryTabs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with at least one tab', () => {
    const { result } = renderHook(() => useQueryTabs());

    expect(result.current.tabs.length).toBeGreaterThanOrEqual(1);
    expect(result.current.activeTab).toBeDefined();
  });

  it('should add a new tab', () => {
    const { result } = renderHook(() => useQueryTabs());
    const initialTabCount = result.current.tabs.length;

    act(() => {
      result.current.addTab('New Query');
    });

    expect(result.current.tabs.length).toBe(initialTabCount + 1);
    expect(result.current.tabs[result.current.tabs.length - 1].name).toBe('New Query');
  });

  it('should switch active tab to newly added tab', () => {
    const { result } = renderHook(() => useQueryTabs());
    const initialActiveTabId = result.current.activeTabId;

    act(() => {
      result.current.addTab('Test Tab');
    });

    // Active tab should change to the new tab
    expect(result.current.activeTabId).not.toBe(initialActiveTabId);
    expect(result.current.activeTab?.name).toBe('Test Tab');
  });

  it('should close a tab', () => {
    const { result } = renderHook(() => useQueryTabs());

    // Add a second tab first
    act(() => {
      result.current.addTab('Tab to Close');
    });

    const tabCount = result.current.tabs.length;
    const tabToClose = result.current.tabs[tabCount - 1];

    act(() => {
      result.current.closeTab(tabToClose.id);
    });

    expect(result.current.tabs.length).toBe(tabCount - 1);
    expect(result.current.tabs.find((t) => t.id === tabToClose.id)).toBeUndefined();
  });

  it('should not close the last remaining tab but reset it', () => {
    const { result } = renderHook(() => useQueryTabs());

    // Close all but one tab
    act(() => {
      while (result.current.tabs.length > 1) {
        result.current.closeTab(result.current.tabs[0].id);
      }
    });

    const lastTab = result.current.tabs[0];

    act(() => {
      result.current.closeTab(lastTab.id);
    });

    // Should still have one tab (newly created)
    expect(result.current.tabs.length).toBe(1);
    expect(result.current.tabs[0].id).not.toBe(lastTab.id);
  });

  it('should update tab SQL', () => {
    const { result } = renderHook(() => useQueryTabs());
    const tabId = result.current.activeTab!.id;
    const newSQL = 'SELECT * FROM products';

    act(() => {
      result.current.updateTabSQL(tabId, newSQL);
    });

    expect(result.current.activeTab?.sql).toBe(newSQL);
  });

  it('should update tab name', () => {
    const { result } = renderHook(() => useQueryTabs());
    const tabId = result.current.activeTab!.id;

    act(() => {
      result.current.updateTabName(tabId, 'Renamed Tab');
    });

    expect(result.current.activeTab?.name).toBe('Renamed Tab');
  });

  it('should set tab executing state', () => {
    const { result } = renderHook(() => useQueryTabs());
    const tabId = result.current.activeTab!.id;

    act(() => {
      result.current.setTabExecuting(tabId, true);
    });

    expect(result.current.activeTab?.isExecuting).toBe(true);

    act(() => {
      result.current.setTabExecuting(tabId, false);
    });

    expect(result.current.activeTab?.isExecuting).toBe(false);
  });

  it('should set tab result', () => {
    const { result } = renderHook(() => useQueryTabs());
    const tabId = result.current.activeTab!.id;
    const mockResult = {
      columns: [
        {
          key: 'id',
          label: 'ID',
          type: 'number' as const,
          width: 80,
          visible: true,
        },
      ],
      rows: [{ id: 1 }],
      totalRows: 1,
      executionTime: 100,
    };

    act(() => {
      result.current.setTabResult(tabId, mockResult, null);
    });

    expect(result.current.activeTab?.result).toEqual(mockResult);
    expect(result.current.activeTab?.error).toBeNull();
    expect(result.current.activeTab?.isExecuting).toBe(false);
  });

  it('should set tab error', () => {
    const { result } = renderHook(() => useQueryTabs());
    const tabId = result.current.activeTab!.id;

    act(() => {
      result.current.setTabResult(tabId, null, 'Query failed');
    });

    expect(result.current.activeTab?.error).toBe('Query failed');
    expect(result.current.activeTab?.result).toBeNull();
  });

  it('should load SQL into active tab', () => {
    const { result } = renderHook(() => useQueryTabs());
    const sql = 'SELECT * FROM orders WHERE status = "active"';

    act(() => {
      result.current.loadSQL(sql);
    });

    expect(result.current.activeTab?.sql).toBe(sql);
  });

  it('should duplicate a tab', () => {
    const { result } = renderHook(() => useQueryTabs());
    const originalTabId = result.current.activeTab!.id;

    act(() => {
      result.current.updateTabSQL(originalTabId, 'SELECT 1');
    });

    act(() => {
      result.current.duplicateTab(originalTabId);
    });

    const duplicatedTab = result.current.activeTab;

    expect(duplicatedTab?.sql).toBe('SELECT 1');
    expect(duplicatedTab?.name).toContain('(copy)');
    expect(duplicatedTab?.id).not.toBe(originalTabId);
  });

  it('should persist tabs to localStorage', () => {
    const { result, unmount } = renderHook(() => useQueryTabs());

    act(() => {
      result.current.addTab('Persisted Tab');
    });

    // Get the tab count
    const tabCount = result.current.tabs.length;

    unmount();

    // Render again and check persistence
    const { result: result2 } = renderHook(() => useQueryTabs());

    expect(result2.current.tabs.length).toBe(tabCount);
    expect(result2.current.tabs.some((t) => t.name === 'Persisted Tab')).toBe(true);
  });

  it('should switch active tab when current active is closed', () => {
    const { result } = renderHook(() => useQueryTabs());

    // Add tabs
    act(() => {
      result.current.addTab('Tab 2');
      result.current.addTab('Tab 3');
    });

    // Active should be Tab 3
    const activeTabId = result.current.activeTabId;

    act(() => {
      result.current.closeTab(activeTabId);
    });

    // Should switch to an adjacent tab
    expect(result.current.activeTabId).not.toBe(activeTabId);
    expect(result.current.activeTab).toBeDefined();
  });
});
