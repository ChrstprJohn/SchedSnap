const patterns = [
  ['check-study', 'Checker Study', 'Warm cream & soft checks', 'checker', '#f6eadb', '#e8c6ae', '#4c3429'],
  ['dot-notes', 'Dot Notes', 'Lavender & tiny dots', 'dots', '#eee8f5', '#c0afd5', '#4b365f'],
  ['stripe-club', 'Stripe Club', 'Sky blue & broad stripes', 'stripes', '#e8eff5', '#c5d8e7', '#28445c'],
  ['diamond-days', 'Diamond Days', 'Sage & diamond tiles', 'diamonds', '#e6eddd', '#c8d7b7', '#344c35'],
  ['wave-week', 'Wave Week', 'Peach & flowing lines', 'waves', '#f6e5db', '#d8af9e', '#634137'],
  ['notebook-hours', 'Notebook Hours', 'Butter & notebook lines', 'ruled', '#faf2d6', '#cbbb88', '#5d4e2d'],
  ['rose-check', 'Rose Check', 'Blush & dusty rose checks', 'checker', '#f8e9e9', '#e4bfc4', '#57343e'],
  ['matcha-check', 'Matcha Check', 'Oat milk & matcha checks', 'checker', '#f2efdf', '#c9d3af', '#39452c'],
  ['blueprint-break', 'Blueprint Break', 'Powder blue & quiet graph lines', 'grid', '#eaf1f8', '#789ebc', '#2c435b'],
  ['peach-graph', 'Peach Graph', 'Apricot & soft graph lines', 'grid', '#fbecdf', '#c38f70', '#603f2d'],
  ['mint-margins', 'Mint Margins', 'Mint paper & notebook lines', 'ruled', '#e9f2e9', '#87aa91', '#345344'],
  ['lilac-journal', 'Lilac Journal', 'Lilac paper & notebook lines', 'ruled', '#f0eafa', '#a78cbd', '#4f3b64'],
  ['apricot-sun', 'Apricot Sun', 'Cream & a warm corner circle', 'circle', '#faf1e2', '#ecc5a2', '#65442e'],
  ['lavender-moon', 'Lavender Moon', 'Mist & a lavender corner circle', 'circle', '#f0edf6', '#cdc0e4', '#4d3f65'],
  ['berry-speckles', 'Berry Speckles', 'Rose milk & tiny berry dots', 'dots', '#f8edf0', '#c395a5', '#653d4d'],
  ['seafoam-speckles', 'Seafoam Speckles', 'Seafoam & tiny teal dots', 'dots', '#e8f2ee', '#97bcb0', '#31564c'],
  ['butter-ribbon', 'Butter Ribbon', 'Ivory & butter-yellow stripes', 'stripes', '#faf5e8', '#ecdda9', '#5c4d2e'],
  ['lilac-ribbon', 'Lilac Ribbon', 'Pale lilac & violet stripes', 'stripes', '#f2edf8', '#d7c9e9', '#514065'],
  ['terracotta-tiles', 'Terracotta Tiles', 'Peach cream & clay diamonds', 'diamonds', '#f8ebe1', '#e4c4b0', '#654434'],
  ['denim-tiles', 'Denim Tiles', 'Blue mist & denim diamonds', 'diamonds', '#eaf0f6', '#c2d2e2', '#324b63'],
  ['mint-current', 'Mint Current', 'Mint & gently flowing lines', 'waves', '#edf5ed', '#aac8b0', '#35523e'],
  ['violet-current', 'Violet Current', 'Lilac & gently flowing lines', 'waves', '#f3edf7', '#c4adcf', '#594265'],
  ['rose-border', 'Rose Border', 'Cream & a quiet rose frame', 'frame', '#faf2ed', '#d6a7ad', '#633e44'],
  ['sage-border', 'Sage Border', 'Oat paper & a quiet sage frame', 'frame', '#f2f1e7', '#a8b998', '#3d5135'],
];

const variantCreatedAt = '2026-10-11T11:04:17.000Z';

export const patternTemplates = patterns.map(([id, name, description, pattern, background, patternColor, ink], index) => ({
  id, name, description, collection: 'pattern', pattern, background, patternColor,
  ink, muted: ink, surface: '#ffffffeb', line: `${ink}45`,
  ...(index >= 6 ? { createdAt: variantCreatedAt } : {}),
}));
