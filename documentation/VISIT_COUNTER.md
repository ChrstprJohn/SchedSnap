# Homepage visit counter

The homepage currently shows the requested mock visits as **12K+**, labeled **Total visits** without a visible sample marker. The three statistics count up on mount over 1.2 seconds, with immediate final values for reduced motion and stable full-number text for screen readers. Templates and collections still derive from actual definitions and display **62+** and **4+**. `LandingStats.jsx` does not call the visit API in this presentation. The server counter and browser loader remain available for a future live integration; the setup and counting rules below describe that preserved implementation.

## Setup

Use an existing Upstash Redis database and set these **server-only** environment variables in `.env.local` for development or the hosting environment for deployment:

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-write-capable-token
```

Restart the foreground dev server after changing environment variables. Never prefix credentials with `VITE_`. A write-capable token is required for increments. Use separate development and production databases to keep testing out of the public total. No account, database or credentials were created by this implementation; connecting storage remains pending.

`api/visits.js` uses the documented [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi), sending `INCR` or `GET` for the fixed `schedsnap:visits` key. Atomic increments persist across server restarts and function instances. No new npm dependency is required. The Vite adapter exposes the same endpoint locally, and Vercel serves the root API function on deployment.

## Counting rules

- When live counting is connected through `loadVisitCount`, the first homepage visit in a browser tab session sends `POST /api/visits`, incrementing the shared total once.
- A sessionStorage flag is written only after a successful response. Refreshing the same tab reads the latest count through `GET /api/visits` without incrementing.
- A shared in-flight request avoids extra increments from React StrictMode and navigation back to home. The displayed total is a snapshot, not a live subscription.
- If sessionStorage is disabled, refreshes can count as new visits. New tabs can also count separately. This is a session visit total, not a count of unique people, and does not identify or filter bots.
- Missing credentials, storage outages, invalid responses or timeouts cause the browser loader to return `null`; a live UI must handle the unavailable state. This does not affect the current mock display. A configured empty counter reads as zero; the first increment starts at one.

Only one aggregate integer is persisted. The counter stores no names, IP addresses, images, classes, schedule data or visitor identifiers. The browser stores only a session flag. Storage credentials and provider errors never enter responses or the frontend bundle. Counting begins when storage is connected; earlier visits cannot be reconstructed.

## Checks

`tests/visits.test.js` covers supported methods, missing configuration, increment/read semantics, empty storage, provider failures, malformed totals, credential secrecy, StrictMode request sharing and refresh deduplication. Live storage verification is pending credentials; tests use mocked provider responses.
