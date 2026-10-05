# SchedSnap PostHog Dashboard

Paste this into PostHog AI, or use it as a checklist for manual dashboard creation:

```text
Create a dashboard named "SchedSnap - Traffic and Wallpaper Conversion".
Use the PostHog project configured for SchedSnap.
Apply event-property filters site_name = schedsnap and environment = production
to every insight and every funnel step. Use the last 30 days, daily intervals,
and compare with the previous 30 days where supported.

Create these insights:
1. Traffic: total $pageview events, unique visitors by distinct_id, and sessions
   by distinct $session_id. Include a daily visitors trend and top $pathname.
2. Acquisition: unique $pageview visitors by $referring_domain and utm_source,
   with utm_medium and utm_campaign available as additional breakdowns.
3. Audience: unique $pageview visitors by $device_type, $browser and $os.
4. Approximate geography: unique $pageview visitors by $geoip_country_name,
   $geoip_subdivision_1_name and $geoip_city_name. Use event properties;
   keep unknown locations visible and label city data as approximate GeoIP.
5. Landing conversion: ordered funnel $pageview with $pathname = /
   -> wallpaper_creation_started -> template_selected -> schedule_previewed
   -> wallpaper_download_started. Use unique visitors and a one-day window.
6. Creator conversion: ordered funnel wallpaper_step_viewed with step = design
   -> template_selected -> schedule_previewed -> wallpaper_download_started.
   Use unique visitors, a one-day window, drop-off counts and conversion time.
   Add a $device_type breakdown. This funnel includes direct gallery visitors.
7. Real-schedule conversion: duplicate the creator funnel, filtering preview
   and download steps to schedule_source in [manual, image] and class_count > 0.
   Keep sample usage separate from this insight.
8. Design popularity: template_selected and wallpaper_download_started counts
   broken down by collection and template_id. Include unique downloaders.
9. Input methods: manual_schedule_started, sample_schedule_loaded,
   schedule_import_succeeded counts, plus wallpaper_download_started broken
   down by schedule_source. These counts describe usage and can overlap.
10. Import health: schedule_import_started, schedule_import_succeeded,
    schedule_import_failed and schedule_import_cancelled counts. Show success
    percentage = 100 * succeeded / started, with a zero-denominator guard;
    include average successful duration_ms and failures by http_status/error_type.
11. Downloads: wallpaper_download_started total, unique downloaders, daily
    trend, download_method breakdown, wallpaper_download_failed by stage,
    and wallpaper_download_repeated separately. Label started as download
    initiation, not confirmed saving or wallpaper installation.
12. Customization: wallpaper_appearance_changed by setting and collection,
    plus wallpaper_appearance_reset and wallpaper_preview_enlarged counts.

Use event properties rather than person-profile properties because visitors
are anonymous. Exclude other site_name values and development events.
Do not enable session recording or request precise location. If an event or
property is not yet available, list the missing items for a real-site test;
do not invent data or substitute unrelated events.
```

SDK configuration reference: https://posthog.com/docs/libraries/js/config

GeoIP properties reference: https://posthog.com/docs/libraries/go#overriding-geoip-properties
