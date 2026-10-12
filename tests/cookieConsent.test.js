import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const consentSource = readFileSync(new URL('../src/lib/cookieConsent.js', import.meta.url), 'utf8');
const analyticsSource = readFileSync(new URL('../src/lib/analytics.js', import.meta.url), 'utf8');
const key = 'schedsnap-cookie-consent-v1';

// Run the actual browser modules with storage and the external SDK replaced.
function browser({ stored, blocked = false, token = 'test-token' } = {}) {
  const data = new Map(stored ? [[key, stored]] : []);
  const window = new EventTarget();
  window.localStorage = {
    getItem(name) { if (blocked) throw new Error('Blocked'); return data.get(name) ?? null; },
    setItem(name, value) { if (blocked) throw new Error('Blocked'); data.set(name, value); },
  };
  const events = [];
  let optedOut = true;
  let config;
  let initializations = 0;
  const posthog = {
    init(_token, options) { initializations++; config = options; options.loaded(this); },
    opt_in_capturing() { optedOut = false; },
    opt_out_capturing() { optedOut = true; },
    has_opted_out_capturing() { return optedOut; },
    register() {},
    capture(event, properties) { if (!optedOut && config.before_send({ event, properties })) events.push(event); },
  };
  const context = { window, Event, posthog, env: { VITE_POSTHOG_TOKEN: token, MODE: 'test' } };
  runInNewContext(consentSource.replaceAll('export ', '') + '\nglobalThis.consent = { getCookieConsent, setCookieConsent };', context);
  runInNewContext(analyticsSource.replace(/^import .*;\r?$/gm, '').replaceAll('export ', '').replaceAll('import.meta.env', 'env') + '\nglobalThis.track = trackEvent;', context);
  return { ...context, data, events, initializations: () => initializations, optedOut: () => optedOut, config: () => config };
}

test('no consent, rejection, and invalid stored choices never initialize analytics', () => {
  for (const stored of [undefined, 'denied', 'invalid']) {
    const page = browser({ stored });
    page.track('download');
    assert.equal(page.initializations(), 0);
    assert.deepEqual(page.events, []);
  }
});

test('acceptance persists across visits and withdrawal stops capture without reinitializing', () => {
  const page = browser();
  page.consent.setCookieConsent('granted');
  assert.equal(page.data.get(key), 'granted');
  assert.equal(page.initializations(), 1);
  assert.equal(page.config().disable_session_recording, true);
  assert.equal(page.config().opt_out_persistence_by_default, true);
  page.track('download');
  assert.deepEqual(page.events, ['download']);
  page.consent.setCookieConsent('denied');
  page.track('import');
  assert.equal(page.optedOut(), true);
  assert.equal(page.config().before_send({ event: 'queued', properties: {} }), null);
  assert.deepEqual(page.events, ['download']);
  assert.equal(browser({ stored: page.data.get(key) }).initializations(), 0);
  page.consent.setCookieConsent('granted');
  assert.equal(page.initializations(), 1);
  assert.deepEqual(page.events, ['download', '$pageview']);
  assert.equal(browser({ stored: page.data.get(key) }).initializations(), 1);
});

test('storage changes in another tab and clearing site data revoke consent', () => {
  const page = browser({ stored: 'granted' });
  for (const [name, value] of [[key, 'denied'], [null, null]]) {
    page.consent.setCookieConsent('granted');
    const event = new Event('storage');
    Object.assign(event, { key: name, newValue: value, storageArea: page.window.localStorage });
    page.window.dispatchEvent(event);
    assert.equal(page.consent.getCookieConsent(), value);
    assert.equal(page.optedOut(), true);
  }
});

test('blocked storage remembers the current visit and missing configuration stays inert', () => {
  const page = browser({ blocked: true });
  page.consent.setCookieConsent('denied');
  assert.equal(page.consent.getCookieConsent(), 'denied');
  assert.equal(page.initializations(), 0);
  page.consent.setCookieConsent('granted');
  assert.equal(page.consent.getCookieConsent(), 'granted');
  assert.equal(page.initializations(), 1);
  const unconfigured = browser({ token: '' });
  unconfigured.consent.setCookieConsent('granted');
  unconfigured.track('download');
  assert.equal(unconfigured.initializations(), 0);
});
