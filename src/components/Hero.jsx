import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '../lib/analytics.js';

export default function Hero() {
  function exploreDesigns() {
    trackEvent('designs_explored', { source: 'hero' });
    document.getElementById('designs')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  }

  return (
    <section className="landing-hero" aria-labelledby="hero-heading">
      <img className="hero-ambient" src="/images/hero-ambient.webp" alt="" aria-hidden="true" width="1672" height="941" decoding="async" />
      <div className="page-wrap hero-content">
        <div className="hero-copy">
          <h1 id="hero-heading" className="hero-heading">Your schedule.<br />On your screen.</h1>
          <p className="hero-description">Turn your class schedule into a phone wallpaper.</p>
          <div className="hero-actions">
            <Link to="/services/schedule-wallpaper" className="button-primary hero-action" onClick={() => trackEvent('wallpaper_creation_started', { source: 'hero' })}>Create wallpaper <ArrowRight size={18} aria-hidden="true" /></Link>
            <button type="button" className="hero-browse" onClick={exploreDesigns}>Explore</button>
          </div>
          <p className="hero-note">No account needed.</p>
        </div>
        <div className="hero-art">
          <img src="/images/hero-phones.webp" alt="Three phones with sunlit, navy bear, and ivory panda schedule wallpapers" width="1448" height="1086" fetchPriority="high" decoding="async" />
        </div>
      </div>
    </section>
  );
}
