# Redis usage audit

Reviewed 2026-10-12. Redis is used only for design likes and daily AI import allowances. Pageviews come from PostHog; the catalog and artwork use Cloudinary.

## Changes made

- Set an import counter's midnight expiry only on its first increment. All later imports for that IP/day reuse that expiry. Ten accepted reservations now execute 31 commands instead of 40 (22.5% fewer), including EVAL and its internal commands but excluding allowance checks and any replication costs.
- Share the browser's allowance response for up to 60 seconds across import-panel reopening, route remounts and focus events. Concurrent reads share one request. Successful and failed imports carrying usage update the cache immediately. Unknown outcomes invalidate it; older reads cannot overwrite a newer reservation. The cache expires at the daily reset.
- Every import POST still reserves directly and atomically in Redis. Browser caching only affects the displayed allowance, never enforcement.

## Normal steady-state costs

The table assumes initialized like indexes, one Redis region, and no retries. A browser cache hit means no API request and no Redis commands. Server caches are per instance and can disappear on cold starts.

| Action reaching the server | Redis HTTP requests | Commands executed |
| --- | ---: | ---: |
| Guest gallery read, public count cache warm | 0 | 0 |
| Guest gallery read, public count cache cold | 1 | 1 HGETALL for every design |
| Identified gallery read, public count cache warm | 1 | 1 HGETALL for browser likes |
| Identified gallery read, public count cache cold | 2 | 2 HGETALL |
| Read AI allowance | 1 | 1 GET |
| First accepted import for IP/day | 1 | 4: EVAL, GET, INCR, EXPIREAT |
| Later accepted import for IP/day | 1 | 3: EVAL, GET, INCR |
| Rejected import at daily limit | 1 | 2: EVAL, GET; no write |
| Create voting cookie | 1 | 2, or 3 for first rate-counter increment that minute |
| Like/unlike with an existing cookie | 2 | 8, or 9 for first rate-counter increment that minute |

A vote costs six commands: EVAL, SADD/SREM, HSET/HDEL for browser state, SCARD, and HSET for public counts. Its separate rate check adds EVAL + INCR, plus EXPIRE on the first increment. First-ever voting also needs the cookie creation request. The browser shares this initialization across simultaneous clicks on different hearts.

## Existing savings

- Like counts use a shared hash, rather than one SCARD per design. The server caches it for one minute and merges concurrent reads.
- The browser caches all personalized likes for one minute across focus and gallery remounts. A write updates the cache without another GET. Opposite clicks during cookie setup can cancel without a vote write.
- Guest reads do not query a browser index, set cookies, or write rate counters.
- Count backfill only runs for missing designs. Legacy browser index migration scans designs once; new versioned cookies skip it. Backfill can cause a temporary command spike after catalog changes or first legacy visits.
- Invalid images and missing AI configuration are rejected before reserving an import. Gemini fallback keys do not reserve extra attempts.
- There are no Redis polling intervals or background jobs in the app. Allowance reads happen on import-panel use, focus after cache expiry, and the daily reset.

## Remaining tradeoffs

- Longer public count cache times or a separate CDN-cached public counts response could reduce gallery reads further, at the cost of older counts and additional API work. Personalized liked state must remain privately served; the current combined response uses no-store.
- Combining the vote and rate-check scripts could save one HTTP request and one EVAL per authenticated vote, but requires changing the storage/handler contract while preserving cookie-creation limiting. The two scripts currently keep enforcement and voting explicit.
- Repeated votes remain idempotent, but execute storage commands. Current client requests are ordered per design and only send the latest outstanding choice; there is no automatic vote retry loop.
- Rate-limited heart requests still increment their counter. A bounded per-instance cache of confirmed blocked IPs could avoid repeat Redis calls during floods. Normal traffic would gain little.
- Clearing cookies permits a new voting identity, and vote sets/browser indexes persist. This is intentional casual-voting behavior, but storage grows with unique voters.

## Billing and verification

Upstash counts EVAL and the commands inside a script; batching only reduces HTTP round trips. See [Upstash command-cost examples](https://upstash.com/docs/redis/sdks/ratelimit-ts/costs). Additional regions or plan details can affect the bill. The [Upstash Data Browser itself sends commands](https://upstash.com/docs/redis/troubleshooting/command_count_increases_unexpectedly), which can explain usage while the app is idle.

This audit used source and mocked network tests, without querying the production database or its usage dashboard. Actual monthly savings depend on panel reopen frequency, imports, voters, instance reuse and the database plan. No deployment was performed.
