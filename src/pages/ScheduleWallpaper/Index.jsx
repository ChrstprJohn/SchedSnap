import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Image as ImageIcon, ImageUp } from 'lucide-react';
import Toast from '../../components/Toast.jsx';
import { Link } from 'react-router';
import { api } from '../../lib/api.js';
import { gsap, useGSAP } from '../../lib/animation.js';
import { mobileResolution, wallpaperTemplates } from '../../assets/templates.js';
import { sampleSchedule } from '../../assets/sampleSchedule.js';
import { getScheduleIssues, scheduleSchema } from '../../../shared/scheduleSchema.js';
import { findOverlaps } from '../../utils/canvasHelpers.js';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import Uploader from './Uploader.jsx';
import Editor from './Editor.jsx';
import CanvasPreview from './CanvasPreview.jsx';
import TemplateGallery, { TemplateModal } from './TemplateGallery.jsx';

export default function ScheduleWallpaper() {
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState(null);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [templateSettings, setTemplateSettings] = useState({});
  const [uploading, setUploading] = useState(true);
  const [image, setImage] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentOpen, setDocumentOpen] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const request = useRef(null);
  const surface = useRef(null);
  const template = useMemo(() => customizeWallpaperTemplate(wallpaperTemplates.find((item) => item.id === templateId), templateSettings[templateId]), [templateId, templateSettings]);
  const resolution = mobileResolution;
  const previewTemplate = wallpaperTemplates.find((item) => item.id === previewTemplateId);
  const issues = schedule ? getScheduleIssues(schedule) : [];
  const warnings = schedule ? [...schedule.warnings, ...findOverlaps(schedule)] : [];

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [step, uploading]);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-workflow]', { y: 8, duration: 0.25, ease: 'expo.out', clearProps: 'transform' });
    });
    return () => media.revert();
  }, { scope: surface, dependencies: [step], revertOnUpdate: true });

  async function analyze(replacementImage = image) {
    if (!replacementImage || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/analyze', { image: replacementImage.image, mimeType: replacementImage.mimeType }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const checked = scheduleSchema.safeParse(data.schedule);
      if (!checked.success) throw new Error('The schedule response was incomplete. Try another image.');
      setSchedule(checked.data);
      setSource('upload');
      setConfirmed(false);
      setUploading(false);
      setDocumentOpen(true);
      setSuccess(`Read ${checked.data.classes.length} ${checked.data.classes.length === 1 ? 'class' : 'classes'} successfully.`);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.response?.data?.error?.message || (failure.code === 'ECONNABORTED' ? 'The request took too long. Try again or enter your classes manually.' : failure.message || 'Could not read the image. Try again.'));
    } finally {
      if (request.current === controller) { setBusy(false); request.current = null; }
    }
  }

  function startManual() {
    if (!schedule) setSchedule({ classes: [{ subject: '', courseCode: null, meetings: [{ day: null, startTime: null, endTime: null, room: null, dateLabel: null }] }], warnings: [] });
    if (!schedule) setSource('manual');
    setConfirmed(false);
    setUploading(false);
  }

  const editSchedule = useCallback((next) => { setSchedule(next); setConfirmed(false); }, []);
  const dismissNotification = useCallback(() => { setError(''); setSuccess(''); }, []);

  return (
    <section ref={surface} className="page-wrap py-4 sm:py-6">
      <Link to="/" className="mb-4 flex w-fit items-center gap-2 text-sm text-muted"><ArrowLeft className="size-4" aria-hidden="true" />Toolbox</Link>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 sm:mb-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{step === 1 ? 'Choose template' : step === 2 ? uploading ? 'Upload image' : 'Review classes' : 'Preview & download'}</h1>
      <ol aria-label="Wallpaper creation steps" className="ml-auto flex gap-3 sm:gap-5">
        {['Choose template', 'Upload & review', 'Preview & download'].map((label, index) => <li key={label} className="flex shrink-0 items-stretch gap-3 sm:gap-5"><button type="button" aria-label={label} aria-current={step === index + 1 ? 'step' : undefined} disabled={busy || index === 1 && !template || index === 2 && (!schedule || !confirmed || issues.length > 0)} onClick={() => { dismissNotification(); setStep(index + 1); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="workflow-step shrink-0 text-left"><span className="sm:hidden">{['Template', 'Upload', 'Preview'][index]}</span><span className="hidden sm:inline">{label}</span></button>{index < 2 && <ChevronRight className="my-auto size-3.5 shrink-0 text-muted" aria-hidden="true" />}</li>)}
      </ol>
      </div>
      {step === 1 && <div data-workflow className="sm:pt-2">
        <TemplateGallery selectedId={templateId} settings={templateSettings} onPreview={setPreviewTemplateId} />
      </div>}
      {step === 2 && uploading && <div data-workflow>
        <Uploader image={image} onImage={(next) => { setImage(next); setError(''); }} onError={(message) => { setError(message); if (message) setSuccess(''); }} onAnalyze={() => analyze()} busy={busy} onCancel={() => { request.current?.abort(); setBusy(false); }} onManual={startManual} hasSchedule={!!schedule} onSample={() => { setSchedule(structuredClone(sampleSchedule)); setSource('sample'); setConfirmed(false); setUploading(false); }} />
      </div>}
      {step === 2 && !uploading && schedule && <div data-workflow>
        <div className="review-toolbar mb-3 rounded-lg bg-soft">
          {image && source === 'upload' ? <details open={documentOpen} onToggle={(event) => setDocumentOpen(event.currentTarget.open)} className="min-w-0 flex-1"><summary className="disclosure-summary text-sm font-medium"><span className="inline-flex items-center gap-2"><ImageIcon className="size-4 shrink-0 text-muted" aria-hidden="true" />Uploaded document</span><span className="inline-flex items-center gap-2 text-muted"><span className="hidden sm:inline">{documentOpen ? 'Hide image' : 'View image'}</span><ChevronDown className="disclosure-icon size-4 shrink-0" aria-hidden="true" /></span></summary><Uploader compact image={image} onImage={(next) => { setImage(next); setError(''); setConfirmed(false); analyze(next); }} busy={busy} onError={(message) => { setError(message); if (message) setSuccess(''); }} /></details> : <><span className="flex min-h-11 flex-1 items-center gap-2 text-sm font-medium"><ImageIcon className="size-4 shrink-0 text-muted" aria-hidden="true" />{source === 'sample' ? 'Sample schedule' : 'Manual entry'}</span><button type="button" className="button-secondary review-toolbar-action" onClick={() => setUploading(true)}><ImageUp className="size-4" aria-hidden="true" />Upload image</button></>}
        </div>
        {!!warnings.length && <details open className="notice-info mb-6"><summary className="disclosure-summary font-semibold">Review notes ({warnings.length})<ChevronDown className="disclosure-icon size-5 shrink-0" aria-hidden="true" /></summary><ul className="mt-3 list-disc space-y-2 pl-5">{warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details>}
        {!!issues.length && <div className="notice-error mb-6" role="status"><p className="font-semibold">Missing or invalid details</p><ul className="mt-3 list-disc space-y-2 pl-5">{issues.slice(0, 6).map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
        <fieldset disabled={busy} aria-busy={busy} className="min-w-0"><Editor schedule={schedule} onChange={editSchedule} /></fieldset>
        <div className="workflow-actions review-actions">
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" disabled={busy} checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="size-4 shrink-0 accent-accent" />Subjects and times are correct</label>
          <button type="button" className="button-primary ml-auto" disabled={busy || !confirmed || issues.length > 0} onClick={() => { dismissNotification(); setStep(3); }}>Preview wallpaper<ArrowRight className="size-4" aria-hidden="true" /></button>
        </div>
      </div>}
      {step === 3 && schedule && <div data-workflow className="pt-4"><CanvasPreview key={`${template.id}-${resolution.id}`} schedule={schedule} template={template} resolution={resolution} confirmed={confirmed} issues={issues} onChangeTemplate={() => { dismissNotification(); setStep(1); }} /></div>}
      {previewTemplate && <TemplateModal key={previewTemplate.id} template={previewTemplate} settings={templateSettings[previewTemplate.id]} schedule={schedule} resolution={resolution} onClose={() => setPreviewTemplateId(null)} onSelect={(id, settings) => { setTemplateSettings((previous) => ({ ...previous, [id]: settings })); setTemplateId(id); setPreviewTemplateId(null); dismissNotification(); setStep(schedule && confirmed && issues.length === 0 ? 3 : 2); }} />}
      <Toast message={error || success} kind={error ? 'error' : 'success'} onClose={dismissNotification} />
    </section>
  );
}
