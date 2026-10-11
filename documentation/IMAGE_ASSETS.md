# Asset folders

Only active app images and their source originals remain in the asset folders.

| Folder | Contents |
| --- | --- |
| `public/brand/` | Logo and favicon |
| `public/images/hero/` | Homepage background and phone illustration |
| `public/images/collections/{mobile,tablet,laptop}/` | Four collection showcases for each device |
| `public/images/how-it-works/` | Three workflow illustrations |
| `public/images/maker/` | Footer character |
| `public/wallpapers/scenic/<variant-id>/` | Complete mobile, tablet and laptop backgrounds |
| `public/wallpapers/{mascots,little-friends}/` | Shared transparent character cutouts |
| `output/imagegen/marketing/landing/` | Source originals and prompt records for the active landing artwork |
| `output/imagegen/marketing/how-it-works/` | Two active generated workflow originals and their prompt manifest |
| `documentation/previews/`, `.impeccable/review/` | Review screenshots; not product assets |
| `tests/fixtures/` | Test input; not product assets |

There are 224 runtime image files and 17 retained marketing source images. All
runtime files are referenced by the application. Shared transparent cutouts adapt
to each device canvas and do not require duplicate bitmap files.

[Current inventory with SHA-256 hashes](CURRENT_ASSET_INVENTORY.json) lists the
241 retained image files. [Collection prompt provenance](COLLECTION_ASSET_PROVENANCE.json)
keeps generation metadata outside the deployed public folder.

Unused landing archives, generated drafts, sample wallpapers, device examples,
old screenshots, helper scripts and obsolete ZIPs were removed. The deletion
inventories are ASSET_FOLDER_CLEANUP.json and OUTPUT_ASSET_CLEANUP.json. Earlier
IMAGE_ASSETS.json and historical prompt paths describe past states, not usable assets.

Use SCENIC_TEMPLATES.md and src/assets/scenicTemplates.js for the approved wallpaper
catalog. Dependencies and build output are managed by their tools, not asset cleanup.
