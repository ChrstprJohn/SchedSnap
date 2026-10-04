import { useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import { Blocks } from 'lucide-react';

function subscribeToScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}
const hasScrolled = () => window.scrollY > 8;

export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, () => false);
  return (
    <header className={`site-header${isHome ? ' site-header-home' : ''}${!scrolled ? ' is-at-top' : ''}`}>
      <div className="page-wrap site-header-inner">
        <Link to="/" className="site-brand">
          <Blocks aria-hidden="true" /> UniToolbox
        </Link>
      </div>
    </header>
  );
}
