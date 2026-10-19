/**
 * Pane layout of the editor: widths of the project tree and the PDF preview
 * (the details form takes the rest). A per-browser preference, so it is kept
 * in browser storage, not in the workspace data.
 */
export interface Layout {
  treeWidth: number;
  previewWidth: number;
}

export const TREE_WIDTH = { min: 200, max: 600, default: 300 };
export const PREVIEW_WIDTH = { min: 320, max: 1000, default: 470 };

export const defaultLayout = (): Layout => ({
  treeWidth: TREE_WIDTH.default,
  previewWidth: PREVIEW_WIDTH.default,
});

export function clamp(value: number, limits: { min: number; max: number }): number {
  return Math.round(Math.min(Math.max(value, limits.min), limits.max));
}

export const resizeTree = (layout: Layout, width: number): Layout => ({
  ...layout,
  treeWidth: clamp(width, TREE_WIDTH),
});

export const resizePreview = (layout: Layout, width: number): Layout => ({
  ...layout,
  previewWidth: clamp(width, PREVIEW_WIDTH),
});

/** Width of the A4 page in the preview at 96 dpi. */
export const A4_WIDTH_PX = 794;
/** Horizontal room the preview pane needs around the page (padding, border, scrollbar gutter). */
const PREVIEW_CHROME_PX = 2 * 16 + 2 + 16;

/** Scale at which the A4 page fills the preview pane. */
export function previewScale(previewWidth: number): number {
  return (previewWidth - PREVIEW_CHROME_PX) / A4_WIDTH_PX;
}

/** Reads a stored layout; anything missing or invalid falls back to the default. */
export function parseLayout(raw: string | null): Layout {
  const fallback = defaultLayout();
  if (raw === null) return fallback;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (typeof data !== 'object' || data === null) return fallback;
  const d = data as Record<string, unknown>;
  return {
    treeWidth:
      typeof d.treeWidth === 'number' ? clamp(d.treeWidth, TREE_WIDTH) : fallback.treeWidth,
    previewWidth:
      typeof d.previewWidth === 'number'
        ? clamp(d.previewWidth, PREVIEW_WIDTH)
        : fallback.previewWidth,
  };
}

export const LAYOUT_KEY = 'jobcard-editor/layout';
