import { Link } from 'react-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { trackEvent } from '../lib/analytics.js';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ROTATION_DELAY = 5000;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function subscribeToMotion(onChange) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const pageIsVisible = () => document.visibilityState === 'visible';
function subscribeToVisibility(onChange) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

const collections = [
  { id: 'little-friends', name: 'Little Friends', description: 'Soft colors. Familiar little faces.', alt: 'Phone previews of pastel class schedule wallpapers with little friend characters' },
  { id: 'mascot', name: 'Mascots', description: 'A study buddy for your lock screen.', alt: 'Phone previews of class schedule wallpapers with panda and cat mascots' },
  { id: 'pattern', name: 'Patterns', description: 'Checks, dots, and stripes.', alt: 'Phone previews of peach checkerboard and lavender dotted class schedule wallpapers' },
  { id: 'original', name: 'Originals', description: 'Soft light and quiet colors.', alt: 'Phone previews of class schedules on calm photographic wallpapers' },
];

export default function DesignShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const showcaseRef = useRef(null);
  const elapsedRef = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => true);
  const pageVisible = useSyncExternalStore(subscribeToVisibility, pageIsVisible, () => false);
  const isRotating = !isHovered && !focusPaused && isInView && pageVisible && !reducedMotion;
  const collection = collections[activeIndex];
  const changeCollection = (direction) => setActiveIndex((index) => (index + direction + collections.length) % collections.length);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.25), { threshold: 0.25 });
    observer.observe(showcaseRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [activeIndex]);

  useEffect(() => {
    if (!isRotating) return;
    const started = performance.now();
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % collections.length), Math.max(0, ROTATION_DELAY - elapsedRef.current));
    return () => {
      window.clearTimeout(timer);
      elapsedRef.current = Math.min(ROTATION_DELAY, elapsedRef.current + performance.now() - started);
    };
  }, [activeIndex, isRotating]);

  useEffect(() => {
    if (!isInView) return;
    const next = collections[(activeIndex + 1) % collections.length];
    const image = new Image();
    image.src = `/images/collections/${next.id}-mobile.webp`;
  }, [activeIndex, isInView]);

  return (
    <section ref={showcaseRef} id="designs" className="page-wrap landing-showcase" aria-labelledby="designs-heading" aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setIsHovered(true); }}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false); }}>
      <div className="showcase-heading">
        <h2 id="designs-heading">Find your style.</h2>
      </div>
      <div className="collection-list" aria-live={isRotating ? 'off' : 'polite'} aria-atomic="true">
        <article id="collection-preview" className="collection-showcase" aria-labelledby="collection-title" aria-roledescription="slide">
            <figure className="collection-image">
              <button type="button" className="showcase-arrow showcase-image-arrow showcase-image-previous" aria-label="Previous collection" aria-controls="collection-preview" onClick={() => changeCollection(-1)}><ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" /></button>
              <picture key={collection.id}>
                <img src={'/images/collections/' + collection.id + '-mobile.webp'} alt={collection.alt} width="1122" height="1402" loading="lazy" decoding="async" />
              </picture>
              <button type="button" className="showcase-arrow showcase-image-arrow showcase-image-next" aria-label="Next collection" aria-controls="collection-preview" onClick={() => changeCollection(1)}><ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" /></button>
            </figure>
            <div className="showcase-controls" aria-label="Browse collections">
              <button type="button" className="showcase-arrow showcase-desktop-arrow" aria-label="Previous collection" aria-controls="collection-preview" onClick={() => changeCollection(-1)}><ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" /></button>
              <div className="showcase-progress" aria-label={'Collection ' + (activeIndex + 1) + ' of ' + collections.length} style={{ '--rotation-duration': ROTATION_DELAY + 'ms' }}>
                {collections.map((item, index) => <span key={item.id} aria-hidden="true">{index === activeIndex && <span className="showcase-progress-fill" style={{ animationPlayState: isRotating ? 'running' : 'paused' }} />}</span>)}
              </div>
              <button type="button" className="showcase-arrow showcase-desktop-arrow" aria-label="Next collection" aria-controls="collection-preview" onClick={() => changeCollection(1)}><ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" /></button>
            </div>
            <div className="collection-copy">
              <h3 id="collection-title">{collection.name}</h3>
              <p>{collection.description}</p>
              <Link to={'/services/schedule-wallpaper?collection=' + collection.id} className="button-primary collection-action" aria-label={'Create wallpaper with ' + collection.name + ' designs'} onClick={() => trackEvent('wallpaper_creation_started', { source: 'collection_showcase', collection: collection.id })}>Create wallpaper <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
        </article>
      </div>
    </section>
  );
}
