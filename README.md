# Atlan: SQL Runner
Demo: https://atlan-frontend-challenge-iota.vercel.app/

A browser-based SQL workspace built for data engineers.

## Overview

### What It Does
- Write SQL with proper syntax highlighting
- "Run" queries and get back realistic-looking mock data
- Keep multiple queries open in workbench tabs
- Save your favorite queries, share them with teammates via URL (Simulative)
- Export results to CSV when you need to throw data into a spreadsheet
- Works great with 1,00,000+ rows without freezing your browser (Uses incremental loading + Virtualization)

## Features

### Core Features

| Feature                 | Description                                                                                   |
|-------------------------|-----------------------------------------------------------------------------------------------|
| **Monaco SQL Editor**   | The real deal - same editor as VS Code with autocomplete, syntax highlighting, code folding   |
| **Multiple Query Tabs** | Work on several queries at once without losing your place                                     |
| **Incremental loading** | Loads only a chunk of data at a time and does incremental load in batches upon scrolling down |
| **Query History**       | Everything you run gets logged, easy to re-run old queries                                    |
| **Save Queries**        | Bookmark the good ones with names and notes                                                   |
| **Share Queries**       | Generate a link, send it to someone, they see exactly what you see                            |
| **Column Visibility** | Hide columns you don't want to see in output                                                  |
| **Draggable Layout**  | Move panels around, resize them, layout saves automatically                                   |
| **Dark Mode**           | Dark mode for less strain on eyes                                                             |
| **CSV Export**          | One click download, works with large datasets                                                 |

### Performance Features

| Feature               | Description                                                    |
|-----------------------|----------------------------------------------------------------|
| **Virtualized Table** | Only renders visible rows using react-window                   |
| **Infinite Scroll**   | Results load in batches as you scroll, configurable batch size |
| **Column Resizing**   | Drag to resize columns, your preferences stick around          |


### Keyboard Shortcuts

| Shortcut                 | Action |
|--------------------------|--------|
| `Cmd/Ctrl + Enter`       | Run query |
| `Cmd/Ctrl + S`           | Save query |
| `Cmd/Ctrl + Alt/Opt + T` | New tab |
| `Cmd/Ctrl + Alt/Opt + W` | Close tab |
| `Cmd/Ctrl + /`           | Toggle comment |

---

## Tech Stack

### Core

- **React 19.2**
- **TypeScript 5.9**
- **Vite 7.2**

### UI

- **Material UI 7.3** for components
- **Emotion** for styling

### Libraries

| Library                | Why            |
|------------------------|----------------|
| `@monaco-editor/react` | Code editor    |
| `react-window`         | Virtualizatio  |
| `react-router-dom`     | For URLs       |
| `uuid`                 | Generating IDs |

### Dev Tools

- **Jest** + **React Testing Library** for tests
- **Prettier** for formatting
- **ESLint** for linting

---

## Architecture

### Folder Structure

```
src/
├── components/         # UI components, organized by feature
│   ├── Editor/        # Monaco wrapper
│   ├── QueryTabs/     # Tab UI and logic
│   ├── OutputViewer/  # The big virtualized table
│   ├── History/       # History sidebar
│   ├── Layout/        # Draggable panel system
│   └── ...
├── hooks/             # Custom hooks
├── services/          # Business logic, persistence
├── utils/             # Pure functions
├── types/             # TypeScript interfaces
├── pages/             # Route components
└── theme/             # MUI theming
```

### Key Design Decisions

**Virtualization**: Query results can have thousands of rows. Without virtualization, the browser would freeze trying to render them all. react-window only renders what's visible (~20-30 rows), so scrolling stays smooth no matter how much data you have.

**Custom Draggable Layout**: Started with react-grid-layout but needed more control. The custom implementation lets you drag panels by their headers only (not the content), keeps the output panel fixed at the bottom, and persists layout to localStorage.

**Decoupled Tabs/Output**: Each tab has its own state - SQL, results, loading status.

---

## Performance

### Numbers

Tested in Chrome with Lighthouse and DevTools:

| Metric | Value |
|--------|-------|
| First Contentful Paint | ~0.8s |
| Time to Interactive | ~1.4s |
| Bundle Size (gzipped) | ~280KB |

### What I Did

1. **Lazy Loading** - Monaco loads async, routes are code-split
2. **Memoization** - `React.memo()`, `useCallback()`, `useMemo()` where it matters
3. **Virtual Scrolling** - Only visible rows in the DOM
4. **Minimal Re-renders** - Only re-render when necessary to the components which need it

## Testing
It uses Jest + React Testing Library for unit tests.

### Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---


### Local Dev

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Build

```bash
npm run build
npm run preview  # Test the build locally
```

## Scripts

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm test` | Run tests |
| `npm run format` | Format with Prettier |
