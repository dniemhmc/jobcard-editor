import { describe, expect, it } from 'vitest';
import {
  defaultLayout,
  LAYOUT_KEY,
  loadLayout,
  parseLayout,
  PREVIEW_WIDTH,
  previewScale,
  resizePreview,
  resizeTree,
  saveLayout,
  TREE_WIDTH,
} from './layout';

describe('layout', () => {
  it('resizes panes within their limits', () => {
    const layout = defaultLayout();
    expect(resizeTree(layout, 350.4).treeWidth).toBe(350);
    expect(resizeTree(layout, 10).treeWidth).toBe(TREE_WIDTH.min);
    expect(resizeTree(layout, 5000).treeWidth).toBe(TREE_WIDTH.max);
    expect(resizePreview(layout, 0).previewWidth).toBe(PREVIEW_WIDTH.min);
    expect(resizePreview(layout, 5000).previewWidth).toBe(PREVIEW_WIDTH.max);
  });

  it('scales the A4 page to fill the preview pane', () => {
    expect(previewScale(794 + 50)).toBe(1);
  });

  it('reads a stored layout and repairs bad values', () => {
    expect(parseLayout(JSON.stringify({ treeWidth: 400, previewWidth: 9999 }))).toEqual({
      treeWidth: 400,
      previewWidth: PREVIEW_WIDTH.max,
    });
    expect(parseLayout(JSON.stringify({ treeWidth: 'wide' }))).toEqual(defaultLayout());
    expect(parseLayout('{')).toEqual(defaultLayout());
    expect(parseLayout('null')).toEqual(defaultLayout());
    expect(parseLayout(null)).toEqual(defaultLayout());
  });

  it('saves and loads through browser storage', () => {
    const data = new Map<string, string>();
    const storage = () =>
      ({
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => void data.set(k, v),
      }) as Storage;
    const layout = resizeTree(defaultLayout(), 420);
    saveLayout(storage, layout);
    expect(data.has(LAYOUT_KEY)).toBe(true);
    expect(loadLayout(storage)).toEqual(layout);
  });

  it('falls back to the default when storage is blocked', () => {
    const blocked = (): Storage => {
      throw new Error('SecurityError');
    };
    expect(loadLayout(blocked)).toEqual(defaultLayout());
    expect(() => saveLayout(blocked, defaultLayout())).not.toThrow();
  });
});
