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
      entrance.from('.hero-art', { y: 28, rotation: -4, duration: 1.2 }, 0);
    });
    return () => media.revert();
  }, { scope: container });

  return (
    <section ref={container} className="page-wrap landing-hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading" data-hero-line className="hero-heading">
          A little help for<br /> university life.
        </h1>
        <p data-hero-line className="hero-description">Student tools. Less busywork.</p>
        <a data-hero-line href="#services" className="button-primary hero-action">
          Explore tools <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
      <img className="hero-art" src="/art/toolbox-pattern.svg" width="408" height="408" alt="" aria-hidden="true" fetchPriority="high" />
    </section>
  );
}
