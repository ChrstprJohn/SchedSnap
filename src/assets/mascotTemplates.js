// Generated animals contain no timetable content. Canvas paints the background,
// heading and every actual meeting separately at export time.
const editions = [
  ['bear', 'Bear Mode', 'Midnight navy & bold type', '#182b43', '#f7ebcb', '#d77a45', 'bold', 'ledger', 'left'],
  ['bunny', 'Bunny Bloom', 'Blush & berry', '#eec8cb', '#71394d', '#71394d', 'soft', 'cards', 'right'],
  ['panda', 'Daily Panda', 'Ivory & quiet charcoal', '#f4f0e5', '#292d2c', '#506345', 'daily', 'ledger', 'left'],
  ['cat', 'Lilac Cat', 'Lilac & cream', '#d8cbef', '#493359', '#493359', 'soft', 'cards', 'right'],
  ['dog', 'Good Day Dog', 'Oat & warm caramel', '#f1e7d6', '#4b3024', '#805128', 'daily', 'ledger', 'left'],
  ['fox', 'Fox Club', 'Rust & warm cream', '#753a29', '#fff1d8', '#f0c68e', 'bold', 'tickets', 'right'],
  ['tiger', 'Tiger Team', 'Peach & confident stripes', '#f7dbc0', '#553624', '#965124', 'bold', 'tickets', 'left'],
  ['lion', 'Golden Lion', 'Golden oat & cocoa', '#f5e4bd', '#523b2d', '#815516', 'bold', 'ledger', 'right'],
  ['koala', 'Koala Calm', 'Sage & gentle stationery', '#dae3d8', '#38483d', '#425c46', 'soft', 'cards', 'left'],
  ['otter', 'Otter Hours', 'Deep teal & cream', '#244e51', '#f3dfc3', '#f3dfc3', 'daily', 'ledger', 'right'],
  ['penguin', 'Blue Penguin', 'Sky blue & navy', '#d8e6f0', '#223c56', '#223c56', 'bold', 'tickets', 'left'],
  ['owl', 'Owl Notes', 'Lavender & plum', '#e7ddf0', '#4b365f', '#4b365f', 'soft', 'ledger', 'right'],
  ['duck', 'Duck Days', 'Forest green & butter', '#214535', '#fff2c4', '#e9c655', 'daily', 'tickets', 'left'],
  ['chick', 'Butter Chick', 'Butter & honey', '#fbefd0', '#775332', '#775332', 'soft', 'cards', 'right'],
  ['frog', 'Frog Focus', 'Fresh sage & pine', '#dce8cb', '#294b38', '#385b2e', 'daily', 'tickets', 'left'],
  ['turtle', 'Turtle Pace', 'Deep pine & mint', '#183c32', '#e6f0db', '#b7d8b5', 'daily', 'ledger', 'right'],
  ['capybara', 'Capybara Club', 'Sand & warm brown', '#f0e1ca', '#604633', '#604633', 'bold', 'ledger', 'left'],
  ['hamster', 'Peach Hamster', 'Soft peach & caramel', '#f5daca', '#654633', '#654633', 'soft', 'cards', 'right'],
  ['seal', 'Seal Study', 'Glacier blue & airy type', '#e0edf0', '#345365', '#345365', 'daily', 'cards', 'left'],
  ['whale', 'Whale Week', 'Inky blue & periwinkle', '#192f4b', '#f0f2fc', '#b9cbee', 'bold', 'tickets', 'right'],
];

export const mascotTemplates = editions.map(([animal, name, description, background, ink, accent, heading, style, side], index) => ({
  id: `mascot-${animal}`, name, description, background, ink,
  muted: ink, accent, surface: ['fox', 'otter', 'duck', 'turtle', 'whale', 'bear'].includes(animal) ? '#ffffff0f' : '#ffffff80',
  line: `${ink}45`, collection: 'mascot', layout: 'mascot',
  heading, rows: `mascot-${style}`, mascot: animal,
  image: `/wallpapers/mascots/${animal}.png`, mascotSide: side,
  edition: String(index + 1).padStart(2, '0'),
}));
