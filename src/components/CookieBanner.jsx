import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { analyticsEnabled } from '../lib/analytics.js';
import { getCookieConsent, getServerCookieConsent, setCookieConsent, subscribeCookieConsent } from '../lib/cookieConsent.js';
import './cookie-banner.css';

export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribeCookieConsent, getCookieConsent, getServerCookieConsent);
  if (!analyticsEnabled || consent !== null) return null;

  return <section className="cookie-banner" aria-labelledby="cookie-banner-title">
    <h2 id="cookie-banner-title">Cookies on SchedSnap</h2>
    <p>We use optional cookies to see how people use SchedSnap. You can reject them and still create wallpapers. <Link to="/cookies">Cookie policy</Link></p>
    <div className="cookie-banner-actions">
      <button type="button" className="button-secondary" onClick={() => setCookieConsent('denied')}>Reject cookies</button>
      <button type="button" className="button-secondary" onClick={() => setCookieConsent('granted')}>Accept cookies</button>
    </div>
  </section>;
}
