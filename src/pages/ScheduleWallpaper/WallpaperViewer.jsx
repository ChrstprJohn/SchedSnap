import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

export default function WallpaperViewer({ children, resolution, onClose }) {
  const dialog = useRef(null);
  const pane = useRef(null);
  const [fitWidth, setFitWidth] = useState(240);
  const [zoom, setZoom] = useState(100);
  const width = fitWidth * zoom / 100;
  const height = width * resolution.height / resolution.width;

  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setFitWidth(Math.max(1, Math.min(resolution.width, width - 32, (height - 32) * resolution.width / resolution.height)));
    });
    observer.observe(pane.current);
    return () => {
      observer.disconnect();
      node.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [resolution.width, resolution.height]);

  function changeZoom(amount) {
    setZoom((current) => Math.min(400, Math.max(50, current + amount)));
  }

  return <dialog ref={dialog} className="wallpaper-viewer" aria-labelledby="viewer-heading" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={(event) => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(25); }
    if (event.key === '-') { event.preventDefault(); changeZoom(-25); }
    if (event.key === '0') { event.preventDefault(); setZoom(100); }
  }}>
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <h2 id="viewer-heading" className="text-base font-semibold">Preview</h2>
        <div role="group" aria-label="Zoom controls" className="flex items-center gap-1">
          <button type="button" className="viewer-control" aria-label="Zoom out" disabled={zoom === 50} onClick={() => changeZoom(-25)}><Minus className="size-4" aria-hidden="true" /></button>
          <output aria-label="Zoom level" aria-live="polite" className="min-w-11 text-center text-xs tabular-nums">{zoom}%</output>
          <button type="button" className="viewer-control" aria-label="Zoom in" disabled={zoom === 400} onClick={() => changeZoom(25)}><Plus className="size-4" aria-hidden="true" /></button>
          <button type="button" className="viewer-control text-xs font-medium" aria-label="Fit wallpaper to viewer" onClick={() => setZoom(100)}>Fit</button>
        </div>
        <button type="button" className="icon-button size-11" aria-label="Close enlarged preview" onClick={onClose}><X className="size-5" aria-hidden="true" /></button>
      </div>
      <div ref={pane} tabIndex={0} role="region" aria-label="Zoomed wallpaper. Scroll to move around the image." className="min-h-0 flex-1 overflow-auto overscroll-contain bg-soft">
        <div className="grid min-h-full min-w-full place-items-center p-4" style={{ width: width + 32, height: height + 32 }}>
          <div style={{ width }} className="shrink-0">{children}</div>
        </div>
      </div>
    </div>
  </dialog>;
}
