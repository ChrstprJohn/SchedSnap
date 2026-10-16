import { useEffect, useRef, useState } from 'react';
import { Heart, X } from 'lucide-react';

export default function DownloadThanksDialog({ name, vote, pending, error, onHeart, onRetry, onClose }) {
  const dialog = useRef(null);
  const [saving, setSaving] = useState(false);
  const [loved, setLoved] = useState(false);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  async function heart() {
    if (saving || pending || !vote) return;
    if (vote.liked) { onClose(); return; }
    setSaving(true);
    try { if (await onHeart()) setLoved(true); }
    finally { setSaving(false); }
  }
  return <dialog ref={dialog} className="download-thanks-dialog" data-loved={loved} aria-labelledby="download-thanks-title" aria-describedby="download-thanks-description" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className="template-modal-control download-thanks-close" aria-label="Close thank-you message" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    <span className="download-thanks-icon"><Heart size={26} fill={loved ? 'currentColor' : 'none'} aria-hidden="true" /></span>
    <h2 id="download-thanks-title">{loved ? 'Thanks for the love!' : 'Thanks for downloading!'}</h2>
    <p id="download-thanks-description" role="status">{loved ? 'Thank you for supporting SchedSnap. We hope this wallpaper brings a little joy to your day!' : <>Enjoy your {name} wallpaper. Do you love this design? Give it a heart to let us know.</>}</p>
    {loved && <div className="download-thanks-actions"><button type="button" className="button-primary" autoFocus onClick={onClose}>Done</button></div>}
    {error && <p className="download-heart-error" role="alert">{error} <button type="button" className="text-link" disabled={saving || !!pending} onClick={onRetry}>Retry</button></p>}
    <div className="download-thanks-actions" hidden={loved}><button type="button" className="button-primary" disabled={!vote || saving || !!pending || loved} onClick={heart}><Heart size={18} aria-hidden="true" />{saving ? 'Saving…' : vote?.liked ? 'Hearted' : 'Yes, I love it'}</button><button type="button" className="button-secondary" onClick={onClose}>No thanks</button></div>
  </dialog>;
}
