// Clean Genshin chibi artwork; schedule content is drawn separately by Canvas.
const designs = [
  ['genshin-hutao-nap', 'Hu Tao · Cozy Nap', 'Minimal ink sticker Hu Tao taking a quiet nap.', 'hutao', '#f5eeee', '#553c45', '2026-10-14T06:22:00Z'],
  ['genshin-raiden-moon', 'Raiden · Moon Nap', 'Minimal ink chibi resting beside a small crescent.', 'raiden', '#eeedf8', '#403653', '2026-10-13T13:43:20Z'],
  ['genshin-furina-tea', 'Furina · Tea Time', 'Flat chibi Furina with a tiny teacup on icy cream.', 'furina', '#eef5fb', '#304867', '2026-10-13T13:43:20Z'],
  ['genshin-nahida-leaf', 'Nahida · Little Leaf', 'Soft flat chibi Nahida holding a single leaf.', 'nahida', '#f1f6e9', '#365039', '2026-10-13T13:43:20Z'],
  ['genshin-nahida-dream', 'Nahida · Leaf Dream', 'Minimal ink sticker Nahida on a tiny leaf cushion.', 'nahida', '#eef5ed', '#38503d', '2026-10-13T13:43:20Z'],
  [
    "genshin-columbina-moon",
    "Columbina · Moonlit Feathers",
    "A quiet chibi with a small crescent and feather details.",
    "columbina",
    "#f3f0fa",
    "#49415c"
  ],
  [
    "genshin-zhongli-tea",
    "Zhongli · Amber Tea",
    "A little tea break with pale stone and amber diamond accents.",
    "zhongli",
    "#f9f3e8",
    "#5b4934"
  ],
  [
    "genshin-neuvillette-tide",
    "Neuvillette · Gentle Tide",
    "A chibi water tasting moment with a few soft droplets.",
    "neuvillette",
    "#eff5fa",
    "#354c66"
  ],
  [
    "genshin-arlecchino-ember",
    "Arlecchino — Sketch Doodle",
    "A poised chibi and tiny crimson petals on soft ash paper.",
    "arlecchino",
    "#f5f2f2",
    "#51444c"
  ],
  [
    "genshin-flins-lantern",
    "Flins · Little Lantern",
    "A tiny blue lantern and restrained lavender wisps.",
    "flins",
    "#edf2f7",
    "#38465d"
  ]
];

export const genshinTemplates = designs.map(([id, name, description, family, background, ink, createdAt = '2026-10-13T14:28:48Z']) => ({
  id, name, description, family, background, ink,
  createdAt,
  collection: 'genshin', muted: ink, surface: '#ffffffb3', line: '#ffffffb3',
  containerStyle: 'glass', containerShape: 'pill', containerFill: true,
  showScheduleTitle: true, artworkFooter: false, schedulePosition: 'left',
  particleStyle: 'none',
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
}));
