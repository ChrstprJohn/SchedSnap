// Twelve generated Sanrio designs; artwork is independently composed for every device.
const designs = [
  ['sanrio-parade-candy', 'Candy Parade', 'My Melody, Hello Kitty and Cinnamoroll carry pastel sweets beneath ribbon bunting.', 'sanrio-parade', '#fff7f7', '2026-10-13T05:33:33.306Z'],
  ['sanrio-parade-music', 'Ribbon Music Parade', 'My Melody plays the trumpet while Hello Kitty and Cinnamoroll join a ribbon-trimmed marching band.', 'sanrio-parade', '#fff8f2', '2026-10-13T05:37:06.346Z'],
  ['sanrio-parade-balloons', 'Balloon Parade', 'Heart and star balloons accompany My Melody, Hello Kitty and Cinnamoroll in a soft pink parade.', 'sanrio-parade', '#fff8f5', '2026-10-13T05:42:05.495Z'],
  ['sanrio-pixel-rose', 'Rose Ribbon Kitty', 'Pixel Hello Kitty rests beside rose ribbons and pale polka dots.', 'sanrio-pixel', '#fff2f5', '2026-10-13T05:40:19.004Z'],
  ['sanrio-pixel-lilac', 'Lilac Ribbon Kitty', 'A lilac bow, soft ribbons and pixel Hello Kitty decorate pale dotted stationery.', 'sanrio-pixel', '#f8f2fc', '2026-10-13T05:40:19.004Z'],
  ['sanrio-pixel-mint', 'Mint Ribbon Kitty', 'Pixel Hello Kitty pairs mint ribbons with a quiet pastel polka-dot background.', 'sanrio-pixel', '#f2faf5', '2026-10-13T05:40:19.004Z'],
  ['sanrio-tea-strawberry', 'Strawberry Tea', 'My Melody and Hello Kitty share strawberry tea and tiny cakes beneath cream lace curtains.', 'sanrio-tea', '#fff8f3', '2026-10-13T05:48:27.983Z'],
  ['sanrio-tea-patisserie', 'Patisserie Tea', 'My Melody and Hello Kitty enjoy pastries and teacups on blush-striped lace stationery.', 'sanrio-tea', '#fff8f3', '2026-10-13T05:48:27.983Z'],
  ['sanrio-tea-flowers', 'Flower Tea', 'A tiny floral tea party with My Melody, Hello Kitty and delicate lace borders.', 'sanrio-tea', '#fff8f3', '2026-10-13T05:48:27.983Z'],
  ['sanrio-gingham-strawberry', 'Strawberry Gingham', 'Hello Kitty faces, strawberries and tiny bows frame pale pink gingham.', 'sanrio-gingham', '#fff4f6', '2026-10-13T05:33:39.663Z'],
  ['sanrio-gingham-ribbon', 'Ribbon Gingham', 'Hello Kitty, soft ribbons and small hearts sit along the edges of blush gingham.', 'sanrio-gingham', '#fff4f6', '2026-10-13T05:40:01.218Z'],
  ['sanrio-gingham-daisy', 'Daisy Gingham', 'Hello Kitty faces and butter-yellow daisies decorate quiet pink checks.', 'sanrio-gingham', '#fff4f6', '2026-10-13T05:42:12.974Z'],
];

export const sanrioTemplates = designs.map(([id, name, description, family, background, createdAt]) => ({
  id, name, description, family, background, createdAt,
  collection: 'sanrio',
  ink: '#583b49',
  muted: '#7d5c6c',
  surface: 'rgba(255, 255, 255, 0.96)',
  line: 'rgba(88, 59, 73, 0.20)',
  containerStyle: 'solid',
  containerShape: 'rounded',
  verticalPosition: -35,
  bottomMargin: 0,
  particleStyle: 'none',
  ...(family === 'sanrio-pixel' ? { pixelArt: true } : {}),
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [
    device, `/wallpapers/scenic/${id}/${device}.png`,
  ])),
}));
