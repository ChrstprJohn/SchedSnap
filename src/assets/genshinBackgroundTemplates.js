import { genshinKeywords } from '../../shared/templateKeywords.js';

// Character-free namecard backgrounds with device-specific compositions.
const designs = [
  ['genshin-namecard-xiao', 'Xiao · Mask', 'Official namecard motifs with a subtle Anemo Vision.', 'xiao', '#175466', '#e8fff9', '#103c50b3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-gaming', 'Gaming · Man Chai', 'Official namecard motifs with a subtle Pyro Vision.', 'gaming', '#8d2530', '#fff2d2', '#591a25b3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-ineffa', 'Ineffa · Command', 'Official namecard motifs with a subtle Electro Vision.', 'ineffa', '#79b5e9', '#18384f', '#f4f8ffb3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-kazuha', 'Kazuha · Autumn Maple-Viewing', 'Official namecard motifs with a subtle Anemo Vision.', 'kazuha', '#466965', '#fff0d8', '#203b38b3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-cyno', 'Cyno · Silence', 'Official namecard motifs with a subtle Electro Vision.', 'cyno', '#30285c', '#f7ecff', '#211a44b3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-ifa', 'Ifa · Bro', 'Official namecard motifs with a subtle Anemo Vision.', 'ifa', '#ace4d5', '#493947', '#fff8e8b3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-iansan', 'Iansan · Unyielding', 'Official orange graphics with a subtle Electro Vision.', 'iansan', '#efa72e', '#513622', '#fff5deb3', '2026-10-16T00:55:05Z'],
  ['genshin-namecard-kinich', 'Kinich · Ajaw', 'Official pixel landscape with a subtle Dendro Vision.', 'kinich', '#79ce92', '#244e50', '#e3f6c5b3', '2026-10-16T00:55:05Z'],
  ["genshin-card-hutao-spirit","Hu Tao · Spirit Soother","Faithful adaptation of Hu Tao · Spirit Soother's official namecard with a subtle Pyro emblem.","hutao","#644237","#fff1dc","#382923ed","2026-10-15T15:25:22.688Z"],
  ["genshin-card-navia-rosula","Navia · Rosula","Faithful adaptation of Navia · Rosula's official namecard with a subtle Geo emblem.","navia","#9c742d","#382b21","#fff3d6eb","2026-10-15T15:25:22.688Z"],
  ["genshin-card-varesa-powerhouse","Varesa · Powerhouse","Faithful adaptation of Varesa · Powerhouse's official namecard with a subtle Electro emblem.","varesa","#f4ced5","#653b58","#fff8f5eb","2026-10-15T15:25:22.688Z"],
  ["genshin-card-citlali-opalstar","Citlali · Opalstar","Faithful adaptation of Citlali · Opalstar's official namecard with a subtle Cryo emblem.","citlali","#433783","#f5f0ff","#292455ed","2026-10-15T15:25:22.688Z"],
  ["genshin-card-skirk-lone-shadow","Skirk · Lone Shadow","Faithful adaptation of Skirk · Lone Shadow's official namecard with a subtle Cryo emblem.","skirk","#20193d","#f2efff","#171932ed","2026-10-15T15:25:22.688Z"],
  ["genshin-card-zhongli-planet","Zhongli · Planet Befall","Faithful adaptation of Zhongli · Planet Befall's official namecard with a subtle Geo emblem.","zhongli","#574333","#fff1ce","#2b241ded","2026-10-15T15:25:22.688Z"],
  ['genshin-card-kazuha-maple', 'Kazuha — Maple Winds', 'Maple ribbons and an Anemo emblem.', 'kazuha', '#704e3d', '#fff6d4', '#38261eee'],
  ['genshin-card-mavuika-sun', 'Mavuika — Solar Flame', 'A solar wheel with a Pyro emblem and restrained flames.', 'mavuika', '#252220', '#fff0d0', '#1b1b1bee'],
  ['genshin-card-arlecchino-fate', 'Arlecchino — Crimson Fate', 'Silver wings, crimson flames and a Pyro seal.', 'arlecchino', '#b0b4bd', '#29242b', '#ffffffeb'],
  ['genshin-card-raiden-lightning', 'Raiden — Violet Lightning', 'Violet ribbons, sakura and the Electro emblem.', 'raiden', '#292d54', '#f8ebc9', '#1a1e39ee'],
  ['genshin-sky-welkin', 'Genshin — Welkin Sky', 'Blue shooting stars above a field of white flowers.', 'sky', '#263c77', '#f4f5ff', '#172546ee'],
];

export const genshinBackgroundTemplates = designs.map(([id, name, description, family, background, ink, surface, createdAt = '2026-10-14T07:00:00Z']) => ({
  id, name, description, family, background, ink, surface: surface.slice(0, 7) + 'b3',
  ...(family === 'kinich' ? { pixelArt: true } : {}),
  ...(family === 'navia' ? { headingInk: '#ffffff' } : {}),
  createdAt,
  collection: 'genshin', muted: ink, line: ink + '45',
  containerStyle: 'glass', containerShape: 'pill', containerFill: true,
  showScheduleTitle: true, artworkFooter: false, schedulePosition: 'left', particleStyle: 'none',
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
})).map(template => ({ ...template, keywords: genshinKeywords(template) }));
