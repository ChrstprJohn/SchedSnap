import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Home from '../pages/Home.jsx';
import Legal from '../pages/Legal.jsx';
import ScheduleWallpaper from '../pages/ScheduleWallpaper/Index.jsx';
import { CatalogProvider } from '../lib/catalog.jsx';

// Render the existing components; the browser mounts the interactive app as usual.
// Catalog data still loads from the API, without embedding stale template records.
export function renderPage(path) {
  const creator = path === '/services/schedule-wallpaper';
  return renderToString(
    <StaticRouter location={path}>
      <CatalogProvider>
        <div className="flex min-h-dvh flex-col">
          <a href="#main" className="skip-link">Skip to content</a>
          <Navbar />
          <main id="main" className="flex-1" tabIndex={-1}>
            {path === '/' ? <Home /> : creator ? <ScheduleWallpaper /> : <Legal kind={path.slice(1)} />}
          </main>
          {!creator && <Footer />}
        </div>
      </CatalogProvider>
    </StaticRouter>,
  );
}
