// Transparent character art; the shared mascot renderer supplies the timetable.
const editions = [
  ['white-shy', 'Shy Little Friend', 'White friend & soft pastels', '#dcecf7'],
  ['bunny-smile', 'Bunny Smile', 'Cream bunny & soft pastels', '#f4dce2'],
  ['kitten-snooze', 'Kitten Snooze', 'Blue kitten & soft pastels', '#e7e0f4'],
  ['white-paws', 'Paws Together', 'White friend & soft pastels', '#f6ecdd'],
  ['white-wave', 'Little Wave', 'White friend & soft pastels', '#f0e0e5'],
  ['bunny-cheer', 'Bunny Cheer', 'Cream bunny & soft pastels', '#e2ecd8'],
  ['white-sleep', 'Sleepy Friend', 'White friend & soft pastels', '#f8efd9'],
  ['white-hello', 'Tiny Hello', 'White friend & soft pastels', '#ddebf2'],
  ['kitten-excited', 'Excited Kitten', 'Blue kitten & soft pastels', '#e6e1f2'],
  ['kitten-shy', 'Bashful Kitten', 'Blue kitten & soft pastels', '#f4eadc'],
  ['bunny-hooray', 'Bunny Hooray', 'Cream bunny & soft pastels', '#f6e1d5'],
  ['bunny-sleep', 'Sleepy Bunny', 'Cream bunny & soft pastels', '#e0ece4'],
  ['white-peace', 'Peace Sign', 'White friend & soft pastels', '#f7edce'],
  ['white-bashful', 'Bashful Friend', 'White friend & soft pastels', '#f4e0e7'],
  ['white-determined', 'You Got This', 'White friend & soft pastels', '#deedf5'],
  ['kitten-laugh', 'Kitten Giggles', 'Blue kitten & soft pastels', '#e4eddf'],
  ['bunny-surprise', 'Bunny Surprise', 'Cream bunny & soft pastels', '#eae3f2'],
  ['bunny-wave', 'Bunny Wave', 'Cream bunny & soft pastels', '#f6e1d4'],
  ['white-delight', 'Little Delight', 'White friend & soft pastels', '#f2dce6'],
  ['kitten-peek', 'Kitten Peek', 'Blue kitten & soft pastels', '#deece5'],
];

export const littleFriendsTemplates = editions.map(([character, name, description, background], index) => ({
  id: `little-friends-${character}`, name, description, background,
  ink: '#503b43', muted: '#503b43', accent: '#775563',
  surface: '#ffffff80', line: '#503b4345',
  collection: 'little-friends', layout: 'mascot', mascot: character,
  image: `/wallpapers/little-friends/${character}.png`,
  mascotSide: index % 2 ? 'right' : 'left',
  edition: String(index + 1).padStart(2, '0'),
}));
