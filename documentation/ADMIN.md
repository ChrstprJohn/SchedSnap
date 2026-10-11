# Design administration

Open `/admin` directly. There is no landing-page or navigation link. All management
endpoints enforce authentication; knowing the URL grants no access.

## Local setup

1. Add `ADMIN_PASSWORD="your strong password"` to the ignored `.env.local` file.
   Use at least 16 characters. No setup command is required.
2. Ensure the three `CLOUDINARY_` values are also present in `.env.local`.
3. Run `npm run dev` and open `http://localhost:5173/admin` (use Vite's actual port).

`ADMIN_PASSWORD` stays on the server and takes precedence over `ADMIN_PASSWORD_HASH`.
The plaintext password is stored in the environment file/settings, never the browser
bundle or catalog. An optional `ADMIN_SESSION_SECRET` of at least 32 characters can
sign sessions independently; otherwise a signing key is derived from the password.
To use the alternative hashed configuration, remove `ADMIN_PASSWORD` and run
`npm run admin:setup`, which writes `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`.

## Vercel setup

Copy these server-only values from `.env.local` into the project's environment
settings: `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Never prefix them with `VITE_`.

In the Vercel Firewall, create a rate-limit rule for POST requests whose path equals
`/api/admin` and query string contains `action=login`: 5 requests per IP per 15 minutes,
with a 429 response. If the dashboard cannot filter query strings, rate-limit all
POST requests to `/api/admin` with a limit appropriate for your editing workflow.
Verify the rule is active, then set `ADMIN_LOGIN_RATE_LIMIT_CONFIGURED=true` and
redeploy. Production login stays disabled without this explicit configuration.
The local in-process throttle is additional protection, not a shared serverless limiter.

Official references:
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Cloudinary signed uploads](https://cloudinary.com/documentation/client_side_uploading)
- [Cloudinary signed delivery](https://cloudinary.com/documentation/delivery_url_signatures)

## Storage and publishing

The catalog is one authenticated raw JSON asset in Cloudinary:
`schedsnap/admin/catalog.json`. It contains design settings and status, never admin
credentials or student data. Only the server creates its signed delivery URL. The
public catalog API returns published designs only. Initial state comes from the
existing code presets; the first save persists the full catalog. The initialization
script `node scripts/initialize-admin-catalog.mjs` can seed and verify it beforehand.

Publishing a background requires distinct mobile, tablet, and laptop variants.
Partial uploads can be saved as a draft. Published mascots require a transparent
cutout. Direct signed browser uploads avoid serverless body-size limits.
Preview uses the production Canvas renderer, including the busy-week option.
Artwork uploads immediately; Save draft stores settings; Publish makes the design
available. Public clients refresh the catalog every minute while visible. Public
reads use signed Cloudinary delivery rather than its rate-limited Admin API; admin
edits resolve the current version explicitly. Allow a few minutes for Cloudinary
CDN invalidation and the public refresh to propagate a change.

The library offers Edit, Hide/Publish, and Delete. IDs are generated from the title
for new designs, with numeric suffixes for duplicate titles. Existing IDs stay stable
when a title changes so previously shared links continue working. Hide only updates
visibility; incomplete drafts open the editor when Publish is selected.

Delete opens a permanent-deletion warning and requires typing the exact title.
The server verifies that confirmation, hides the design, and deletes its unused
Cloudinary artwork with CDN invalidation before removing the catalog entry.
Artwork referenced by another design is preserved. A failed deletion leaves the
design hidden with a retry action; retries safely accept already-deleted assets.
Unmapped local artwork must be mapped/uploaded before permanent deletion.
Deleting through the deployed admin does not edit the repository's local source
files. Discarded or replaced uploads can still be removed in Cloudinary after
checking they are unused.

Use one editing tab at a time. Revision checks reject stale edits, and writes within
one server instance are serialized. Cloudinary does not provide atomic compare-and-
swap for this JSON file: simultaneous saves across instances can still conflict.
This setup is intended for one administrator, not concurrent editorial teams.

Sessions expire after eight hours. Cookies are HttpOnly and SameSite=Strict, plus
Secure on deployment. Write requests require a matching Origin. Logout clears the
browser cookie; changing the password, password hash, or session secret invalidates
all issued sessions. Update the environment and restart locally or redeploy on
Vercel to rotate credentials. There is no account-registration or password-recovery service.
