import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ImageUp } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import Toast from '../../components/Toast.jsx';
import { api } from '../../lib/api.js';
import { mobileResolution, wallpaperTemplates } from '../../assets/templates.js';
import { sampleSchedule } from '../../assets/sampleSchedule.js';
import { scheduleSchema } from '../../../shared/scheduleSchema.js';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import TemplateGallery from './TemplateGallery.jsx';
import TemplateWorkspace from './TemplateWorkspace.jsx';

export default function ScheduleWallpaper() {
  const { '*': templateId } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [templateSettings, setTemplateSettings] = useState({});
  const [schedule, setSchedule] = useState({ classes: [], warnings: [] });
  const [image, setImage] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('Class Schedule');
  const [canCancelEntry, setCanCancelEntry] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const request = useRef(null);
  const heading = useRef(null);
  const imagePicker = useRef(null);
  const template = useMemo(() => {
    const preset = customizeWallpaperTemplate(wallpaperTemplates.find((item) => item.id === templateId), templateSettings[templateId]);
    return preset ? { ...preset, scheduleTitle } : undefined;
  }, [templateId, templateSettings, scheduleTitle]);
  const returnId = search.get('return');
  const previousTemplate = wallpaperTemplates.find((item) => item.id === returnId);
  const selectedId = template?.id || previousTemplate?.id;
  const step = template ? search.get('step') === 'preview' ? 'preview' : 'classes' : 'design';
  const basePath = '/services/schedule-wallpaper';
  const choosingImage = step === 'classes' && !!image && (importOpen || !schedule.classes.length);
  const hasUnsavedChanges = schedule.classes.length > 0 || !!image || scheduleTitle !== 'Class Schedule' || Object.values(templateSettings).some((settings) => Object.keys(settings).length > 0);
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function confirmRefresh(event) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', confirmRefresh);
    return () => window.removeEventListener('beforeunload', confirmRefresh);
  }, [hasUnsavedChanges]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  function openStep(next) {
    if (next === step) return;
    setImportOpen(false);
    if (busy) { request.current?.abort(); setBusy(false); }
    if (next === 'design') navigate(`${basePath}${selectedId ? `?return=${selectedId}&step=${step === 'preview' ? 'preview' : 'classes'}` : ''}`);
    else if (selectedId) navigate(`${basePath}/${selectedId}${next === 'preview' ? '?step=preview' : ''}`);
  }

  function selectTemplate(id) {
    if (busy) return;
    navigate(`${basePath}/${id}${previousTemplate && search.get('step') === 'preview' ? '?step=preview' : ''}`);
  }
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    document.title = template ? `${template.name} — Schedule wallpaper — UniToolbox` : 'Schedule wallpaper — UniToolbox';
  }, [template]);

  async function analyze() {
    if (!image || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/analyze', { image: image.image, mimeType: image.mimeType }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const checked = scheduleSchema.safeParse(data.schedule);
      if (!checked.success) throw new Error('The schedule response was incomplete. Try another image.');
      setSchedule(checked.data);
      setSuccess(`${checked.data.classes.length} ${checked.data.classes.length === 1 ? 'class' : 'classes'} found. Check the details.`);
      return true;
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.response?.data?.error?.message || (failure.code === 'ECONNABORTED' ? 'The request took too long. Try again or enter your classes manually.' : failure.message || 'Could not read the image. Try again.'));
    } finally {
      if (request.current === controller) { setBusy(false); request.current = null; }
    }
  }

  const dismissNotification = useCallback(() => { setError(''); setSuccess(''); }, []);
  const changeSchedule = useCallback((next) => { setSchedule(next); setSuccess(''); }, []);
  function cancelImport() {
    if (busy) { request.current?.abort(); setBusy(false); }
    setImage(null);
    setImportOpen(false);
    dismissNotification();
    requestAnimationFrame(() => heading.current?.closest('.wallpaper-flow')?.querySelector(schedule.classes.length ? '[data-import-trigger]' : '.schedule-dropzone')?.focus());
  }
  function goBack() {
    if (step === 'classes' && importOpen && schedule.classes.length) {
      cancelImport();
    } else openStep(step === 'classes' ? 'design' : 'classes');
  }

  if (templateId && !template) return <section className="page-wrap py-12">
    <h1 className="text-2xl font-semibold">Template not found</h1>
    <p className="mt-3 text-muted">Choose a template from the collection to start editing.</p>
    <Link to="/services/schedule-wallpaper" className="button-primary mt-6">Choose template</Link>
  </section>;

  return <section className="page-wrap wallpaper-flow">
    {step === 'design' ? <Link to="/" className="tool-back"><ArrowLeft className="size-4" aria-hidden="true" />Toolbox</Link> : <button type="button" className="tool-back" onClick={goBack}><ArrowLeft className="size-4" aria-hidden="true" />{step === 'classes' && importOpen && schedule.classes.length ? 'Back to classes' : 'Back'}</button>}
    <header className="wallpaper-flow-header" data-importing={choosingImage}>
      <h1 tabIndex={-1} ref={heading}>{step === 'design' ? 'Choose a design' : step === 'classes' ? 'Add your classes' : 'Your wallpaper'}</h1>
      {choosingImage && <button type="button" className="button-secondary import-change" disabled={busy || preparingImage} onClick={() => imagePicker.current?.openPicker()}><ImageUp size={16} aria-hidden="true" />{preparingImage ? 'Preparing…' : 'Change image'}</button>}
    </header>
    {template ? <TemplateWorkspace
      step={step} onStep={openStep}
      template={template} schedule={schedule} resolution={mobileResolution} onScheduleChange={changeSchedule}
      onAppearanceChange={(key, value) => setTemplateSettings((previous) => ({ ...previous, [templateId]: { ...previous[templateId], [key]: value } }))}
      onResetAppearance={() => setTemplateSettings((previous) => ({ ...previous, [templateId]: {} }))}
      image={image} busy={busy}
      importOpen={importOpen} onImportOpenChange={setImportOpen}
      onTitleChange={setScheduleTitle}
      canCancelEntry={canCancelEntry} onCancelEntryChange={setCanCancelEntry}
      onCancelImport={cancelImport}
      imagePickerRef={imagePicker} preparingImage={preparingImage} onPreparingImageChange={setPreparingImage}
      onImage={(next) => { setImage(next); dismissNotification(); }}
      onError={(message) => { setError(message); setSuccess(''); }} onAnalyze={analyze}
      onSample={() => { setSchedule(structuredClone(sampleSchedule)); dismissNotification(); }}
    /> : <>
      <TemplateGallery selectedId={selectedId} settings={templateSettings} schedule={schedule} scheduleTitle={scheduleTitle} resolution={mobileResolution} onSelect={selectTemplate} />
    </>}
    <Toast message={error || success} kind={error ? 'error' : 'success'} onClose={dismissNotification} />
  </section>;
}
