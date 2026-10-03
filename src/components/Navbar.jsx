import { Link, useLocation } from 'react-router';
import { Blocks } from 'lucide-react';

export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  return (
    <header className={`site-header${isHome ? ' site-header-overlay' : ''}`}>
      <div className="page-wrap flex min-h-18 items-center">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Blocks className="size-6 text-accent" aria-hidden="true" /> UniToolbox
        </Link>
      </div>
    </header>
  );
}
