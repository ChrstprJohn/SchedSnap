import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ImageUp } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import Toast from '../../components/Toast.jsx';
import BackToTop from '../../components/BackToTop.jsx';
import RestoreClassesDialog from '../../components/RestoreClassesDialog.jsx';
import { readDraft, saveDraft } from '../../lib/scheduleDraft.js';
import { api } from '../../lib/api.js';
import { loadImportUsage, rememberImportUsage } from '../../lib/importUsage.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';
import { deviceResolutions } from '../../assets/templates.js';
import { useTemplates, useCatalogStatus } from '../../lib/catalogContext.js';
import { sampleSchedule } from '../../assets/sampleSchedule.js';
import { scheduleSchema } from '../../../shared/scheduleSchema.js';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import TemplateGallery from './TemplateGallery.jsx';
import TemplateWorkspace from './TemplateWorkspace.jsx';
import GalleryFilters from '../../components/GalleryFilters.jsx';
import WallpaperSearch from '../../components/WallpaperSearch.jsx';
import WallpaperLoading from '../../components/WallpaperLoading.jsx';
import { useDebouncedSearch } from '../../lib/useWallpaperSearch.js';

export default function ScheduleWallpaper() {
  const wallpaperTemplates = useTemplates();
  const catalogStatus = useCatalogStatus();
  const { '*': templateId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const device = ['mobile', 'tablet', 'laptop'].includes(search.get('device')) ? search.get('device') : 'mobile';
  function changeDevice(next) {
    setSearch((previous) => { const params = new URLSearchParams(previous); params.set('device', next); return params; });
  }
  function devicePath(path) {
    const [pathname, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    params.set('device', device);
    if (search.get('sort')) params.set('sort', search.get('sort'));
    if (search.get('collection')) params.set('collection', search.get('collection'));
    return `${pathname}?${params}`;
  }
  const [templateSettings, setTemplateSettings] = useState({});
  const resolution = deviceResolutions[device];
  const [schedule, setSchedule] = useState({ classes: [], warnings: [] });
  const [scheduleSource, setScheduleSource] = useState('unknown');
  const [image, setImage] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('Class Schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const sort = ['likes', 'downloads', 'newest', 'oldest'].includes(search.get('sort')) ? search.get('sort') : 'likes';
  function changeSort(next) {
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('sort', next); return params; });
  }
  function changeCategory(next) {
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('collection', next); return params; });
  }
  const debouncedSearchQuery = useDebouncedSearch(searchQuery);
  const [pendingDraft, setPendingDraft] = useState(() => {
    try { return readDraft(window.sessionStorage); } catch { return null; }
  });
  useEffect(() => {
    if (pendingDraft) return;
    try { saveDraft(window.sessionStorage, schedule, scheduleTitle); }
    catch { /* The unload guard remains active when storage is unavailable. */ }
  }, [schedule, scheduleTitle, pendingDraft]);
  const [canCancelEntry, setCanCancelEntry] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importUsage, setImportUsage] = useState(null);
  const [usageUnavailable, setUsageUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const request = useRef(null);
  const heading = useRef(null);
  const imagePicker = useRef(null);
  const lastTrackedStep = useRef(null);
  const template = useMemo(() => {
    const preset = customizeWallpaperTemplate(wallpaperTemplates.find((item) => item.id === templateId && (!item.mobileOnly || device === 'mobile')), templateSettings[templateId], device);
    return preset ? { ...preset, scheduleTitle, device } : undefined;
  }, [templateId, templateSettings, scheduleTitle, device, wallpaperTemplates]);
  const returnId = search.get('return');
  const previousTemplate = wallpaperTemplates.find((item) => item.id === returnId && (!item.mobileOnly || device === 'mobile'));
  const selectedId = template?.id || previousTemplate?.id;
  const step = template ? search.get('step') === 'preview' ? 'preview' : 'classes' : 'design';
  const basePath = '/services/schedule-wallpaper';
  const choosingImage = step === 'classes' && !!image && (importOpen || !schedule.classes.length);
  const showingImport = step === 'classes' && (importOpen || !schedule.classes.length);
  useEffect(() => {
    if (!showingImport) return;
    let active = true;
    let checking = false;
    let resetTimer;
    async function refreshUsage() {
      if (checking || document.hidden) return;
      checking = true;
      try {
        const usage = await loadImportUsage();
        if (active) {
          setImportUsage(usage); setUsageUnavailable(false);
          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(refreshUsage, Math.max(1000, usage.resetsAt - Date.now()));
        }
      } catch { if (active) setUsageUnavailable(true); }
      finally { checking = false; }
    }
    refreshUsage();
    window.addEventListener('focus', refreshUsage);
    return () => { active = false; window.clearTimeout(resetTimer); window.removeEventListener('focus', refreshUsage); };
  }, [showingImport]);
  const hasUnsavedChanges = schedule.classes.length > 0 || !!image || scheduleTitle !== 'Class Schedule' || Object.values(templateSettings).some((settings) => Object.keys(settings).length > 0);
  useEffect(() => {
    if (templateId && !template) return;
    const key = `${step}:${templateId || ''}`;
    if (lastTrackedStep.current === key) return;
    lastTrackedStep.current = key;
    const properties = { step, ...(template ? templateProperties(template) : {}), schedule_source: scheduleSource, class_count: schedule.classes.length };
    trackEvent('wallpaper_step_viewed', properties);
    if (step === 'preview') trackEvent('schedule_previewed', properties);
  }, [step, templateId, template, scheduleSource, schedule.classes.length]);
  useEffect(() => {
    const unsavedAppearance = Object.values(templateSettings).some(settings => Object.keys(settings).length > 0);
    if (!hasUnsavedChanges) return;
    function confirmRefresh(event) {
      try {
        if (!pendingDraft && saveDraft(window.sessionStorage, schedule, scheduleTitle) && (schedule.classes.length > 0 || (!image && !unsavedAppearance && scheduleTitle === 'Class Schedule'))) return;
      } catch { /* Warn before losing edits when storage is unavailable. */ }
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', confirmRefresh);
    return () => window.removeEventListener('beforeunload', confirmRefresh);
  }, [hasUnsavedChanges, pendingDraft, image, templateSettings, schedule, scheduleTitle]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  function openStep(next) {
    if (next === step) return;
    setImportOpen(false);
    if (busy) { request.current?.abort(); setBusy(false); }
    if (next === 'design') navigate(devicePath(`${basePath}${selectedId ? `?return=${selectedId}&step=${step === 'preview' ? 'preview' : 'classes'}` : ''}`));
    else if (selectedId) navigate(devicePath(`${basePath}/${selectedId}${next === 'preview' ? '?step=preview' : ''}`));
  }

  function selectTemplate(id) {
    if (busy) return;
    const selected = wallpaperTemplates.find((item) => item.id === id);
    if (selected) trackEvent('template_selected', templateProperties(selected));
    navigate(devicePath(`${basePath}/${id}${previousTemplate && search.get('step') === 'preview' ? '?step=preview' : ''}`));
  }
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (template) document.title = `${template.name} — SchedSnap`;
  }, [template]);

  async function analyze() {
    if (!image || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    setSuccess('');
    const started = performance.now();
    const properties = templateProperties(template);
    trackEvent('schedule_import_started', properties);
    try {
      const { data } = await api.post('/analyze', { image: image.image, mimeType: image.mimeType }, { signal: controller.signal });
      if (data.usage) { rememberImportUsage(data.usage); setImportUsage(data.usage); setUsageUnavailable(false); }
      if (controller.signal.aborted) { trackEvent('schedule_import_cancelled', properties); return; }
      const checked = scheduleSchema.safeParse(data.schedule);
      if (!checked.success) throw new Error('The schedule response was incomplete. Try another image.');
      setSchedule(checked.data);
      setScheduleSource('image');
      trackEvent('schedule_import_succeeded', { ...properties, class_count: checked.data.classes.length, warning_count: checked.data.warnings.length, duration_ms: Math.round(performance.now() - started) });
      setSuccess(`${checked.data.classes.length} ${checked.data.classes.length === 1 ? 'class' : 'classes'} found. Check the details.`);
      return true;
    } catch (failure) {
      if (failure.response?.data?.usage) { rememberImportUsage(failure.response.data.usage); setImportUsage(failure.response.data.usage); setUsageUnavailable(false); }
      else rememberImportUsage(null);
      if (controller.signal.aborted) trackEvent('schedule_import_cancelled', properties);
      else trackEvent('schedule_import_failed', { ...properties, http_status: failure.response?.status || 0, error_type: failure.code === 'ECONNABORTED' ? 'timeout' : failure.response ? 'server_error' : 'invalid_response_or_network', duration_ms: Math.round(performance.now() - started) });
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

  if (catalogStatus.loading) return <WallpaperLoading />;
  if (catalogStatus.error && !wallpaperTemplates.length) return <section className="page-wrap py-12"><p role="alert">{catalogStatus.error}</p><button className="button-primary mt-6" onClick={() => window.location.reload()}>Try again</button></section>;
  if (templateId && !template) return <section className="page-wrap py-12">
    <h1 className="text-2xl font-semibold">Template not found</h1>
    <p className="mt-3 text-muted">Choose a template from the collection to start editing.</p>
    <Link to="/services/schedule-wallpaper" className="button-primary mt-6">Choose template</Link>
  </section>;

  return <section className="page-wrap wallpaper-flow" data-device={device} data-orientation={resolution.width > resolution.height ? 'landscape' : 'portrait'} style={{ '--wallpaper-ratio': `${resolution.width} / ${resolution.height}`, '--wallpaper-ratio-value': resolution.width / resolution.height }}>
    {step === 'classes' && pendingDraft && <RestoreClassesDialog count={pendingDraft.schedule.classes.length} onRestore={() => {
      setSchedule(pendingDraft.schedule);
      setScheduleTitle(pendingDraft.title);
      setScheduleSource('draft');
      setPendingDraft(null);
      if (template) navigate(devicePath(`${basePath}/${template.id}`), { replace: true });
      requestAnimationFrame(() => heading.current?.focus());
    }} onDiscard={() => { setPendingDraft(null); requestAnimationFrame(() => heading.current?.focus()); }} />}
    {step === 'design' ? <Link to="/" className="tool-back"><ArrowLeft className="size-4" aria-hidden="true" />Back</Link> : <button type="button" className="tool-back" onClick={goBack}><ArrowLeft className="size-4" aria-hidden="true" />{step === 'classes' && importOpen && schedule.classes.length ? 'Back to classes' : 'Back'}</button>}
    <header className="wallpaper-flow-header" data-importing={choosingImage}>
      <h1 tabIndex={-1} ref={heading}>{step === 'design' ? 'Choose a design' : step === 'classes' ? 'Add your classes' : 'Your wallpaper'}</h1>
      <div className="wallpaper-flow-header-actions">
        {step === 'design' && <><WallpaperSearch value={searchQuery} onChange={setSearchQuery} /><GalleryFilters device={device} onDeviceChange={changeDevice} sort={sort} onSortChange={changeSort} onReset={() => setSearch(previous => { const params = new URLSearchParams(previous); params.set('device', 'mobile'); params.set('sort', 'likes'); return params; })} /></>}
        {choosingImage && <button type="button" className="button-secondary import-change" aria-label={preparingImage ? 'Preparing image' : 'Change image'} disabled={busy || preparingImage} onClick={() => imagePicker.current?.openPicker()}><ImageUp size={16} aria-hidden="true" />{preparingImage ? 'Preparing…' : <><span className="import-change-desktop">Change image</span><span className="import-change-mobile">Change</span></>}</button>}
      </div>
    </header>
    {template ? <TemplateWorkspace defaultTemplate={customizeWallpaperTemplate(wallpaperTemplates.find(item => item.id === templateId), {}, device)}
      step={step} onStep={openStep}
      template={template} schedule={schedule} resolution={resolution} onScheduleChange={changeSchedule}
      scheduleSource={scheduleSource} onScheduleSourceChange={setScheduleSource}
      onAppearanceChange={(key, value) => { setTemplateSettings((previous) => ({ ...previous, [templateId]: { ...previous[templateId], [key]: value } })); trackEvent('wallpaper_appearance_changed', { ...templateProperties(template), setting: key }); }}
      onResetAppearance={() => { setTemplateSettings((previous) => ({ ...previous, [templateId]: {} })); trackEvent('wallpaper_appearance_reset', templateProperties(template)); }}
      image={image} busy={busy}
      importOpen={importOpen} onImportOpenChange={setImportOpen}
      onTitleChange={setScheduleTitle}
      canCancelEntry={canCancelEntry} onCancelEntryChange={setCanCancelEntry}
      onCancelImport={cancelImport}
      imagePickerRef={imagePicker} preparingImage={preparingImage} onPreparingImageChange={setPreparingImage}
      onImage={(next) => { setImage(next); dismissNotification(); }}
      onError={(message) => { setError(message); setSuccess(''); }} onAnalyze={analyze} importUsage={importUsage} usageUnavailable={usageUnavailable}
      onSample={() => { setSchedule(structuredClone(sampleSchedule)); setScheduleSource('sample'); trackEvent('sample_schedule_loaded', templateProperties(template)); dismissNotification(); }}
    /> : <>
      <TemplateGallery sort={sort} device={device} onDeviceChange={changeDevice} category={search.get('collection')} onCategoryChange={changeCategory} selectedId={selectedId} settings={templateSettings} schedule={schedule} scheduleTitle={scheduleTitle} resolution={resolution} onSelect={selectTemplate} searchQuery={debouncedSearchQuery} onClearSearch={() => setSearchQuery('')} />
    </>}
    {step === 'design' && <BackToTop />}
    <Toast message={error || success} kind={error ? 'error' : 'success'} onClose={dismissNotification} />
  </section>;
}
