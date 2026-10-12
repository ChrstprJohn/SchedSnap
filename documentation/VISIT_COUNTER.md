# PostHog homepage pageviews

“Total pageviews” reads all-time recorded production pageview events from PostHog project **643035**. There is no mock count, Redis increment, browser storage flag, or separate source of visits.

## Setup

Set these server-only variables in Vercel project settings (Production, and Preview if needed) and in `.env.local` for local API checks:

```env
POSTHOG_PROJECT_ID=643035
POSTHOG_PERSONAL_API_KEY=your_personal_api_key
POSTHOG_API_HOST=https://us.posthog.com
```

Use `https://eu.posthog.com` for EU projects. Without an explicit API host, the server chooses EU when the existing ingestion host is `eu.i.posthog.com`, otherwise US. Self-hosted projects may supply their HTTPS application origin.

Create the personal API key in PostHog account settings with `query:read` access restricted to this project. Keep it server-side; do not put it in any `VITE_` variable. The public `VITE_POSTHOG_TOKEN` captures events and cannot read analytics. The dashboard embed link also does not provide credentials for this query.

Restart local development after changing environment variables, and redeploy after changing Vercel variables. The configured personal key was verified with a live aggregate query; local environment files remain untracked.

## Definition and data flow

`GET /api/visits` runs a fixed HogQL query: count all `$pageview` events with `site_name = schedsnap` and `environment = production`. It covers all retained history in the project, not only homepage visits, and matches an all-time pageview count using those filters. Repeated pageviews within one session each count. Session IDs are not required. This is not a session or unique-person count. Events without the required site/environment tags are excluded. The dashboard shown during setup uses the last 30 days and daily intervals, while the homepage shows the sum of all retained history. Tracking blockers, opt-out, retention, ingestion delays, and the selected dashboard date range can explain differences from other totals.

The server returns only `{ visits: number }`. Credentials, query details, and provider errors stay server-side. Calls are read-only: the browser never increments a counter. Successful results are cached in the function and at Vercel's CDN for five minutes, with stale-while-revalidate allowed for another five minutes. Simultaneous calls in one function share a query. Failures back off for 30 seconds and are not cached at the CDN.

The homepage shows `—` while loading or unavailable and actual zero only after a successful zero result. Loaded counts retain compact formatting and the existing scroll-triggered count animation. Reduced-motion users see the final value immediately; assistive technology receives the exact recorded-pageview count. The browser shares requests across StrictMode mounts and homepage navigation and refreshes an expired snapshot on a later mount. The counter is not a live subscription.

## Verification

`tests/visits.test.js` checks method restrictions, fixed site/environment/pageview filtering, credential secrecy, US/EU routing, real zero, malformed payloads, concurrent request sharing, caching, failure backoff, and browser retries. Tests use mocked PostHog responses; a live check requires the configured personal API key.

References: [PostHog API and authentication](https://posthog.com/docs/api), [SQL query endpoint](https://posthog.com/docs/data-warehouse/query), [session definitions](https://posthog.com/docs/data/sessions).
