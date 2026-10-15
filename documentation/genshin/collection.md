# Genshin wallpaper collections

## Chibi characters

Seventeen completed designs have three device backgrounds apiece (51 unique opaque PNGs): the restored Raiden, Furina, and Nahida designs; completed Hu Tao; and Columbina, Zhongli, Neuvillette, Arlecchino, and Flins.

| Device | Dimensions |
| --- | --- |
| Mobile | 1080 × 2400 |
| Tablet portrait | 1600 × 2560 |
| Laptop | 1920 × 1080 |

All files live under `public/wallpapers/scenic/genshin-*/`. Prompts and references are recorded in `documentation/genshin/*-prompts.json`. Canvas draws the Class Schedule title and editable schedule cards. Genshin designs now use the standard wallpaper layout and schedule sizing; cards may cover background decoration as requested. The mobile schedule starts below the heading, and tablets use the normal available schedule area.

The earlier 27 Raiden/Furina/Nahida images were restored from their saved artwork. Nine Hu Tao variants were completed to replace the broken unfinished template. All 51 assets passed native Canvas layout and image checks and have Cloudinary delivery records in `src/assets/cloudinaryManifest.js`.

## Character-free namecards and sky

Four namecards and one sky background each have mobile, tablet, and laptop layouts, for 15 opaque PNGs. The namecards are Kazuha (Anemo), Mavuika (Pyro), Arlecchino (Pyro), and Raiden (Electro). No character art or text is included. Columbina's generated namecard was excluded as requested.

| Device | Dimensions |
| --- | --- |
| Mobile | 1080 × 2400 |
| Tablet portrait | 1600 × 2560 |
| Laptop | 1920 × 1080 |

Files are under `public/wallpapers/scenic/genshin-card-*/` and `genshin-sky-welkin/`. Exact prompts, reference images, and source hashes are documented in `documentation/genshin-backgrounds/*-prompts.json`. They appear alongside the chibi designs in the main “Genshin” gallery filter and use the same editable schedule and clock rendering. All five have been added to and verified in the hosted template catalog.

The local Canvas previews are `output/genshin-backgrounds/{mobile,tablet,laptop}-preview.jpg`; their source and dense-schedule renders are in `output/genshin-backgrounds/qa/`. All 15 images are uploaded to Cloudinary. Delivery URLs return PNGs with Canvas CORS enabled, and all 446 earlier Cloudinary records are preserved.

No frontend deployment was performed.

The renderer no longer applies the obsolete protected artwork footer setting, including when that setting is present in a saved catalog record. Genshin previews use the same schedule geometry as other illustrated wallpapers. This renderer change is local and has not been deployed.

## Gallery removals

Removed from the selectable gallery: Hu Tao Ghost Friend and Plum Blossom; Nahida Clover Wish; Raiden Tea Break and Violet Bloom; Furina Bubble Day and Ribbon Bow. Ten chibi designs remain (30 device images), alongside five namecard/sky designs (15 device images). Original artwork and prompt records are retained.
