import posthog from 'posthog-js';

const token = import.meta.env?.VITE_POSTHOG_TOKEN;
export const analyticsEnabled = Boolean(token);
const siteProperties = { site_name: 'schedsnap', environment: import.meta.env?.MODE || 'development' };

if (token) {
  try {
    posthog.init(token, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: 'history_change',
      person_profiles: 'identified_only',
      disable_session_recording: true,
      // Autocapture must not collect class names, rooms, titles, or image attributes.
      mask_all_text: true,
      mask_all_element_attributes: true,
      loaded: (client) => client.register(siteProperties),
      before_send: (event) => {
        if (event) event.properties = { ...event.properties, ...siteProperties };
        return event;
      },
    });
  } catch { /* Analytics availability must not interrupt the wallpaper creator. */ }
}

export function trackEvent(event, properties = {}) {
  if (!analyticsEnabled) return;
  try {
    if (!posthog.has_opted_out_capturing()) posthog.capture(event, { ...properties, ...siteProperties });
  } catch { /* Tracking is best effort, including in restricted browsers. */ }
}

export function templateProperties(template) {
  return { template_id: template.id, collection: template.collection || 'original' };
}
