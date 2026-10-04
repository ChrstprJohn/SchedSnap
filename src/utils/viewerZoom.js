export function zoomViewerWithWheel(event, setZoom) {
  if (!event.ctrlKey || !event.deltaY) return;
  event.preventDefault();
  setZoom((current) => Math.min(400, Math.max(50, current + (event.deltaY < 0 ? 25 : -25))));
}
