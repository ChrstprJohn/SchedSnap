import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Legal from '../pages/Legal.jsx';
import ScheduleGuide from '../pages/ScheduleGuide.jsx';
import ScheduleWallpaper from '../pages/ScheduleWallpaper/Index.jsx';
import { CatalogProvider } from '../lib/catalog.jsx';
import App from '../App.jsx';

// The landing page shares the app tree so the browser can hydrate its existing HTML.
// Catalog data still loads from the API, without embedding stale template records.
export function renderPage(path) {
  if (path === '/') return renderToString(<StaticRouter location={path}><App /></StaticRouter>);
  const creator = path === '/services/schedule-wallpaper';
  return renderToString(
    <StaticRouter location={path}>
      <CatalogProvider>
        <div className="flex min-h-dvh flex-col">
          <a href="#main" className="skip-link">Skip to content</a>
          <Navbar />
          <main id="main" className="flex-1" tabIndex={-1}>
            {creator ? <ScheduleWallpaper /> : path === '/guides/class-schedule-wallpaper' ? <ScheduleGuide /> : <Legal kind={path.slice(1)} />}
          </main>
          {!creator && <Footer />}
        </div>
      </CatalogProvider>
    </StaticRouter>,
  );
}
