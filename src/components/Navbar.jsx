import { useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight } from 'lucide-react';
import BrandMark from './BrandMark.jsx';

function subscribeToScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}
const hasScrolled = () => window.scrollY > 8;

export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, () => false);
  return (
    <header className={`site-header${isHome ? ` site-header-home${!scrolled ? ' is-at-top' : ''}` : ''}`}>
      <div className="page-wrap site-header-inner">
        <Link to="/" className="site-brand">
          <BrandMark /> SchedSnap
        </Link>
        {isHome && scrolled && <nav className="landing-nav" aria-label="Main navigation">
          <Link className="nav-create" to="/services/schedule-wallpaper">Create wallpaper <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>}
      </div>
    </header>
  );
}
