import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Download, LayoutTemplate, Maximize2, Minus, Pencil, Plus, SlidersHorizontal } from 'lucide-react';
import { getScheduleIssues } from '../../../shared/scheduleSchema.js';
import { canvasBlob, drawWallpaper, findOverlaps } from '../../utils/canvasHelpers.js';
import { prepareWallpaperAssets } from '../../utils/wallpaperAssets.js';
import { mascotTemplateSchedule, templateSchedule } from '../../assets/templates.js';
import { downloadBlob } from '../../utils/downloadBlob.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import WallpaperViewer from './WallpaperViewer.jsx';
import TemplateControls from './TemplateControls.jsx';
import Editor from './Editor.jsx';
import Uploader from './Uploader.jsx';
import Toast from '../../components/Toast.jsx';

export default function TemplateWorkspace({ step, onStep, template, schedule, resolution, onScheduleChange, onAppearanceChange, onResetAppearance, image, onImage, busy, onError, onAnalyze, onSample, importOpen, onImportOpenChange: setImportOpen, onTitleChange, canCancelEntry, onCancelEntryChange: setCanCancelEntry, onCancelImport, imagePickerRef: imagePicker, preparingImage, onPreparingImageChange: setPreparingImage }) {
  const [enlarged, setEnlarged] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [previewStuck, setPreviewStuck] = useState(false);
  const [previewSizeLevel, setPreviewSizeLevel] = useState(2);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [layout, setLayout] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success');
  const lastUrl = useRef(null);
  const classEditor = useRef(null);
  const previewAnchor = useRef(null);
  const active = useRef(true);
  const hasSchedule = !!schedule.classes.length;
  const shownSchedule = hasSchedule ? schedule : template.layout === 'mascot' ? mascotTemplateSchedule : templateSchedule;
  const exportKey = JSON.stringify([schedule, template, resolution]);
  const updateLayout = useCallback((next) => setLayout({ ...next, key: exportKey }), [exportKey]);
  const issues = getScheduleIssues(schedule);
  const warnings = [...new Set([...schedule.warnings, ...findOverlaps(schedule)])];
  const currentLayout = layout?.key === exportKey ? layout : null;
  const canDownload = !busy && !exporting && !issues.length && currentLayout?.ready && !currentLayout.overflow && !currentLayout.error;
  const exportStatus = busy ? 'Reading schedule…' : issues.length ? issues[0] : currentLayout?.error ? 'Preview could not load. Try another design.' : currentLayout?.overflow ? 'Classes don’t fit. Shorten names or choose another design.' : !currentLayout?.ready ? 'Preparing preview…' : '';
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); };
  }, []);
  const dismissNotification = useCallback(() => setMessage(''), []);
  useEffect(() => {
    if (step !== 'preview' || !customizing || !previewAnchor.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPreviewStuck(!entry.isIntersecting && entry.boundingClientRect.top < 56);
    }, { rootMargin: '-56px 0px 0px 0px', threshold: 0 });
    observer.observe(previewAnchor.current);
    return () => observer.disconnect();
  }, [step, customizing]);

  function enterManually() {
    setImportOpen(false);
    setCanCancelEntry(true);
    if (!hasSchedule) onScheduleChange({ classes: [{ subject: '', courseCode: null, meetings: [{ day: null, startTime: null, endTime: null, room: null, dateLabel: null }] }], warnings: [] });
  }

  function cancelEntry() {
    setCanCancelEntry(false);
    setImportOpen(false);
    onScheduleChange({ classes: [], warnings: [] });
    onImage(null);
    onError('');
    requestAnimationFrame(() => imagePicker.current?.focusUpload());
  }

  async function download() {
    if (!canDownload) return;
    setExporting(true);
    setMessage('');
    try {
      const backgroundImage = await prepareWallpaperAssets(template);
      if (!active.current) return;
      const output = document.createElement('canvas');
      const rendered = drawWallpaper(output, { schedule, template, resolution, backgroundImage });
      if (rendered.overflow) throw new Error('Classes don’t fit. Shorten names or choose another design.');
      const blob = await canvasBlob(output);
      if (!active.current) return;
      const filename = `unitoolbox-${template.id}-${resolution.width}x${resolution.height}.png`;
      const { inApp } = downloadBlob(blob, filename);
      // Keep a fresh object URL for the "Save again" link
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setExportResult({ url, filename, key: exportKey });
      setMessageKind('success');
      setMessage(
        inApp
          ? 'Image opened in a new tab — long-press it and tap Save to Photos / Download.'
          : 'Download started.'
      );
    } catch (failure) { setMessageKind('error'); setMessage(failure.message); }
    finally { setExporting(false); }
  }

  const sizeClass = previewSizeLevel === 1 ? 'preview-size-sm' : previewSizeLevel === 3 ? 'preview-size-lg' : 'preview-size-md';
  const preview = <div className={`flow-preview-art ${sizeClass}`}>
    <button type="button" aria-label="Enlarge wallpaper" aria-haspopup="dialog" onClick={() => setEnlarged(true)} className="flow-wallpaper">
      <WallpaperCanvas schedule={shownSchedule} template={template} resolution={resolution} onLayout={updateLayout} className="block h-auto w-full" label={`${template.name} ${hasSchedule ? 'with your classes' : 'with sample classes'}`} />
      <span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span>
    </button>
    <div className="preview-size-controls" aria-label="Preview size controls">
      <button type="button" aria-label="Decrease preview size" disabled={previewSizeLevel <= 1} onClick={() => setPreviewSizeLevel((s) => Math.max(1, s - 1))} className="preview-size-btn"><Minus size={13} aria-hidden="true" /></button>
      <span className="preview-size-label">{previewSizeLevel === 1 ? 'S' : previewSizeLevel === 2 ? 'M' : 'L'}</span>
      <button type="button" aria-label="Increase preview size" disabled={previewSizeLevel >= 3} onClick={() => setPreviewSizeLevel((s) => Math.min(3, s + 1))} className="preview-size-btn"><Plus size={13} aria-hidden="true" /></button>
    </div>
  </div>;

  return <>
    {step === 'classes' ? <div className="classes-layout">
      <section className="classes-content" aria-label="Add and review classes">
        <div hidden={hasSchedule && !importOpen}><Uploader pickerRef={imagePicker} image={image} onImage={(next) => { onImage(next); setImportOpen(true); }} onPreparing={setPreparingImage} onCancel={onCancelImport} onAnalyze={async () => { if (await onAnalyze()) { setCanCancelEntry(false); setImportOpen(false); setReviewVersion((value) => value + 1); } }} busy={busy} onError={onError} hasSchedule={hasSchedule} onManual={enterManually} onSample={() => { onSample(); setCanCancelEntry(true); setImportOpen(false); }} /></div>
        {hasSchedule && <div hidden={importOpen}>
          <fieldset disabled={busy} aria-busy={busy} className="flow-class-editor"><Editor validationRef={classEditor} key={reviewVersion} schedule={schedule} scheduleTitle={template.scheduleTitle} onTitleChange={onTitleChange} onChange={onScheduleChange} onImport={() => imagePicker.current?.openPicker()} preparingImage={preparingImage} /></fieldset>
          {!!warnings.length && <details className="review-notes"><summary className="disclosure-summary">Review notes ({warnings.length})<ChevronDown className="disclosure-icon size-4" aria-hidden="true" /></summary><ul>{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details>}
          <div className="classes-next"><div className="classes-next-actions">{canCancelEntry && <button type="button" disabled={busy || preparingImage} className="button-secondary" onClick={cancelEntry}>Cancel</button>}<button type="button" disabled={busy || preparingImage} className="button-primary" onClick={() => { if (issues.length) classEditor.current?.validate(); else onStep('preview'); }}>Preview<ArrowRight size={16} aria-hidden="true" /></button></div></div>
        </div>}
      </section>
      <aside className="classes-design-preview" aria-label="Selected design">
        {preview}
        <div className="selected-design"><div><p className="font-semibold">{template.name}</p>{!hasSchedule && <p className="text-xs text-muted">Sample classes</p>}</div><button type="button" className="text-link" disabled={busy} onClick={() => onStep('design')}>Change design</button></div>
      </aside>
    </div> : <div className="download-layout" data-customizing={customizing} data-preview-stuck={previewStuck}>
      <div ref={previewAnchor} className="preview-sticky-anchor" aria-hidden="true" />
      <section className="download-preview" aria-label="Wallpaper preview">{preview}</section>
      <section className="download-options" aria-label="Download and customize">
        <h2>{template.name}</h2>
        <p className="download-meta">{schedule.classes.length} {schedule.classes.length === 1 ? 'class' : 'classes'} · {resolution.width} × {resolution.height} PNG</p>
        <button type="button" onClick={download} disabled={!canDownload} aria-describedby={exportStatus ? 'wallpaper-export-status' : undefined} className="button-primary download-wallpaper"><Download size={18} aria-hidden="true" />{exporting ? 'Creating PNG…' : 'Download wallpaper'}</button>
        {exportStatus && <div className="export-status" role="status" id="wallpaper-export-status"><p>{exportStatus}</p>{(issues.length > 0 || currentLayout?.overflow) && <button type="button" className="text-link" onClick={() => onStep('classes')}>Fix class details</button>}{currentLayout?.error && <button type="button" className="text-link" onClick={() => onStep('design')}>Change design</button>}</div>}
        {exportResult?.key === exportKey && <a className="text-link save-again" href={exportResult.url} download={exportResult.filename}>Save PNG again</a>}
        <div className="wallpaper-edit-actions"><button type="button" className="button-secondary" onClick={() => onStep('classes')}><Pencil size={16} aria-hidden="true" />Edit classes</button><button type="button" className="button-secondary" onClick={() => onStep('design')}><LayoutTemplate size={16} aria-hidden="true" />Change design</button></div>
        <details className="flow-customize" open={customizing} onToggle={(event) => { setCustomizing(event.currentTarget.open); setPreviewStuck(false); }}><summary className="disclosure-summary"><span><SlidersHorizontal size={16} aria-hidden="true" />Customize appearance</span><ChevronDown className="disclosure-icon size-4" aria-hidden="true" /></summary><TemplateControls template={template} onChange={onAppearanceChange} onReset={onResetAppearance} /></details>
      </section>
    </div>}
    {enlarged && <WallpaperViewer resolution={resolution} onClose={() => setEnlarged(false)}><WallpaperCanvas schedule={shownSchedule} template={template} resolution={resolution} className="block h-auto w-full" label={`${template.name} enlarged wallpaper`} /></WallpaperViewer>}
    <Toast message={message} kind={messageKind} onClose={dismissNotification} />
  </>;
}
