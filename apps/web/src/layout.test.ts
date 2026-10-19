import { describe, expect, it } from 'vitest';
import {
  defaultLayout,
  parseLayout,
  PREVIEW_WIDTH,
  previewScale,
  resizePreview,
  resizeTree,
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
});
