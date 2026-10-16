import { useRef } from 'react';

interface Props {
  title: string;
  /** Printable HTML document from packages/pdf. */
  html: string;
  /** Scale of the A4 page, so it fills the pane. */
  scale: number;
}

/** Live preview of a PDF template, with printing to PDF through the browser. */
export function Preview({ title, html, scale }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);

  return (
    <aside className="preview" aria-label="PDF preview">
      <div className="preview-header">
        <h3>{title}</h3>
        <button
          type="button"
          className="btn"
          onClick={() => frame.current?.contentWindow?.print()}
          title="Opens the print dialog; choose Save as PDF"
        >
          Print / save as PDF
        </button>
      </div>
      <div className="preview-page" style={{ '--preview-scale': scale } as React.CSSProperties}>
        <iframe ref={frame} title={title} srcDoc={html} />
      </div>
    </aside>
  );
}
