import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, kind = 'success', onClose }) {
  useEffect(() => {
    if (!message || kind === 'error') return;
    const timer = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timer);
  }, [message, kind, onClose]);

  if (!message) return null;
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2;
  return <div className="notification-toast" role={kind === 'error' ? 'alert' : 'status'} aria-atomic="true">
    <Icon className={`mt-3 size-5 shrink-0 ${kind === 'error' ? 'text-[#923b2d]' : 'text-[#166534]'}`} aria-hidden="true" />
    <p className="min-w-0 flex-1 self-center text-sm leading-relaxed">{message}</p>
    <button type="button" className="alert-dismiss text-muted" aria-label="Dismiss notification" onClick={onClose}><X className="size-4" aria-hidden="true" /></button>
  </div>;
}
