import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ImageUp, ListChecks, LoaderCircle, Maximize2, Pencil, TriangleAlert } from 'lucide-react';
import { prepareImage } from '../../utils/imageHelpers.js';
import WallpaperViewer from './WallpaperViewer.jsx';

export default function Uploader({ image, onImage, onAnalyze, busy, onError, onManual, onSample, hasSchedule, pickerRef, onPreparing, onCancel }) {
  const input = useRef(null);
  const uploadButton = useRef(null);
  const requestId = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1080 });
  useImperativeHandle(pickerRef, () => ({ openPicker() { if (!busy && !preparing) input.current?.click(); }, focusUpload() { uploadButton.current?.focus(); } }), [busy, preparing]);
  useEffect(() => () => { requestId.current += 1; }, []);

  async function choose(file) {
    if (!file || busy || preparing) return;
    const id = ++requestId.current;
    setPreparing(true);
    onPreparing?.(true);
    onError('');
    try {
      const prepared = await prepareImage(file);
      if (id === requestId.current) onImage(prepared);
    } catch (failure) { if (id === requestId.current) onError(failure.message); }
    finally { if (id === requestId.current) { setPreparing(false); onPreparing?.(false); } }
  }

  const dropEvents = {
    onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy || preparing ? 'none' : 'copy'; if (!busy && !preparing) setDragging(true); },
    onDragLeave: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); },
    onDrop: (event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length > 1) { onError('Drop one schedule image at a time.'); return; } choose(event.dataTransfer.files[0]); },
  };

  return <section id="schedule-import" aria-label="Import your schedule" className="schedule-import">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Schedule image" onChange={(event) => { choose(event.target.files[0]); event.target.value = ''; }} disabled={busy || preparing} />
    {image ? <>
      <button type="button" className={`schedule-image-preview ${dragging ? 'is-dragging' : ''}`} aria-label="Enlarge uploaded schedule" aria-haspopup="dialog" onClick={() => setEnlarged(true)} {...dropEvents}><img src={image.preview} alt="Selected schedule" onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /><span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span></button>
      {hasSchedule && <p id="import-replacement-warning" className="import-replacement-warning"><TriangleAlert size={16} aria-hidden="true" />Importing replaces your current classes and edits.</p>}
      <div className="import-footer"><p className="upload-privacy">Sent to Google Gemini. Not saved here. <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Data use</a></p><div className="import-submit-actions"><button type="button" className="button-secondary import-cancel" disabled={preparing} onClick={onCancel}>Cancel</button><button type="button" disabled={busy || preparing} aria-describedby={hasSchedule ? 'import-replacement-warning' : undefined} onClick={onAnalyze} className="button-primary">{busy && <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />}{busy ? 'Importing…' : 'Import classes'}</button></div></div>
    </> : <>
      <button ref={uploadButton} type="button" className={`schedule-dropzone ${dragging ? 'is-dragging' : ''}`} disabled={busy || preparing} onClick={() => input.current.click()} {...dropEvents}>
        <ImageUp size={32} strokeWidth={1.5} aria-hidden="true" />
        <span className="upload-label">{preparing ? 'Preparing…' : dragging ? 'Drop image here' : 'Upload image'}</span>
        <span className="upload-drop-hint">or drag and drop it here</span>
        <span className="upload-formats">JPG, PNG, WebP · 10 MB max</span>
      </button>
      {!hasSchedule && <div className="upload-alternatives"><button type="button" disabled={busy || preparing} onClick={onManual} className="button-secondary"><Pencil size={16} aria-hidden="true" />Enter manually</button><button type="button" disabled={busy || preparing} onClick={onSample} className="button-secondary"><ListChecks size={16} aria-hidden="true" />Try a sample</button></div>}
    </>}
    {busy && <p className="sr-only" role="status">Importing classes.</p>}
    {enlarged && image && <WallpaperViewer title="Schedule image" resolution={imageSize} onClose={() => setEnlarged(false)}><img src={image.preview} alt="Uploaded schedule" className="block h-auto w-full" /></WallpaperViewer>}
  </section>;
}
