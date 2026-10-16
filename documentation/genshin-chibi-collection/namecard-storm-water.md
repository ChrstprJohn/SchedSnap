# Namecard ornament revision: Raiden and Furina

Provider: built-in image_gen, six independent edits referencing each existing wallpaper and its namecard reference. Raiden screenshot used only for illustrated namecard ornament; UI/text ignored. Existing originals backed up under output/genshin-simple/pre-namecard/. User-approved Pillow ImageOps.fit LANCZOS normalization to exact RGB dimensions. Contrast percentages are prompt targets, not measured guarantees.

`json
[
  {
    "character": "raiden",
    "device": "mobile",
    "source": "output\\genshin-simple\\namecard-sources\\raiden-mobile.png",
    "sourceDimensions": [
      841,
      1870
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-raiden\\mobile.png",
    "dimensions": [
      1080,
      2400
    ],
    "opaque": true,
    "sha256": "7f1b86be2c648a23a210f83c7f5fbb238db495f9c1e0546decb5accd81c05f01",
    "prompt": "Edit image 1 wallpaper ONLY by adding faint namecard ornament from image 2. Image 2 is screenshot reference: use ONLY upper rectangular illustrated NAMECARD artwork, absolutely ignore all UI and text. Preserve image1 chibi exactly unchanged, same position,size,pose,face,costume; preserve muted violet palette and existing oversized Electro emblem. Add restrained recognizable Raiden Enlightenment namecard motifs: curved almond-shaped storm-eye contour, flowing pointed ribbon/wave shapes and a few five-petal sakura corner ornaments. Translate all motifs into muted violet tone-on-tone at 6\u00e2\u20ac\u201c10% contrast, only top and outer edges. Lower 55% schedule zone must remain quiet max4% contrast. Mobile 1080x2400. No text,UI,frames,scene,extra characters,texture,glow or overdesign. Full bleed opaque."
  },
  {
    "character": "raiden",
    "device": "tablet",
    "source": "output\\genshin-simple\\namecard-sources\\raiden-tablet.png",
    "sourceDimensions": [
      992,
      1586
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-raiden\\tablet.png",
    "dimensions": [
      1600,
      2560
    ],
    "opaque": true,
    "sha256": "94995437664a3f13f772c7194cc4c5af8edda19e0ece4fa5b9662fcdb9bdca8b",
    "prompt": "Edit image1 wallpaper adding only subtle namecard motifs from image2. Image2 is screenshot; use only illustrated namecard upper rectangle, NEVER text or UI. Keep image1 exact chibi, size, position, face, costume and pose unchanged. Keep violet palette and existing huge Electro emblem unchanged. Add Raiden Enlightenment motifs: graceful storm-eye almond outline and pointed flowing ribbons along upper and side edges, a few small sakura five-petal flowers upper corners. All tone-on-tone violet 6\u00e2\u20ac\u201c10% contrast, faint decorative backdrop. Keep lower55% quiet max4% contrast. Tablet portrait1600x2560 opaque. No words, UI, schedule, frame, scene, extra figures, textures or glows; preserve simple flat style."
  },
  {
    "character": "raiden",
    "device": "laptop",
    "source": "output\\genshin-simple\\namecard-sources\\raiden-laptop.png",
    "sourceDimensions": [
      1672,
      941
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-raiden\\laptop.png",
    "dimensions": [
      1920,
      1080
    ],
    "opaque": true,
    "sha256": "a856f175245ee88bc531ad472fedf8099996c54ba105fd0f865b1cdb463c16e9",
    "prompt": "Edit image1 landscape wallpaper adding only subtle namecard motifs from image2. Image2 is screenshot; use only illustrated namecard upper rectangle, NEVER text or UI. Keep image1 exact chibi, size, position, face, costume and pose unchanged. Keep violet palette and existing huge Electro emblem unchanged. Add Raiden Enlightenment motifs: graceful storm-eye almond outline and pointed flowing ribbons along upper and side edges, a few small sakura five-petal flowers upper corners. All tone-on-tone violet 6\u00e2\u20ac\u201c10% contrast, faint decorative backdrop. Keep lower central55% quiet max4% contrast. Laptop landscape1920x1080 opaque. No words, UI, schedule, frame, scene, extra figures, textures or glows; preserve simple flat style."
  },
  {
    "character": "furina",
    "device": "mobile",
    "source": "output\\genshin-simple\\namecard-sources\\furina-mobile.png",
    "sourceDimensions": [
      842,
      1869
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-furina\\mobile.png",
    "dimensions": [
      1080,
      2400
    ],
    "opaque": true,
    "sha256": "2570d77b985b0b23686c0b65267617f1c83429303b67433f0389b30fdb08c21a",
    "prompt": "Edit image1 wallpaper ONLY to add faint namecard motifs from image2. Preserve image1 EXACT Furina chibi, face, costume,pose,size and position unchanged. Preserve dusty blue palette and existing oversized Hydro emblem. From actual Furina namecard image2 integrate a few recognizable dessert silhouettes in round bubbles (tiny cake slice and pudding), graceful theatrical ribbon curves and a small waterdrop/bow filigree. Restrained sparse ornament at upper corners and outer edges, ALL muted blue tone-on-tone at6\u00e2\u20ac\u201c10% contrast, no saturated colors. Lower55% schedule zone stays quiet max4% contrast. Mobile1080x2400 opaque. No extra characters, text,UI,timetable,frames,scenery,texture,glow; simple flat sticker style unchanged."
  },
  {
    "character": "furina",
    "device": "tablet",
    "source": "output\\genshin-simple\\namecard-sources\\furina-tablet.png",
    "sourceDimensions": [
      992,
      1586
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-furina\\tablet.png",
    "dimensions": [
      1600,
      2560
    ],
    "opaque": true,
    "sha256": "5133406bd36334a6e4c9f810fb476eb956291657061b757b769645b0edf9d17a",
    "prompt": "Edit image1 wallpaper ONLY to add faint namecard motifs from image2. Preserve image1 EXACT Furina chibi,face,costume,pose,size and position unchanged. Preserve dusty blue palette and existing oversized Hydro emblem. From actual Furina namecard image2 integrate a few recognizable dessert silhouettes in round bubbles (tiny cake slice and pudding), graceful theatrical ribbon curves and a small waterdrop/bow filigree. Restrained sparse ornament at upper corners and outer edges, ALL muted blue tone-on-tone at6\u00e2\u20ac\u201c10% contrast, no saturated colors. Lower55% schedule zone stays quiet max4% contrast. Tablet portrait1600x2560 opaque. No extra characters,text,UI,timetable,frames,scenery,texture,glow; simple flat sticker style unchanged."
  },
  {
    "character": "furina",
    "device": "laptop",
    "source": "output\\genshin-simple\\namecard-sources\\furina-laptop.png",
    "sourceDimensions": [
      1672,
      941
    ],
    "path": "public\\wallpapers\\scenic\\genshin-chibi-furina\\laptop.png",
    "dimensions": [
      1920,
      1080
    ],
    "opaque": true,
    "sha256": "afaa775a46f31c18ac4d00a88f252ea7f72b4e32c6a5627000110e088f08c306",
    "prompt": "Edit image1 landscape wallpaper ONLY to add faint namecard motifs from image2. Preserve image1 EXACT Furina chibi,face,costume,pose,size and position unchanged. Preserve dusty blue palette and existing oversized Hydro emblem. From actual Furina namecard image2 integrate a few recognizable dessert silhouettes in round bubbles (tiny cake slice and pudding), graceful theatrical ribbon curves and a small waterdrop/bow filigree. Restrained sparse ornament at upper corners and outer edges, ALL muted blue tone-on-tone at6\u00e2\u20ac\u201c10% contrast, no saturated colors. Lower central55% schedule zone stays quiet max4% contrast. Laptop landscape1920x1080 opaque. No extra characters,text,UI,timetable,frames,scenery,texture,glow; simple flat sticker style unchanged."
  }
]
`
