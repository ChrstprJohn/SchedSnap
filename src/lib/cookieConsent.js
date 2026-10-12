const storageKey = 'schedsnap-cookie-consent-v1';
const changeEvent = 'schedsnap-cookie-consent-change';
const validChoice = value => value === 'granted' || value === 'denied' ? value : null;

let choice = null;
try { choice = validChoice(window.localStorage.getItem(storageKey)); }
catch { /* Storage can be unavailable; keep the choice in memory for this visit. */ }

export function getCookieConsent() { return choice; }
export function getServerCookieConsent() { return null; }

export function subscribeCookieConsent(listener) {
  window.addEventListener(changeEvent, listener);
  return () => window.removeEventListener(changeEvent, listener);
}

export function setCookieConsent(value) {
  if (!validChoice(value)) return;
  choice = value;
  try { window.localStorage.setItem(storageKey, value); }
  catch { /* The current visit still remembers the choice when storage is blocked. */ }
  window.dispatchEvent(new Event(changeEvent));
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.storageArea !== window.localStorage || (event.key !== storageKey && event.key !== null)) return;
    choice = validChoice(event.newValue);
    window.dispatchEvent(new Event(changeEvent));
  });
}
