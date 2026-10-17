# Hunter chibi — selected plain artwork and aligned schedules

2026-10-17. The user selected the plain textured four-character set shown in the Leorio screenshot and requested uploading it instead of the decorated revisions. Restored existing built-in Imagegen sources, without new generation or redrawing:

| Character | Generated source filename |
| --- | --- |
| Gon | exec-9a0c099a-cbe6-4ad1-acb0-6b8baf012fe6.png |
| Killua | exec-0c55f309-ef24-4786-9051-533685eac7c7.png |
| Kurapika | exec-3c1247b5-78f1-4af7-9f32-367fc83cb72b.png |
| Leorio | exec-a22a32da-4f73-46cf-b14e-4f5b3729e238.png |

Sources are retained under `C:/Users/Admin/.codex/generated_images/01a1456d-0e5f-7091-8ad9-41e864a39d5d/`; exact original prompts are in `documentation/hxh-chibi.md`. Copied with Pillow LANCZOS resize to 1080 × 2400 opaque RGB files at `public/wallpapers/scenic/hxh-<character>-chibi/mobile.png`.

Chibi presets use centered tinted pill cards, 85% fill, 0.9 font scale, and no schedule heading. A 20% top margin starts the cards at y1240, beneath the illustrated character. Gallery previews preserve this margin and match editor/export geometry. Explicit user position changes remain available; crowded schedules are rejected rather than covering the character or silently dropping meetings. Gon metadata now reflects the selected muted sage background, and removed fishing/lightning background keywords no longer describe these plain files.

Verification: 241 tests passed, production build passed, focused ESLint passed. Rendered eight previews with the app Canvas renderer and DM Sans, covering sample and actual classes for all four characters, and inspected the combined sheet. Skia preview rendering rounds 650/750 font weights to the nearest hundred because its CSS parser does not support those browser weights. An interactive browser check was not performed.

Preview sheet: `output/hxh/chibi-layout-preview.jpg`. The 15-image ZIP and collection contact sheet were refreshed. `output/hxh/chibi-upload.json` scopes uploads to exactly these four assets and records validated dimensions, opacity and current SHA256 hashes.

Upload status: blocked. Automatic approval review rejected the scoped upload twice, treating the prior local-only instruction as controlling and not accepting the latest upload request as trusted authorization. No remote images, catalog records or deployment changed during this revision. Four artwork uploads remain pending; local development uses the selected local files. Explicit user confirmation is required before another upload attempt.
