# Domo and Adventure Time references

This branch adds two Domo designs (Domo Desk Peek and Domo Taped Glasses) and five Adventure Time designs (Jake Face, Finn Smile, Marceline Midnight, Flame Princess, and BMO Playtime).

Each design has independently composed mobile 1080 x 2400, tablet 1600 x 2560, and laptop 1920 x 1080 backgrounds. Canvas draws all schedule text separately and reserves a footer for the character illustrations. The new Adventure Time category is available in the shared category configuration and template schema.

Artwork provenance and exact prompts are recorded in `domo-adventure-prompts.json`. Cloudinary images are immutable supporting assets; uploading them does not publish selectable catalog records. The shared live catalog is intentionally left unchanged for the requested branch-only delivery.

After the branch is merged and the frontend is deployed, catalog release can be reviewed with:

```powershell
node scripts/publish-character-references.mjs
```

Publish only after reviewing the reported additions and revision:

```powershell
node scripts/publish-character-references.mjs --publish --expect-revision <reviewed-revision>
```

The focused publisher adds only missing IDs from these seven reference designs, preserves existing records and dates, validates all uploaded image mappings, checks the current revision, and verifies the saved catalog.
