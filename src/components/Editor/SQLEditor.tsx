import React, { memo, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import { Box, useTheme, CircularProgress } from '@mui/material';
import type { editor } from 'monaco-editor';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunQuery?: () => void;
  onSaveQuery?: () => void;
  onNewTab?: () => void;
  onCloseTab?: () => void;
  readOnly?: boolean;
  height?: string | number;
}

const SQLEditor: React.FC<SQLEditorProps> = memo(
  ({
    value,
    onChange,
    onRunQuery,
    onSaveQuery,
    onNewTab,
    onCloseTab,
    readOnly = false,
    height = '100%',
  }) => {
    const theme = useTheme();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = useCallback(
      (editor, monaco) => {
        editorRef.current = editor;

        editor.addAction({
          id: 'run-query',
          label: 'Run Query',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          run: () => {
            onRunQuery?.();
          },
        });

        editor.addAction({
          id: 'save-query',
          label: 'Save Query',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          run: () => {
            onSaveQuery?.();
          },
        });

        editor.addAction({
          id: 'new-tab',
          label: 'New Tab',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT],
          run: () => {
            onNewTab?.();
          },
        });

        editor.addAction({
          id: 'close-tab',
          label: 'Close Tab',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW],
          run: () => {
            onCloseTab?.();
          },
        });

        // Explicitly handle Ctrl+W and Ctrl+T to prevent browser default behavior
        // even when editor is focused.
        editor.onKeyDown((e) => {
          if ((e.ctrlKey || e.metaKey) && (e.keyCode === monaco.KeyCode.KeyW || e.keyCode === monaco.KeyCode.KeyT)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.keyCode === monaco.KeyCode.KeyW) {
              onCloseTab?.();
            } else {
              onNewTab?.();
            }
          }
        });

        editor.focus();
      },
      [onRunQuery, onSaveQuery, onNewTab, onCloseTab]
    );

    const handleChange: OnChange = useCallback(
      (newValue) => {
        onChange(newValue || '');
      },
      [onChange]
    );

    const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light';

    return (
      <Box
        sx={{
          height,
          width: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          '& .monaco-editor': {
            borderRadius: 1,
          },
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={monacoTheme}
          loading={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <CircularProgress size={24} />
            </Box>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly,
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            folding: true,
            foldingStrategy: 'indentation',
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: true,
            parameterHints: { enabled: true },
          }}
        />
      </Box>
    );
  }
);

SQLEditor.displayName = 'SQLEditor';

export default SQLEditor;
