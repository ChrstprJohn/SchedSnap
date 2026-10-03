import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Maximize2, SlidersHorizontal, X } from 'lucide-react';
import { mascotTemplateSchedule, templateSchedule, wallpaperTemplates } from '../../assets/templates.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import WallpaperViewer from './WallpaperViewer.jsx';
import TemplateControls from './TemplateControls.jsx';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
const thumbnailResolution = { id: 'thumbnail', width: 270, height: 600 };
const previewSchedule = (template) => template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule;
const collections = [
  { id: 'mascot', name: 'Mascot editions', description: '20 animal companions, from bold to soft and everyday.' },
  { id: 'pattern', name: 'Patterns & prints', description: 'Checks, dots, stripes and lines. Choose your own colors.' },
  { id: 'original', name: 'Original collection', description: 'Editorial, notebook and graphic favorites.' },
];

export default function TemplateGallery({ selectedId, onPreview, settings = {} }) {
  return <div className="space-y-10">{collections.map((collection) => <section key={collection.id} aria-labelledby={`${collection.id}-templates-title`}>
    <h2 id={`${collection.id}-templates-title`} className="text-lg font-semibold">{collection.name}</h2>
    <p className="mt-1 mb-4 text-sm text-muted">{collection.description}</p>
    <div role="group" aria-label={collection.name} className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
    {wallpaperTemplates.filter((item) => (item.collection || 'original') === collection.id).map((original) => { const item = customizeWallpaperTemplate(original, settings[original.id]); return <button type="button" key={item.id} aria-label={`Preview ${item.name} template`} aria-haspopup="dialog" onClick={() => onPreview(item.id)} className="template-option min-w-0 rounded-xl text-left">
      <div className={`template-art w-full overflow-hidden rounded-xl ${selectedId === item.id ? 'outline-2 -outline-offset-2 outline-ink' : ''}`}>
        <WallpaperCanvas lazy schedule={previewSchedule(item)} template={item} resolution={thumbnailResolution} className="block h-auto w-full" label={`${item.name} template with neutral example classes`} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.name}</span>{selectedId === item.id && <Check className="size-4" aria-label="Selected" />}</div>
      <p className="mt-1 text-xs text-muted">{item.description}</p>
    </button>; })}
    </div>
  </section>)}</div>;
}

export function TemplateModal({ template, settings = {}, schedule, resolution, onClose, onSelect }) {
  const dialog = useRef(null);
  const [enlarged, setEnlarged] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [draft, setDraft] = useState(settings);
  const styledTemplate = customizeWallpaperTemplate(template, draft);
  const shownSchedule = schedule?.classes.length ? schedule : previewSchedule(template);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    node.querySelector('h2').focus({ preventScroll: true });
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="template-modal" aria-labelledby="template-modal-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="template-modal-frame flex flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
        <h2 id="template-modal-title" tabIndex={-1} className="text-lg font-semibold focus:outline-none">{template.name}</h2>
        <div className="flex items-center gap-1">
          <button type="button" className="template-modal-control" aria-label="Enlarge preview" aria-haspopup="dialog" onClick={() => setEnlarged(true)}><Maximize2 className="size-4" aria-hidden="true" /></button>
          <button type="button" className="template-modal-control" aria-label="Close template preview" onClick={onClose}><X className="size-5" aria-hidden="true" /></button>
        </div>
      </div>
      <div className="template-customize min-h-0 overflow-y-auto">
        <div className={`template-settings-wrapper ${appearanceOpen ? 'is-open' : ''}`}>
          <button type="button" className="mobile-appearance-toggle" aria-expanded={appearanceOpen} aria-controls="template-appearance-controls" onClick={() => setAppearanceOpen((open) => !open)}><SlidersHorizontal className="size-4" aria-hidden="true" />Customize appearance<ChevronDown className={`ml-auto size-4 transition-transform ${appearanceOpen ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
          <div id="template-appearance-controls"><TemplateControls template={styledTemplate} onChange={(key, value) => setDraft((previous) => ({ ...previous, [key]: value }))} onReset={() => setDraft({})} /></div>
        </div>
        <div className="template-live-preview bg-soft">
          <button type="button" aria-label="Enlarge template preview" aria-haspopup="dialog" onClick={() => setEnlarged(true)} className="template-large-preview cursor-zoom-in rounded-lg"><WallpaperCanvas schedule={shownSchedule} template={styledTemplate} resolution={resolution} className="block h-auto w-full rounded-lg" label={`${template.name} wallpaper preview`} /></button>
        </div>
      </div>
      <div className="shrink-0 border-t border-line px-5 py-4"><button type="button" className="button-primary min-h-11 w-full py-3 text-sm" onClick={() => onSelect(template.id, draft)}>Use template<ArrowRight className="size-4" aria-hidden="true" /></button></div>
    </div>
    {enlarged && <WallpaperViewer resolution={resolution} onClose={() => setEnlarged(false)}><WallpaperCanvas schedule={shownSchedule} template={styledTemplate} resolution={resolution} className="block h-auto w-full" label={`${template.name} zoomable wallpaper preview`} /></WallpaperViewer>}
  </dialog>;
}
