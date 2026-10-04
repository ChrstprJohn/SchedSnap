import { useEffect, useState, useSyncExternalStore } from 'react';
import { wallpaperTemplates } from '../assets/templates.js';
import { designCollections } from '../config/collections.js';

// Mock display value until the landing page uses live visit totals.
const MOCK_VISITS = 12000;
const TEMPLATE_COUNT = wallpaperTemplates.length;
const COLLECTION_COUNT = designCollections.filter(({ id }) => id !== 'all').length;
const COUNT_DURATION = 1200;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function subscribeToMotion(onChange) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function StatValue({ display, total }) {
  return <dd><span aria-hidden="true">{display}+</span><span className="sr-only">{total.toLocaleString('en-US')} or more</span></dd>;
}

export default function LandingStats() {
  const [progress, setProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => true);

  useEffect(() => {
    if (reducedMotion) return;
    let frame;
    let startedAt;
    const countUp = (now) => {
      startedAt ??= now;
      const elapsed = Math.min((now - startedAt) / COUNT_DURATION, 1);
      setProgress(1 - (1 - elapsed) ** 3);
      if (elapsed < 1) frame = requestAnimationFrame(countUp);
    };
    frame = requestAnimationFrame(countUp);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const displayedProgress = reducedMotion ? 1 : progress;

  return (
    <section className="landing-stats" aria-label="SchedSnap in numbers">
      <dl className="page-wrap">
        <div className="landing-stat">
          <dt>Total visits</dt>
          <StatValue display={`${Math.round(MOCK_VISITS * displayedProgress / 1000)}K`} total={MOCK_VISITS} />
        </div>
        <div className="landing-stat"><dt>Total templates</dt><StatValue display={Math.round(TEMPLATE_COUNT * displayedProgress)} total={TEMPLATE_COUNT} /></div>
        <div className="landing-stat"><dt>Collections</dt><StatValue display={Math.round(COLLECTION_COUNT * displayedProgress)} total={COLLECTION_COUNT} /></div>
      </dl>
    </section>
  );
}
