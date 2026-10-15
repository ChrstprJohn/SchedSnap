// Reference artwork only; Canvas draws the editable schedule separately.
const createdAt = '2026-10-15T13:50:06.275Z';
const latestCreatedAt = '2026-10-15T15:35:43.667Z';
const latestIds = ['adventure-lumpy-space', 'adventure-lemongrab', 'adventure-meadow-bugs'];
const designs = [
  ['adventure-lumpy-space', 'Lumpy Space Princess', 'adventure-time', '#b593c4', false],
  ['adventure-lemongrab', 'Lemongrab', 'adventure-time', '#ffff00', false],
  ['adventure-meadow-bugs', 'Meadow Bug Friends', 'adventure-time', '#c4df4e', false],
  ['domo-desk-peek', 'Domo Desk Peek', 'domo', '#ffffff', false],
  ['domo-taped-glasses', 'Domo Taped Glasses', 'domo', '#783f29', true],
  ['adventure-jake-face', 'Jake Face', 'adventure-time', '#ffbc19', false],
  ['adventure-finn-smile', 'Finn Smile', 'adventure-time', '#ffffff', false],
  ['adventure-marceline', 'Marceline Midnight', 'adventure-time', '#10112d', true],
  ['adventure-flame-princess', 'Flame Princess', 'adventure-time', '#ff4b00', false],
  ['adventure-bmo', 'BMO Playtime', 'adventure-time', '#25a99d', false],
];

export const characterReferenceTemplates = designs.map(([id, name, collection, background, dark]) => ({
  id, name, collection, background, createdAt: latestIds.includes(id) ? latestCreatedAt : createdAt, family: 'reference-minimal',
  description: 'A simple reference-inspired cartoon composition with room for your timetable.',
  ink: dark ? '#fff9ee' : '#242122', muted: dark ? '#eee1d4' : '#4b4142',
  surface: dark ? '#282333' : '#fffaf3', line: dark ? '#8c8098' : '#a79e94',
  containerStyle: 'glass', containerShape: 'pill', containerFill: true, particleStyle: 'none',
  verticalPosition: -40, schedulePosition: 'left',
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
}));

export const domoReferenceAdditions = characterReferenceTemplates.filter(t => t.collection === 'domo');
export const adventureTimeTemplates = characterReferenceTemplates.filter(t => t.collection === 'adventure-time');
