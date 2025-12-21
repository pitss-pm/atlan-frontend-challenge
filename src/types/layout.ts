export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface PanelLayout {
  layouts: {
    lg: LayoutItem[];
    md: LayoutItem[];
    sm: LayoutItem[];
  };
}

export interface LayoutConfig {
  breakpoints: { lg: number; md: number; sm: number };
  cols: { lg: number; md: number; sm: number };
  rowHeight: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  breakpoints: { lg: 1200, md: 996, sm: 768 },
  cols: { lg: 12, md: 10, sm: 6 },
  rowHeight: 30,
};

export const DEFAULT_LAYOUTS: PanelLayout = {
  layouts: {
    lg: [
      { i: 'editor', x: 0, y: 0, w: 8, h: 12, minW: 4, minH: 6 },
      { i: 'history', x: 8, y: 0, w: 4, h: 12, minW: 2, minH: 4 },
      { i: 'output', x: 0, y: 12, w: 12, h: 10, minW: 6, minH: 4 },
    ],
    md: [
      { i: 'editor', x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 6 },
      { i: 'history', x: 6, y: 0, w: 4, h: 10, minW: 2, minH: 4 },
      { i: 'output', x: 0, y: 10, w: 10, h: 8, minW: 6, minH: 4 },
    ],
    sm: [
      { i: 'editor', x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
      { i: 'history', x: 0, y: 8, w: 6, h: 6, minW: 2, minH: 4 },
      { i: 'output', x: 0, y: 14, w: 6, h: 8, minW: 4, minH: 4 },
    ],
  },
};
