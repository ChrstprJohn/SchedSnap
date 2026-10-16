import { useEffect, useRef } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function GalleryFilters({ device, onDeviceChange, sort, onSortChange, onReset, children, extraActive = false }) {
  const active = device !== 'mobile' || sort !== 'likes' || extraActive;
  const details = useRef(null);
  useEffect(() => {
    const dismiss = event => { if (!details.current?.contains(event.target)) details.current.open = false; };
    const escape = event => { if (event.key === 'Escape' && details.current?.open) { details.current.open = false; details.current.querySelector('summary').focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, []);
  return <details className="gallery-filters-menu" ref={details} data-active={active}>
    <summary aria-label={`Filter and sort designs${active ? ', filters applied' : ''}`} title="Filter and sort designs"><SlidersHorizontal size={20} aria-hidden="true" /><span className="gallery-filter-label">Filters</span></summary>
    <div className="gallery-filters-panel">
      <label>Device<span className="gallery-filter-select"><select aria-label="Device" value={device} onChange={event => onDeviceChange(event.target.value)}><option value="mobile">Mobile</option><option value="tablet">Tablet</option><option value="laptop">Laptop</option></select><ChevronDown size={16} aria-hidden="true" /></span></label>
      <label>Sort by<span className="gallery-filter-select"><select aria-label="Sort by" value={sort} onChange={event => onSortChange(event.target.value)}><option value="likes">Most hearts</option><option value="downloads">Most downloads</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select><ChevronDown size={16} aria-hidden="true" /></span></label>
      {children}
      <button type="button" className="text-link" onClick={onReset}>Reset filters</button>
    </div>
  </details>;
}
