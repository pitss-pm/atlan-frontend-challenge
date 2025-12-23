# Atlan: SQL Runner
Demo: https://atlan-frontend-challenge-iota.vercel.app/

A browser-based SQL workspace built for data engineers.

#### Quick video walkthrough
<p align="center">
  <a href="https://youtu.be/pELs9fPESws">
    <img src="https://img.youtube.com/vi/pELs9fPESws/maxresdefault.jpg" width="900" />
  </a>
</p>

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

## Scripts

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm test` | Run tests |
| `npm run format` | Format with Prettier |
