# Cyno and Ifa namecard wallpapers

Generated independently per device using the built-in image_gen tool on 2026-10-16. Official exported game-namecard references were downloaded from Enka Network and visually inspected before generation:

- [Cyno: Silence](https://enka.network/ui/UI_NameCardPic_Cyno_P.png): `references/cyno.png`; purple jackal headdress, gold ornamental glyphs, subtle stars. Small Electro emblem added.
- [Ifa: Bro](https://enka.network/ui/UI_NameCardPic_Ifa_P.png): `references/ifa.png`; mint and cream diamonds, pink Cacucu medic motif, scissors and stethoscope. Small Anemo emblem added.

Exact base prompts, generated source paths and output dimensions are recorded in `cyno-ifa-generation.json`. Each prompt also specified the device composition: mobile 1080x2400 extends background vertically and places primary motif lower-right; tablet 1600x2560 independently recomposes the motif at bottom-right; laptop 1920x1080 preserves the broad official namecard composition. These are independent generations, never stretched copies of the phone artwork. The packaging script performs only tiny ratio-compatible Lanczos size normalization.

Final files: `public/wallpapers/scenic/genshin-namecard-cyno/{mobile,tablet,laptop}.png` and `public/wallpapers/scenic/genshin-namecard-ifa/{mobile,tablet,laptop}.png`. All six have been visually inspected. Artwork stays faithful to reference palette and primary motifs with quiet central areas; Cyno glyphs remain decorative artwork inherited from the official card. No app UI, schedule, labels or character portraits were added.

Suggested template palette: Cyno background `#30285c`, ink `#f7ecff`, surface `#211a44cc`; Ifa background `#ace4d5`, ink `#493947`, surface `#fff8e8dd`.
