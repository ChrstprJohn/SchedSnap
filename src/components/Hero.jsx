import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, useGSAP } from '../lib/animation.js';

export default function Hero() {
  const container = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const entrance = gsap.timeline({ defaults: { ease: 'expo.out' } });
      entrance.from('[data-hero-line]', { y: 18, duration: 0.85, stagger: 0.08 });
    });
    return () => media.revert();
  }, { scope: container });

  const handleExploreClick = (e) => {
    const target = document.getElementById('services');
    if (target) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      window.history.pushState(null, '', '#services');
    }
  };

  return (
    <section ref={container} className="landing-hero" aria-labelledby="hero-heading">
      <img className="hero-background" src="/art/hero-study-desk.png" alt="" aria-hidden="true" fetchPriority="high" />
      <div className="page-wrap hero-content">
        <div className="hero-copy">
          <h1 id="hero-heading" data-hero-line className="hero-heading">
            A little help for<br /> university life.
          </h1>
          <p data-hero-line className="hero-description">Student tools. Less busywork.</p>
          <a
            data-hero-line
            href="#services"
            onClick={handleExploreClick}
            className="button-primary hero-action"
          >
            Explore tools <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
