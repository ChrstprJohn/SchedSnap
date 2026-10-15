import { Search, X } from 'lucide-react';
import { useSearchPlaceholder } from '../lib/useWallpaperSearch.js';

export default function WallpaperSearch({ value, onChange }) {
  const placeholder = useSearchPlaceholder(value);

  return <div className="wallpaper-search-wrap" role="search">
    <input
      type="search"
      className="wallpaper-search-input"
      placeholder={placeholder}
      aria-label="Search designs or categories"
      value={value}
      onChange={event => onChange(event.target.value)}
    />
    {value && <button type="button" className="wallpaper-search-clear" aria-label="Clear search" onClick={() => onChange('')}>
      <X size={14} aria-hidden="true" />
    </button>}
    <Search className="wallpaper-search-icon" size={16} aria-hidden="true" />
  </div>;
}
