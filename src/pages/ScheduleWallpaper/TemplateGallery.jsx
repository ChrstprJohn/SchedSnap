import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { deviceResolutions, tabletLandscapeResolution, mascotTemplateSchedule, templateSchedule, wallpaperTemplates } from '../../assets/templates.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import { designCollections as collections, scenicFamilies } from '../../config/collections.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';

const previewSchedule = (template) => template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule;

export default function TemplateGallery({ selectedId, settings = {}, schedule, scheduleTitle = 'Class Schedule', onSelect, initialCategory = 'all', device = 'mobile', onDeviceChange }) {
  const thumbnailWidth = device === 'laptop' ? 960 : device === 'tablet' ? 768 : 540;
  const designResolution = (item) => device === 'tablet' && item.orientation === 'landscape' ? tabletLandscapeResolution : deviceResolutions[device];
  const [category, setCategory] = useState(() => collections.some((item) => item.id === initialCategory) ? initialCategory : 'all');
  const [preview, setPreview] = useState(null);
  const [family, setFamily] = useState('all');
  const availableFamilies = scenicFamilies.filter((entry) => wallpaperTemplates.some((item) => item.family === entry.id));
  const visibleTemplates = wallpaperTemplates.filter((item) =>
    (category === 'all' || (item.collection || 'original') === category)
    && (category !== 'scenic' || family === 'all' || item.family === family));
  return <div>
    <div role="group" aria-label="Filter by device" className="device-filter-tabs">
      {['mobile', 'tablet', 'laptop'].map((item) => <button type="button" key={item} aria-pressed={device === item} aria-controls="template-gallery" onClick={() => onDeviceChange(item)} className="device-filter-tab">{item === 'mobile' ? 'Mobile' : item === 'tablet' ? 'Tablet' : 'Laptop'}</button>)}
    </div>
    <div role="group" aria-label="Filter designs" className="template-filters">
      {collections.map((collection) => <button type="button" key={collection.id} aria-pressed={category === collection.id} aria-controls="template-gallery" onClick={() => { if (category !== collection.id) { setCategory(collection.id); trackEvent('collection_filtered', { collection: collection.id }); } }} className="template-category">{collection.name}</button>)}
    </div>
    {category === 'scenic' && <div role="group" aria-label="Filter illustrated themes" className="template-filters mb-5">
      {[{ id: 'all', name: 'All themes' }, ...availableFamilies].map((entry) =>
        <button key={entry.id} type="button" aria-pressed={family === entry.id} aria-controls="template-gallery" onClick={() => setFamily(entry.id)} className="template-category">{entry.name}</button>)}
    </div>}
    <div id="template-gallery" role="group" aria-label={`${collections.find((collection) => collection.id === category).name} gallery`} className={`template-grid template-grid-${device}`}>
      {visibleTemplates.map((original) => { const item = { ...customizeWallpaperTemplate(original, settings[original.id]), scheduleTitle, device }; const fullResolution = designResolution(item); const thumbnailResolution = { ...fullResolution, width: thumbnailWidth, height: Math.round(thumbnailWidth * fullResolution.height / fullResolution.width) }; return <button type="button" key={item.id} aria-label={`Preview ${item.name}`} aria-haspopup="dialog" onClick={() => { setPreview(item); trackEvent('template_previewed', templateProperties(item)); }} className="template-option min-w-0 rounded-xl text-left">
        <div className={`template-art w-full overflow-hidden rounded-xl ${selectedId === item.id ? 'outline-2 -outline-offset-2 outline-ink' : ''}`}>
          <WallpaperCanvas lazy schedule={schedule?.classes.length ? schedule : previewSchedule(item)} template={item} resolution={thumbnailResolution} className="block h-auto w-full" label={`${item.name} with ${schedule?.classes.length ? 'your' : 'sample'} classes`} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.name}</span>{selectedId === item.id && <Check className="size-4" aria-label="Selected" />}</div>
      </button>; })}
    </div>
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
