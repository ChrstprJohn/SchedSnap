# SchedSnap PostHog Analytics

This folder documents SchedSnap's analytics independently: how it is configured, how the code sends events, which data is captured, and how to build the dashboard. All source references are inside this repository.

| Guide | Contents |
| --- | --- |
| [Implementation and events](IMPLEMENTATION.md) | SDK initialization, source map, data flow, privacy controls, and event definitions |
| [Dashboard setup and prompt](DASHBOARD.md) | Production filters, metrics, funnels, and a ready-to-paste PostHog AI prompt |

## What Is Implemented

SchedSnap uses `posthog-js` in the browser for pageviews, SPA navigation, clicks, and custom wallpaper workflow events. Each event is tagged `site_name: schedsnap` and `environment`. The normal Vite production build uses `production`; the local dev server uses `development`.

Tracking covers design selection, manual/sample/image input, image preparation, AI import outcomes, preview, appearance changes, and download initiation. Session recording is disabled. DOM text and attributes are masked, and custom events omit schedule contents and images. Location analytics use approximate IP-based GeoIP; this app does not request browser location permission.

## Local Setup

The dependency is recorded in [package.json](../../package.json). Install the project's dependencies with plain `npm install` when needed, then set the following public variables in `.env.local`:

```dotenv
VITE_POSTHOG_TOKEN=your_public_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

The template is in [.env.example](../../.env.example). Use the public project token and ingestion host from the PostHog project's setup screen. For an EU project, the ingestion host is `https://eu.i.posthog.com`. Never put personal or secret API keys in `VITE_` variables, because Vite exposes them to the browser.

Run `npm run dev` in the foreground, and restart it after changing environment variables. Stop the server when finished. Without a token, analytics is disabled and the app still works. The token is checked independently of Vite mode, so configured local visits send events too.

## Deployment Setup

Set `VITE_POSTHOG_TOKEN` and `VITE_POSTHOG_HOST` in this app's hosting environment and rebuild/redeploy. Vite embeds these values at build time. Configuring the variables locally does not configure a deployed build.

In PostHog, enable autocapture and GeoIP enrichment if you want click and approximate geographic analytics. Settings or transformations that discard IP/location data can prevent geographic enrichment. Session recording remains disabled by the application configuration.

The analytics integration works with its own PostHog project. It can also share a project with other websites: filter by `site_name = schedsnap`. It does not import code, read settings, or depend on another repository at runtime.

## Verify Delivery

1. Open the configured application and choose a design.
2. Load sample data, enter classes, or import an image.
3. Preview and download the wallpaper.
4. Open PostHog's live events and filter `site_name = schedsnap`.
5. Confirm `$pageview`, `template_selected`, `schedule_previewed`, and `wallpaper_download_started`. Check `environment = production` on the deployed app.

Ad blockers, capture opt-out, network problems, and an incorrect token/host can prevent delivery. If local data works but deployed data does not, verify the hosting variables and rebuild. Browser-generated `duration_ms` values are milliseconds. A download event confirms initiation, not that the image was saved or installed as wallpaper.

## Separate Homepage Counter

The optional homepage Redis visit counter uses its own API, storage, and counting rules. It is separate from PostHog and may report different totals. See [visit counter documentation](../VISIT_COUNTER.md).

## References

- [PostHog JavaScript configuration](https://posthog.com/docs/libraries/js/config)
- [PostHog GeoIP properties](https://posthog.com/docs/libraries/go#overriding-geoip-properties)
