import { useEffect, useRef, useState } from 'react';
import { services } from '../config/services.js';
import { wallpaperTemplates } from '../assets/templates.js';

const numberFormat = new Intl.NumberFormat('en');
const TOTAL_VISITS = 1284;

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Intersection Observer — fires the animation once on scroll-into-view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Count-up animation — runs once when `started` flips to true
  useEffect(() => {
    if (!started) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return { count, ref };
}

function AnimatedStat({ label, value, animate }) {
  const { count, ref } = useCountUp(animate ? value : 0);
  const display = animate ? count : value;

  return (
    <div className="stats-item" ref={animate ? ref : undefined}>
      <dt className="stats-label">{label}</dt>
      <dd
        className="stats-value"
        aria-label={value === null ? 'Unavailable' : undefined}
      >
        {value === null ? '—' : `${numberFormat.format(display)}+`}
      </dd>
    </div>
  );
}

export default function StatsBanner({ visits = TOTAL_VISITS }) {
  const stats = [
    { label: 'Total visits', value: visits, animate: true },
    { label: 'Tools available', value: services.length },
    { label: 'Wallpaper styles', value: wallpaperTemplates.length },
  ];

  return (
    <section className="stats-banner" aria-label="UniToolbox at a glance">
      <dl className="page-wrap stats-list">
        {stats.map(({ label, value, animate }) => (
          <AnimatedStat key={label} label={label} value={value} animate={!!animate} />
        ))}
      </dl>
    </section>
  );
}
