# Iansan: Unyielding

Provider: built-in imagegen. Reference: https://enka.network/ui/UI_NameCardPic_Iansan_P.png (official game asset mirrored by Enka), downloaded to `references/iansan.png` and visually inspected before generation.

Three independent reference edits preserve the official orange/gold dotted field, angular Natlan zigzags, purple accents, cream-haired chibi head, skull headpiece, weight and sweeping footer. Each adds a small purple Electro Vision and leaves the center quiet. All prompts require opaque full bleed artwork without text, timetable, UI, frame or watermark.

| Device | Requested composition | Native generated file | Final asset |
| --- | --- | --- | --- |
| Mobile | 9:20, 1080×2400; head/weight at bottom right, restrained upper corner zigzags, Vision bottom left | `exec-9f2c9d55-af19-41d0-9a39-bce63a72c29e.png` | `public/wallpapers/scenic/genshin-namecard-iansan/mobile.png` |
| Tablet | 5:8, 1600×2560; head/weight in bottom quarter, expansive quiet orange middle, Vision bottom left | `exec-bfa7abb7-e986-4206-9fb8-28fa091f0a01.png` | `public/wallpapers/scenic/genshin-namecard-iansan/tablet.png` |
| Laptop | 16:9, 1920×1080; head/weight at right edge, subdued left/middle, Vision lower left | `exec-260ed20f-40ac-4f9e-94bf-ce4c12ead550.png` | `public/wallpapers/scenic/genshin-namecard-iansan/laptop.png` |

Native sources remain in `C:/Users/QCU/.codex/generated_images/01a14230-b9ed-7ff3-a344-48b02167ac5c/`. The existing `scripts/package-sanrio-image.py` normalized each independently generated composition to its required pixel dimensions without cropping. The generated adaptations are not pixel-identical official namecards.
