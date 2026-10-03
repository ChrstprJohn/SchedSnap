import { useRef, useState } from 'react';
import { ArrowRight, FileText, ImageUp, LoaderCircle, Pencil, X } from 'lucide-react';
import Toast from '../../components/Toast.jsx';
import { prepareImage } from '../../utils/imageHelpers.js';

export default function Uploader({ image, onImage, onAnalyze, busy, onError, onCancel, onManual, onSample, hasSchedule, compact = false }) {
  const input = useRef(null);
  const requestId = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState('');
  const [dragging, setDragging] = useState(false);
  const privacyNote = <>Crop out personal details. Your image goes to Google Gemini and isn’t saved by UniToolbox. <a className="underline" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Data-use terms</a>.</>;

  async function choose(file) {
    if (!file || busy) return;
    const id = ++requestId.current;
    setPreparing(true);
    setLocalError('');
    onError?.('');
    try {
      const prepared = await prepareImage(file);
      if (id === requestId.current) onImage(prepared);
    } catch (failure) {
      if (id === requestId.current) { if (!compact) onImage(null); if (onError) onError(failure.message); else setLocalError(failure.message); }
    } finally { if (id === requestId.current) setPreparing(false); }
  }

  return (
    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading" className={compact ? 'sr-only' : 'text-lg font-semibold'}>Upload document</h2>
      <div onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }} className={`flex flex-col items-center justify-center text-center ${compact ? 'pt-3 pb-4' : 'mt-3 min-h-[280px] rounded-xl border border-dashed p-4'} ${dragging ? 'bg-[#e2e8f0] border-accent' : 'border-line bg-soft'}`}>
        {image ? <img src={image.preview} alt="Selected document" className="mx-auto max-h-64 max-w-full rounded-lg object-contain" /> : <ImageUp className="mx-auto size-10 text-accent" strokeWidth={1.5} aria-hidden="true" />}
        <p className={`${compact ? 'mt-3 text-sm' : 'mt-5'} break-all font-medium`}>{image ? image.name : 'Drop your image here'}</p>
        <p className={`${compact ? 'mt-1 text-xs' : 'mt-2 text-sm'} text-muted`}>JPG, PNG, or WebP · up to 10 MB</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Document image" onChange={(event) => { choose(event.target.files[0]); event.target.value = ''; }} disabled={busy || preparing} />
        {!compact && <button type="button" className="button-secondary mt-5" disabled={busy || preparing} onClick={() => input.current.click()}><ImageUp className="size-4" aria-hidden="true" />{preparing ? 'Preparing image…' : image ? 'Choose another image' : 'Choose image'}</button>}
      </div>
      {!compact && <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted">{privacyNote}</p>}
      <Toast message={localError} kind="error" onClose={() => setLocalError('')} />
      {hasSchedule && <p className="mt-4 text-sm text-muted">Reading a new image replaces your edits.</p>}
      {busy && <p role="status" className="mt-5 text-sm text-muted">Reading image…</p>}
      <div className={compact ? 'mt-3 flex flex-wrap items-end justify-between gap-3 pb-2' : 'workflow-actions'}>
        {compact && <p className="min-w-[200px] max-w-2xl flex-1 text-xs leading-relaxed text-muted">{privacyNote}</p>}
        {!compact && <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <button type="button" disabled={busy || preparing} onClick={onManual} className="text-link inline-flex items-center gap-2"><Pencil className="size-4" aria-hidden="true" />{hasSchedule ? 'Review classes' : 'Enter manually'}</button>
        <button type="button" disabled={busy || preparing} onClick={onSample} className="text-link inline-flex items-center gap-2"><FileText className="size-4" aria-hidden="true" />Use sample</button>
        </div>}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {compact && <button type="button" className="button-secondary review-toolbar-action" disabled={busy || preparing} onClick={() => input.current.click()}><Pencil className="size-4" aria-hidden="true" />{preparing ? 'Preparing…' : busy ? 'Reading…' : 'Change image'}</button>}
          {!compact && busy && <button type="button" className="button-secondary" onClick={onCancel}><X className="size-4" aria-hidden="true" /> Cancel</button>}
          {!compact && <button type="button" disabled={!image || busy || preparing} onClick={onAnalyze} className="button-primary">{busy ? <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}{busy ? 'Reading…' : 'Read image'}</button>}
        </div>
      </div>
    </section>
  );
}
