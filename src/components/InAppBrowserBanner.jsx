import { useEffect, useRef, useState } from 'react';

/**
 * Detects common in-app / WebView browsers where downloads are broken.
 * Returns { detected: bool, isIOS: bool, isAndroid: bool }
 */
function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  const inApp =
    /FBAN|FBAV|FB_IAB|MessengerLiteForiOS/i.test(ua) ||
    /Instagram/i.test(ua) ||
    /musical_ly|TikTok/i.test(ua) ||
    /TwitterAndroid|Twitter for iPhone/i.test(ua) ||
    /Snapchat/i.test(ua) ||
    /LinkedInApp/i.test(ua) ||
    // Generic Android WebView (not Chrome)
    (isAndroid && /wv\)/.test(ua) && !/Chrome\/[0-9]/.test(ua)) ||
    // iOS WebView (has no "Safari" in UA)
    (isIOS && !/Safari/i.test(ua));

  return { detected: inApp, isIOS, isAndroid };
}

/**
 * Try to open the current page in the device's real browser.
 * Android: use Chrome intent URL.
 * iOS: can't force Safari — show the instruction banner instead.
 */
function openInBrowser() {
  const url = window.location.href;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    // Intent URL — opens in Chrome (or default browser) on Android
    const intentUrl =
      'intent://' +
      url.replace(/^https?:\/\//, '') +
      '#Intent;scheme=' +
      (url.startsWith('https') ? 'https' : 'http') +
      ';package=com.android.chrome;end;';
    window.location.href = intentUrl;
  }
  // iOS cannot be force-redirected — the banner already shows instructions
}

export default function InAppBrowserBanner() {
  const [info, setInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const result = detectInAppBrowser();
    if (result.detected) setInfo(result);
  }, []);

  // Set --iab-h on <html> so .site-header can offset itself
  useEffect(() => {
    if (!info || dismissed) {
      document.documentElement.style.removeProperty('--iab-h');
      return;
    }
    const el = bannerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--iab-h', el.offsetHeight + 'px');
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty('--iab-h'); };
  }, [info, dismissed]);

  if (!info || dismissed) return null;

  return (
    <div ref={bannerRef} className="iab-banner" role="alert" aria-live="polite">
      <div className="iab-inner">
        <span className="iab-icon" aria-hidden="true">⚠️</span>
        <div className="iab-text">
        {info.isIOS ? (
            <>
              Downloads won't work here. Tap <strong>···</strong> → <strong>Open in Safari</strong>.
            </>
          ) : (
            <>
          Downloads won't work here.
            </>
          )}
        </div>
        <div className="iab-actions">
          {info.isAndroid && (
            <button
              type="button"
              className="iab-open-btn"
              onClick={openInBrowser}
            >
              Open in Browser
            </button>
          )}
          <button
            type="button"
            className="iab-dismiss"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
