import { getCookieConsent, subscribeCookieConsent } from './cookieConsent.js';

const token = import.meta.env?.VITE_POSTHOG_TOKEN;
export const analyticsEnabled = Boolean(token);
const siteProperties = { site_name: 'schedsnap', environment: import.meta.env?.MODE || 'development' };
let initialized = false;
let posthog;
let loading;

async function applyCookieConsent() {
  if (!token) return;
  try {
    if (getCookieConsent() !== 'granted') {
      if (initialized) posthog.opt_out_capturing();
      return;
    }
    if (!posthog) {
      loading ??= import('posthog-js').then(module => module.default);
      posthog = await loading;
      // Consent can be withdrawn while the optional SDK is downloading.
      if (getCookieConsent() !== 'granted') return;
    }
    if (initialized) {
      if (posthog.has_opted_out_capturing()) {
        posthog.opt_in_capturing({ captureEventName: false });
        posthog.register(siteProperties);
        posthog.capture('$pageview');
      }
      return;
    }
    posthog.init(token, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: 'history_change',
      person_profiles: 'identified_only',
      disable_session_recording: true,
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      // Autocapture must not collect class names, rooms, titles, or image attributes.
      mask_all_text: true,
      mask_all_element_attributes: true,
      loaded: (client) => {
        if (getCookieConsent() !== 'granted') return;
        client.opt_in_capturing({ captureEventName: false });
        client.register(siteProperties);
      },
      before_send: (event) => {
        if (getCookieConsent() !== 'granted') return null;
        if (event) event.properties = { ...event.properties, ...siteProperties };
        return event;
      },
    });
    initialized = true;
  } catch { loading = undefined; /* A later consent change can retry a failed SDK load. */ }
}

if (typeof window !== 'undefined') {
  applyCookieConsent();
  subscribeCookieConsent(applyCookieConsent);
}

export function trackEvent(event, properties = {}) {
  if (!analyticsEnabled || !initialized || getCookieConsent() !== 'granted') return;
  try {
    if (!posthog.has_opted_out_capturing()) posthog.capture(event, { ...properties, ...siteProperties });
  } catch { /* Tracking is best effort, including in restricted browsers. */ }
}

export function templateProperties(template) {
  return { template_id: template.id, collection: template.collection || 'original' };
}
