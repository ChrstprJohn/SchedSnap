import { lazy, Suspense } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

const ServicePreview = lazy(() => import('./ServicePreview.jsx'));

export default function ServiceCard({ service }) {
  return (
    <Link to={service.path} className="service-row" aria-labelledby={`service-${service.id}`}>
      {service.id === 'schedule-wallpaper' && <Suspense fallback={<div className="service-preview service-preview-loading" role="status">Loading previews…</div>}><ServicePreview /></Suspense>}
      <div className="service-copy">
        <h3 id={`service-${service.id}`} className="service-title">{service.title}</h3>
        <p className="service-description">{service.description}</p>
        <span className="service-action">Open tool <ArrowUpRight className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
