import React, { memo, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import { Box, useTheme, CircularProgress } from '@mui/material';
import type { editor } from 'monaco-editor';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunQuery?: () => void;
  readOnly?: boolean;
  height?: string | number;
}

const SQLEditor: React.FC<SQLEditorProps> = memo(
  ({ value, onChange, onRunQuery, readOnly = false, height = '100%' }) => {
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

        editor.focus();
      },
      [onRunQuery]
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
