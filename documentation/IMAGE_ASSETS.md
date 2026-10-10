# Image assets

Keep images grouped by their role. Preserve original generated files and prompt history; do not put new drafts beside active homepage assets.

| Folder | Purpose |
| --- | --- |
| public/brand/ | Logo and favicon |
| public/images/hero/ | Active homepage foreground and ambient background |
| public/images/maker/ | Active footer character |
| public/images/collections/ | Phone collection showcases; tablet/ and laptop/ contain larger-device concepts |
| public/images/how-it-works/ | Workflow illustrations |
| public/images/archive/ | Previous landing, collection, maker and UniToolbox artwork |
| public/wallpapers/ | Original wallpaper backgrounds |
| public/wallpapers/mascots/ | Transparent animal artwork |
| public/wallpapers/little-friends/ | Transparent Little Friends artwork |
| output/imagegen/schedsnap/brand/, hero/, collections/ | Generated originals for active marketing artwork |
| output/imagegen/schedsnap/archive/ | Preserved earlier generated marketing artwork |
| output/imagegen/how-it-works/ | Workflow illustration sources and revisions |
| output/imagegen/wallpaper-samples/ | Initial wallpaper explorations |
| output/imagegen/wallpaper-collection/ | Phone wallpaper sources grouped by design family and layer |
| output/imagegen/tablet-wallpaper-collection/ | Tablet sources grouped by family, orientation and layer |
| .impeccable/review/ | Design review evidence grouped by review |
| documentation/previews/ | Visual review screenshots |
| tests/fixtures/ | Image input for automated tests |

Prompt manifests remain at their existing locations, with image paths updated. Archive folders retain drafts for provenance and comparison. Generated dist/ files and dependency images are build products and are not manually organized.

[Image inventory and SHA-256 hashes](IMAGE_ASSETS.json) includes all 357 project images and the 39 old-to-new paths. The original image assets were preserved; later additions are included in the inventory. Update code, documentation, and prompt manifests together when moving an asset.
