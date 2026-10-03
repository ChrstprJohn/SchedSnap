import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';

const ScheduleWallpaper = lazy(() => import('./pages/ScheduleWallpaper/Index.jsx'));

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = pathname === '/services/schedule-wallpaper'
      ? 'Schedule wallpaper — UniToolbox'
      : 'UniToolbox — Tools for university life';
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<p className="page-wrap py-20" role="status">Opening tool…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services/schedule-wallpaper" element={<ScheduleWallpaper />} />
            <Route path="*" element={
              <section className="page-wrap py-24">
                <h1 className="text-4xl font-semibold">Page not found</h1>
                <p className="mt-4 text-muted">Head back to the toolbox to find a service.</p>
                <Link to="/" className="button-primary mt-8">Back to UniToolbox</Link>
              </section>
            } />
          </Routes>
        </Suspense>
      </main>
      {pathname !== '/services/schedule-wallpaper' && <Footer />}
    </div>
  );
}
