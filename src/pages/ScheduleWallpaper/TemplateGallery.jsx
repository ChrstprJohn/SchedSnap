import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { mascotTemplateSchedule, templateSchedule, wallpaperTemplates } from '../../assets/templates.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import { designCollections as collections } from '../../config/collections.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';
const thumbnailResolution = { id: 'thumbnail', width: 270, height: 600 };
const previewSchedule = (template) => template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule;

export default function TemplateGallery({ selectedId, settings = {}, schedule, scheduleTitle = 'Class Schedule', resolution, onSelect, initialCategory = 'all' }) {
  const [category, setCategory] = useState(() => collections.some((item) => item.id === initialCategory) ? initialCategory : 'all');
  const [preview, setPreview] = useState(null);
  const visibleTemplates = wallpaperTemplates.filter((item) => category === 'all' || (item.collection || 'original') === category);
  return <div>
    <div role="group" aria-label="Filter designs" className="template-filters">
      {collections.map((collection) => <button type="button" key={collection.id} aria-pressed={category === collection.id} aria-controls="template-gallery" onClick={() => { if (category !== collection.id) { setCategory(collection.id); trackEvent('collection_filtered', { collection: collection.id }); } }} className="template-category">{collection.name}</button>)}
    </div>
    <div id="template-gallery" role="group" aria-label={`${collections.find((collection) => collection.id === category).name} gallery`} className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
      {visibleTemplates.map((original) => { const item = { ...customizeWallpaperTemplate(original, settings[original.id]), scheduleTitle }; return <button type="button" key={item.id} aria-label={`Preview ${item.name}`} aria-haspopup="dialog" onClick={() => { setPreview(item); trackEvent('template_previewed', templateProperties(item)); }} className="template-option min-w-0 rounded-xl text-left">
        <div className={`template-art w-full overflow-hidden rounded-xl ${selectedId === item.id ? 'outline-2 -outline-offset-2 outline-ink' : ''}`}>
          <WallpaperCanvas lazy schedule={schedule?.classes.length ? schedule : previewSchedule(item)} template={item} resolution={thumbnailResolution} className="block h-auto w-full" label={`${item.name} with ${schedule?.classes.length ? 'your' : 'sample'} classes`} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.name}</span>{selectedId === item.id && <Check className="size-4" aria-label="Selected" />}</div>
      </button>; })}
    </div>
    {preview && <DesignPreview template={preview} schedule={schedule} resolution={resolution} onClose={() => setPreview(null)} onSelect={() => onSelect(preview.id)} />}
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
  return <dialog ref={dialog} className="design-preview-dialog" aria-labelledby="design-preview-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="design-preview-title">{template.name}</h2><button type="button" className="template-modal-control" aria-label="Close design preview" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="design-preview-body"><WallpaperCanvas schedule={schedule?.classes.length ? schedule : previewSchedule(template)} template={template} resolution={resolution} className="block h-auto w-full" label={`${template.name} with ${schedule?.classes.length ? 'your' : 'sample'} classes`} /></div>
    <footer><button type="button" className="button-primary w-full" onClick={onSelect}>Use this design<ArrowRight size={16} aria-hidden="true" /></button></footer>
  </dialog>;
}
