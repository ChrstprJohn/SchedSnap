import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Download, Heart, LayoutTemplate, X } from 'lucide-react';
import { deviceResolutions, galleryScheduleFor } from '../../assets/templates.js';
import useInfiniteGallery from '../../lib/useInfiniteGallery.js';
import { useCatalogStatus } from '../../lib/catalogContext.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../../utils/wallpaperTheme.js';
import { designGalleryCategories as galleryCategories, matchesDesignGalleryCategory as matchesGalleryCategory } from '../../utils/galleryCategories.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';
import useDesignDownloads from '../../lib/useDesignDownloads.js';
import CategoryFilters from '../../components/CategoryFilters.jsx';
import DevicePicker from '../../components/DevicePicker.jsx';
import SortPicker from '../../components/SortPicker.jsx';
import { isNewTemplate } from '../../utils/templateFreshness.js';
import useDesignLikes from '../../lib/useDesignLikes.js';
import { sortTemplatesByLikes } from '../../utils/sortTemplatesByLikes.js';
import { scheduleLayoutOptions } from '../../utils/canvasHelpers.js';
import { searchWallpaperTemplates } from '../../utils/wallpaperSearch.js';

const previewSchedule = galleryScheduleFor;

export default function TemplateGallery({ selectedId, settings = {}, schedule, scheduleTitle = 'Class Schedule', onSelect, category: selectedCategory = 'all', onCategoryChange, device = 'mobile', onDeviceChange, sort = 'likes', onSortChange, previewLayout = 'stacked', onLayoutChange, searchQuery = '', onClearSearch }) {
  const { templates: wallpaperTemplates, loading: catalogLoading, error } = useCatalogStatus();
  const thumbnailWidth = device === 'laptop' ? 480 : device === 'tablet' ? 384 : 270;
  const designResolution = () => deviceResolutions[device];
  const category = ['chikawa', 'little-friends'].includes(selectedCategory) ? 'chiikawa' : galleryCategories.some((item) => item.id === selectedCategory) ? selectedCategory : 'all';
  const [preview, setPreview] = useState(null);
  const { likes, rankingLikes, loading: likesLoading, pending, error: likeError, refresh: refreshLikes, toggle: toggleLike } = useDesignLikes();
  const { downloads, error: downloadError, refresh: refreshDownloads } = useDesignDownloads(device);
  const loading = catalogLoading || likesLoading;
  const isSearching = Boolean(searchQuery && searchQuery.trim());
  const activeCategory = isSearching ? 'all' : category;

  const visibleTemplates = useMemo(() => {
    const matching = isSearching
      ? searchWallpaperTemplates(wallpaperTemplates, searchQuery)
      : wallpaperTemplates.filter((item) => matchesGalleryCategory(item, category));
    return sortTemplatesByLikes(matching.filter(item => !item.mobileOnly || device === 'mobile'), rankingLikes, sort, downloads);
  }, [wallpaperTemplates, searchQuery, isSearching, category, rankingLikes, device, sort, downloads]);

  const filterKey = `${sort}:${isSearching ? `search:${searchQuery.trim()}` : category}:${device}`;
  const { count: galleryCount, hasMore, sentinel, loadMore } = useInfiniteGallery(visibleTemplates.length, filterKey);

  const activeCategoryName = galleryCategories.find((collection) => collection.id === activeCategory)?.name || 'Design';
  return <div>
    <div role="group" aria-label="Filter designs" className="template-filters gallery-filter-row">
      <DevicePicker value={device} onChange={onDeviceChange} label="Filter by device" />
      <SortPicker value={sort} onChange={onSortChange} />
      <DevicePicker value={previewLayout} onChange={onLayoutChange} label="Preview schedule layout" options={scheduleLayoutOptions(device).map(option => [option.value, option.label, LayoutTemplate])} />
      <CategoryFilters categories={galleryCategories} value={activeCategory} controls="template-gallery" onChange={id => {
        if (isSearching && onClearSearch) {
          onClearSearch();
        }
        if (category !== id) {
          onCategoryChange(id);
          trackEvent('collection_filtered', { collection: id });
        }
      }} />
    </div>
    {downloadError && <div className="gallery-like-error" role="alert"><span>{downloadError}</span><button type="button" className="text-link" onClick={refreshDownloads}>Retry</button></div>}
    {likeError && <div className="gallery-like-error" role="alert"><span>{likeError}</span><button type="button" className="text-link" onClick={() => refreshLikes(true)} disabled={!!pending}>Retry</button></div>}
    <div id="template-gallery" role="group" aria-label={`${activeCategoryName} gallery`} aria-busy={loading} className={`template-grid template-grid-${device}`}>
      {loading && Array.from({ length: 10 }, (_, i) => <div key={`skeleton-${i}`} className="gallery-card-skeleton wallpaper-skeleton" aria-hidden="true" />)}
      {!loading && isSearching && visibleTemplates.length === 0 && (
        <div className="gallery-empty-state" role="status">
          <p>No designs found matching &ldquo;{searchQuery.trim()}&rdquo;</p>
          {onClearSearch && (
            <button type="button" className="button-secondary" onClick={onClearSearch}>
              Clear search
            </button>
          )}
        </div>
      )}
      {!loading && visibleTemplates.slice(0, galleryCount).map((original) => { const base = schedule?.classes.length ? original : galleryPreviewTemplate(original); const item = { ...customizeWallpaperTemplate(base, { ...settings[original.id], scheduleLayout: previewLayout }, device), scheduleTitle, device }; const isNew = isNewTemplate(original); const fullResolution = designResolution(item); const thumbnailResolution = { ...fullResolution, width: thumbnailWidth, height: Math.round(thumbnailWidth * fullResolution.height / fullResolution.width) }; const vote = likes[item.id]; const openPreview = () => { setPreview(item); trackEvent('template_previewed', templateProperties(item)); }; return <div key={item.id} className="template-card min-w-0">
        <button type="button" aria-label={`Preview ${item.name}${isNew ? ', New design' : ''}`} aria-haspopup="dialog" onClick={openPreview} className="template-option block w-full rounded-xl text-left">
        <div className={`template-art w-full overflow-hidden rounded-xl ${selectedId === item.id ? 'outline-2 -outline-offset-2 outline-ink' : ''}`}>
          <WallpaperCanvas lazy schedule={schedule?.classes.length ? schedule : previewSchedule(item)} template={item} resolution={thumbnailResolution} className="block h-auto w-full" label={`${item.name} with ${schedule?.classes.length ? 'your' : 'sample'} classes`} />
          {isNew && <span className="template-new-badge">New</span>}
        </div>
        </button>
        <div className="template-card-caption">
          <button type="button" className="template-card-name" aria-haspopup="dialog" onClick={openPreview}>{item.name}</button>
          <div className="template-card-stats"><span className="template-downloads" aria-label={`${downloads[item.id] === undefined ? "Unavailable" : downloads[item.id].toLocaleString()} downloads`} title="Downloads"><Download size={16} aria-hidden="true" /><span aria-hidden="true">{downloads[item.id]?.toLocaleString() ?? "—"}</span></span>
          <button type="button" className="template-heart" aria-pressed={vote?.liked || false} aria-label={`${vote?.liked ? 'Unlike' : 'Like'} ${item.name}${vote ? `, ${vote.count} ${vote.count === 1 ? 'like' : 'likes'}` : ', likes unavailable'}`} disabled={!vote} onClick={() => toggleLike(item.id)}>
            <Heart size={18} fill={vote?.liked ? 'currentColor' : 'none'} aria-hidden="true" /><span aria-hidden="true">{vote ? vote.count.toLocaleString() : '—'}</span>
          </button></div>
        </div>
      </div>; })}
    </div>
    {loading && <p role="status" className="sr-only">Loading designs…</p>}
    {!loading && error && <p role="alert">{error}</p>}
    {!loading && visibleTemplates.length > 0 && hasMore && <div ref={sentinel} className="gallery-load-more"><button type="button" className="button-secondary" onClick={loadMore}>Load more designs</button></div>}
    {preview && <DesignPreview template={preview} schedule={schedule} resolution={designResolution(preview)} onClose={() => setPreview(null)} onSelect={() => onSelect(preview.id)} />}
  </div>;
}

function DesignPreview({ template, schedule, resolution, onClose, onSelect }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="design-preview-dialog" data-device={resolution.id} data-orientation={resolution.width > resolution.height ? 'landscape' : 'portrait'} style={{ '--design-preview-ratio': resolution.width / resolution.height }} aria-labelledby="design-preview-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="design-preview-title">{template.name}</h2><button type="button" className="template-modal-control" aria-label="Close design preview" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="design-preview-body"><WallpaperCanvas schedule={schedule?.classes.length ? schedule : previewSchedule(template)} template={template} resolution={resolution} className="block h-auto w-full" label={`${template.name} with ${schedule?.classes.length ? 'your' : 'sample'} classes`} /></div>
    <footer><button type="button" className="button-primary w-full" onClick={onSelect}>Use this design<ArrowRight size={16} aria-hidden="true" /></button></footer>
  </dialog>;
}
