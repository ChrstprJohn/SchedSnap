import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import BrandMark from './BrandMark.jsx';
import MakerBanner from './MakerBanner.jsx';
import SocialLinks from './SocialLinks.jsx';

function subscribeToScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}
const hasScrolled = () => window.scrollY > 8;

export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, () => false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    const closeEscape = event => {
      if (event.key === 'Escape') { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [menuOpen]);
  function sectionLinks() {
    return [['how-it-works', 'How it works'], ['designs', 'Designs'], ['faq', 'FAQs']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={event => {
      event.preventDefault();
      setMenuOpen(false);
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      if (section) { section.setAttribute('tabindex', '-1'); section.focus({ preventScroll: true }); }
    }}>{label}</a>);
  }
  return (
    <header className={`site-header${menuOpen ? ' mobile-menu-open' : ''}${isHome ? ` site-header-home${!scrolled ? ' is-at-top' : ''}` : ''}`}>
      <div className="page-wrap site-header-inner">
        <Link to="/" className="site-brand" onClick={event => {
          setMenuOpen(false);
          if (isHome) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
          }
        }}>
          <BrandMark /> SchedSnap
        </Link>
        {isHome && <nav className="landing-nav" aria-label="Main navigation">
          {sectionLinks()}
        </nav>}
        {isHome && <div className="mobile-navigation" ref={menuRef} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button ref={toggleRef} type="button" className="mobile-nav-toggle" aria-expanded={menuOpen} aria-controls="mobile-section-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => {
            const bounds = toggleRef.current.getBoundingClientRect();
            menuRef.current.style.setProperty('--menu-origin-x', `${bounds.left + bounds.width / 2}px`);
            menuRef.current.style.setProperty('--menu-origin-y', `${bounds.top + bounds.height / 2}px`);
            setMenuOpen(open => !open);
          }}>
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
          <div id="mobile-section-nav" className="mobile-nav-panel" data-open={menuOpen} inert={!menuOpen}>
            <nav className="mobile-section-links" aria-label="Mobile navigation">{sectionLinks()}</nav>
            <div className="mobile-menu-footer"><MakerBanner /><SocialLinks /></div>
          </div>
        </div>}
      </div>
    </header>
  );
}
