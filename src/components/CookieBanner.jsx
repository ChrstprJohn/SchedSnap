import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { analyticsEnabled } from '../lib/analytics.js';
import { getCookieConsent, getServerCookieConsent, setCookieConsent, subscribeCookieConsent } from '../lib/cookieConsent.js';
import './cookie-banner.css';

export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribeCookieConsent, getCookieConsent, getServerCookieConsent);
  if (!analyticsEnabled || consent !== null) return null;

  return <section className="cookie-banner" aria-labelledby="cookie-banner-title">
    <h2 id="cookie-banner-title">Your cookie choices</h2>
    <p>We use optional analytics cookies to understand how SchedSnap is used. The wallpaper creator works whether you accept or reject them. <Link to="/privacy#cookies">Cookie policy</Link></p>
    <div className="cookie-banner-actions">
      <button type="button" className="button-secondary" onClick={() => setCookieConsent('denied')}>Reject analytics</button>
      <button type="button" className="button-secondary" onClick={() => setCookieConsent('granted')}>Accept analytics</button>
    </div>
  </section>;
}
