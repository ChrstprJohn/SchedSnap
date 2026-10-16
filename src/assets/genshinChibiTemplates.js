import { genshinKeywords } from '../../shared/templateKeywords.js';

// Reference-inspired chibi backgrounds; schedules are rendered separately.
const designs = [
  [
    "genshin-kaeya-atlas",
    "Kaeya — Atlas Doodles",
    "Blue ink doodles and a faded atlas on ivory paper.",
    "#e6e8dd",
    "#3f596b"
  ],
  [
    "genshin-tidal-sketches",
    "Traveler — Tidal Sketches",
    "Traveler and Paimon beach sketches beside a soft blue shoreline.",
    "#f9e2c2",
    "#684d38"
  ],
  [
    "genshin-celestial-promise",
    "Travelers — Celestial Promise",
    "Small travelers beneath sunset clouds and celestial columns.",
    "#f0d8ca",
    "#52445f"
  ],
  ["genshin-original-sketch-parade", "Teyvat — Sketch Parade", "The supplied pencil parade artwork, preserved without redraw.", "#deded3", "#536575"],
  ["genshin-original-kaeya-map", "Arlecchino — Sketch Doodle", "The supplied pale map and Arlecchino doodle, preserved without redraw.", "#dfe2d6", "#4c6577"]
];

export const genshinChibiTemplates = designs.map(([id, name, description, background, ink]) => ({
  id, name, description, background, ink, muted: ink,
  family: 'chibi-namecards', collection: 'genshin',
  surface: '#ffffffb3', line: '#ffffffb3',
  createdAt: "2026-10-15T13:06:36.942Z",
  containerStyle: 'glass', containerShape: 'pill', containerFill: true,
  showScheduleTitle: true, artworkFooter: false, schedulePosition: 'left', particleStyle: 'none',
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
})).map(template => ({ ...template, keywords: genshinKeywords(template) }));
