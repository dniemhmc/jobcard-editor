import { useRef } from 'react';

interface Props {
  label: string;
  /** Current width of the pane this splitter resizes. */
  width: number;
  /** +1 when dragging right makes the pane wider (pane on the left), -1 otherwise. */
  direction: 1 | -1;
  min: number;
  max: number;
  onResize: (width: number) => void;
}

const KEY_STEP = 16;

/**
 * A vertical bar between two panes. Drag it to resize the pane, or focus it
 * and use the arrow keys.
 */
export function Splitter({ label, width, direction, min, max, onResize }: Props) {
  const drag = useRef<{ x: number; width: number } | null>(null);

  return (
    <div
      className="splitter"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        // Capture the pointer so the drag keeps working over the preview iframe.
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, width };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        onResize(drag.current.width + direction * (e.clientX - drag.current.x));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const sign = e.key === 'ArrowRight' ? 1 : -1;
        onResize(width + sign * direction * KEY_STEP);
      }}
    />
  );
}
