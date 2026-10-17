# Template keyword and device-download audit

Verified on 2026-10-17.

## Keyword coverage

- 235 built-in templates and 209 live catalog records were audited.
- Together these contain 246 unique designs, including live-only, hidden, and draft records.
- Every record has keywords; no design was omitted.
- Existing author tags are preserved and deduplicated. Each keyword field stays within the editor's 500-character limit.
- Palette, collection, character, motif, and style tags come from existing metadata. Explicit artwork color tags take precedence over the fallback canvas background.
- The live catalog backfill was saved and read back. A repeat dry run reports zero updates.
- Only keyword fields were changed in the stored catalog. Artwork, visibility, IDs, ordering, dates, and other settings remain intact.

`shared/templateKeywords.js` is used for built-in templates, public catalog responses, and admin saves.

To audit a configured catalog without changing it:

```powershell
node scripts/backfill-template-keywords.mjs
```

To backfill missing metadata, preserving a local backup and checking the catalog revision:

```powershell
node scripts/backfill-template-keywords.mjs --write
```

## Download counts

New download events require a design ID and device: `mobile`, `tablet`, or `laptop`.
Redis hash fields use `<design-id>:<device>`. A mobile download never increments the tablet or laptop field.

Public cards, wallpaper details, and download sorting show a design's total downloads (all devices plus unassigned older counts). Admin cards and sorting use the same total; the library adds a device breakdown.
Existing design-only fields remain untouched and appear separately as older downloads with no device recorded. They are not copied into any device bucket, but they still count toward each design's total.

The existing Redis ACL-compatible atomic increment and request rate limit remain in use.
The local API was verified against the existing storage: all three device reads and authenticated admin summaries succeeded; 29 older downloads were retained without a device assignment.

## Validation

- 51 targeted keyword, catalog, admin, search, and download tests pass.
- Lint for changed JavaScript and the production build pass.
- Tablet footer stacking was checked at 800px width.
- The full suite has 245 passing tests and six existing failures: five renderer placement checks reproduce on the committed baseline; the Hunter fixture PNG is absent from the repository. Those unrelated renderer/fixture issues were not changed by this work.
