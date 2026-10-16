import { useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function GalleryFilters({ device, onDeviceChange, sort, onSortChange, onReset }) {
  const details = useRef(null);
  useEffect(() => {
    const dismiss = event => { if (!details.current?.contains(event.target)) details.current.open = false; };
    const escape = event => { if (event.key === 'Escape' && details.current?.open) { details.current.open = false; details.current.querySelector('summary').focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, []);
  return <details className="gallery-filters-menu" ref={details}>
    <summary aria-label="Filter and sort designs" title="Filter and sort designs"><SlidersHorizontal size={20} aria-hidden="true" /><span className="gallery-filter-label">Filters</span>{(device !== 'mobile' || sort !== 'likes') && <span className="gallery-filter-dot" aria-label="Filters applied" />}</summary>
    <div className="gallery-filters-panel">
      <label>Device<select value={device} onChange={event => onDeviceChange(event.target.value)}><option value="mobile">Mobile</option><option value="tablet">Tablet</option><option value="laptop">Laptop</option></select></label>
      <label>Sort by<select value={sort} onChange={event => onSortChange(event.target.value)}><option value="likes">Most hearts</option><option value="downloads">Most downloads</option><option value="newest">Release date · newest</option><option value="oldest">Release date · oldest</option></select></label>
      <button type="button" className="text-link" onClick={onReset}>Reset filters</button>
    </div>
  </details>;
}
