const patterns = [
  ['check-study', 'Checker Study', 'Warm cream & soft checks', 'checker', '#f6eadb', '#e8c6ae', '#4c3429'],
  ['dot-notes', 'Dot Notes', 'Lavender & tiny dots', 'dots', '#eee8f5', '#c0afd5', '#4b365f'],
  ['stripe-club', 'Stripe Club', 'Sky blue & broad stripes', 'stripes', '#e8eff5', '#c5d8e7', '#28445c'],
  ['diamond-days', 'Diamond Days', 'Sage & diamond tiles', 'diamonds', '#e6eddd', '#c8d7b7', '#344c35'],
  ['wave-week', 'Wave Week', 'Peach & flowing lines', 'waves', '#f6e5db', '#d8af9e', '#634137'],
  ['notebook-hours', 'Notebook Hours', 'Butter & notebook lines', 'ruled', '#faf2d6', '#cbbb88', '#5d4e2d'],
];

export const patternTemplates = patterns.map(([id, name, description, pattern, background, patternColor, ink]) => ({
  id, name, description, collection: 'pattern', pattern, background, patternColor,
  ink, muted: ink, surface: '#ffffffeb', line: `${ink}45`,
}));
