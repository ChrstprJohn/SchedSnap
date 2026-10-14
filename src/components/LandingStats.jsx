import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTemplates } from '../lib/catalogContext.js';
import { galleryCategories } from '../config/collections.js';

import { loadVisitCount } from '../lib/visits.js';

const COLLECTION_COUNT = galleryCategories.filter(({ id }) => id !== 'all').length;
const COUNT_DURATION = 1200;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function subscribeToMotion(onChange) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function StatValue({ display, total, exact = false }) {
  return <dd><span aria-hidden="true">{display}{exact ? '' : '+'}</span><span className="sr-only">{total.toLocaleString('en-US')}{exact ? ' recorded pageviews' : ' or more'}</span></dd>;
}

function useCountProgress(ready) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!ready) return;
    let frame;
    let startedAt;
    const countUp = now => {
      if (prefersReducedMotion()) {
        setProgress(1);
        return;
      }
      startedAt ??= now;
      const elapsed = Math.min((now - startedAt) / COUNT_DURATION, 1);
      setProgress(1 - (1 - elapsed) ** 3);
      if (elapsed < 1) frame = requestAnimationFrame(countUp);
    };
    frame = requestAnimationFrame(countUp);
    return () => cancelAnimationFrame(frame);
  }, [ready]);
  return progress;
}

export default function LandingStats() {
  const TEMPLATE_COUNT = useTemplates().length;
  const sectionRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [visits, setVisits] = useState(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => true);
  const progress = useCountProgress(entered && TEMPLATE_COUNT > 0);
  const visitProgress = useCountProgress(entered && visits !== null);

  useEffect(() => {
    let active = true;
    loadVisitCount().then(count => { if (active) setVisits(count); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
      setEntered(true);
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const displayedProgress = reducedMotion ? 1 : progress;

  return (
    <section ref={sectionRef} className="landing-stats" aria-label="SchedSnap in numbers">
      <dl className="page-wrap">
        <div className="landing-stat">
          <dt>Total pageviews</dt>
          {visits === null ? <dd><span aria-hidden="true">—</span><span className="sr-only">Pageview count unavailable</span></dd> : <StatValue display={new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(visits * (reducedMotion ? 1 : visitProgress)))} total={visits} exact />}
        </div>
        <div className="landing-stat"><dt>Total templates</dt><StatValue display={Math.round(TEMPLATE_COUNT * displayedProgress)} total={TEMPLATE_COUNT} /></div>
        <div className="landing-stat"><dt>Collections</dt><StatValue display={Math.round(COLLECTION_COUNT * displayedProgress)} total={COLLECTION_COUNT} /></div>
      </dl>
    </section>
  );
}
