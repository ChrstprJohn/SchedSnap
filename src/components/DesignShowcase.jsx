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
  { id: 'little-friends', name: 'Little Friends', description: 'Soft colors. Familiar little faces.', artwork: 'a cream bunny on a pastel pink schedule' },
  { id: 'mascot', name: 'Mascots', description: 'A study buddy for your screen.', artwork: 'a panda mascot on an ivory schedule' },
  { id: 'pattern', name: 'Patterns', description: 'Checks, dots, and stripes.', artwork: 'a peach checkerboard schedule' },
  { id: 'original', name: 'Originals', description: 'Soft light and quiet colors.', artwork: 'a class schedule on a frosted blue wallpaper' },
];
const devices = [
  { id: 'mobile', title: 'For mobile.', label: 'Phone', description: 'Keep your week close, right on your lock screen.' },
  { id: 'tablet', title: 'For tablet.', label: 'Tablet', description: 'Your favorite styles, in portrait and landscape.' },
  { id: 'laptop', title: 'For laptop.', label: 'Laptop', description: 'A wider view of your week, with room to make it yours.' },
];
const assetPath = (device, collection) => device === 'mobile'
  ? `/images/collections/${collection}-mobile.webp`
  : device === 'tablet' ? `/images/collections/tablet/${collection}.webp`
    : `/images/collections/laptop/${collection}.webp`;

function DeviceShowcase({ device }) {
  const slides = collections;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const showcaseRef = useRef(null);
  const elapsedRef = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => true);
  const pageVisible = useSyncExternalStore(subscribeToVisibility, pageIsVisible, () => false);
  const isRotating = !isHovered && !focusPaused && isInView && pageVisible && !reducedMotion;
  const collection = slides[activeIndex];
  const previewId = `${device.id}-collection-preview`;
  const isPhone = device.id === 'mobile';
  const isPortrait = isPhone || device.id === 'tablet';
  const slideCount = slides.length;
  const changeCollection = (direction) => setActiveIndex((index) => (index + direction + slideCount) % slideCount);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.25), { threshold: 0.25 });
    observer.observe(showcaseRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { elapsedRef.current = 0; }, [activeIndex]);
  useEffect(() => {
    if (!isRotating) return;
    const started = performance.now();
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % slideCount), Math.max(0, ROTATION_DELAY - elapsedRef.current));
    return () => {
      window.clearTimeout(timer);
      elapsedRef.current = Math.min(ROTATION_DELAY, elapsedRef.current + performance.now() - started);
    };
  }, [activeIndex, isRotating, slideCount]);
  useEffect(() => {
    if (!isInView) return;
    const next = collections[(activeIndex + 1) % slideCount];
    const image = new Image();
    image.src = assetPath(device.id, next.id);
  }, [activeIndex, isInView, device.id, slideCount]);

  return (
    <section ref={showcaseRef} className={`device-showcase device-showcase-${device.id}`} aria-labelledby={`${device.id}-collection-title`} aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setIsHovered(true); }}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false); }}>
      <div className="collection-list" aria-live={isRotating ? 'off' : 'polite'} aria-atomic="true">
        <article id={previewId} className="collection-showcase" aria-labelledby={`${device.id}-collection-title`} aria-roledescription="slide">
          <figure className="collection-image">
            <button type="button" className="showcase-arrow showcase-image-arrow showcase-image-previous" aria-label={`Previous ${device.label.toLowerCase()} collection`} aria-controls={previewId} onClick={() => changeCollection(-1)}><ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" /></button>
            <picture key={collection.id}>
              <img src={assetPath(device.id, collection.id)} alt={`${device.label}${device.id === 'tablet' ? ' portrait and landscape' : ''} wallpaper preview of ${collection.artwork}`} width={isPortrait ? 1122 : 1448} height={isPortrait ? 1402 : 1086} loading="lazy" decoding="async" />
            </picture>
            <button type="button" className="showcase-arrow showcase-image-arrow showcase-image-next" aria-label={`Next ${device.label.toLowerCase()} collection`} aria-controls={previewId} onClick={() => changeCollection(1)}><ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" /></button>
          </figure>
          <div className="showcase-controls" aria-label={`Browse ${device.label.toLowerCase()} collections`}>
            <button type="button" className="showcase-arrow showcase-desktop-arrow" aria-label={`Previous ${device.label.toLowerCase()} collection`} aria-controls={previewId} onClick={() => changeCollection(-1)}><ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" /></button>
            <div className="showcase-progress" aria-label={'Preview ' + (activeIndex + 1) + ' of ' + slideCount} style={{ '--rotation-duration': ROTATION_DELAY + 'ms' }}>
              {slides.map((item, index) => <span key={`${item.id}-${item.orientation || device.id}`} aria-hidden="true">{index === activeIndex && <span className="showcase-progress-fill" style={{ animationPlayState: isRotating ? 'running' : 'paused' }} />}</span>)}
            </div>
            <button type="button" className="showcase-arrow showcase-desktop-arrow" aria-label={`Next ${device.label.toLowerCase()} collection`} aria-controls={previewId} onClick={() => changeCollection(1)}><ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" /></button>
          </div>
          <div className="collection-copy">
            <h3 id={`${device.id}-collection-title`}>{device.title}</h3>
            <p>{device.description}</p>
            <Link to={`/services/schedule-wallpaper?device=${device.id}`} className="button-primary collection-action" aria-label={`View more ${device.id} wallpapers`} onClick={() => trackEvent('wallpaper_gallery_opened', { source: 'device_showcase', device: device.id })}>View more <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function DesignShowcase() {
  return (
    <section id="designs" className="page-wrap landing-showcase" aria-labelledby="designs-heading">
      <div className="showcase-heading"><h2 id="designs-heading">Find your style.</h2></div>
      {devices.map((device) => <DeviceShowcase key={device.id} device={device} />)}
    </section>
  );
}
