const createdAt = '2026-10-16T15:58:19Z';
const designs = [
  ['gon-manga', 'Gon · Manga', 'manga', '#282a21', 'Gon Freecss, red, orange, red orange, black, warm, glow, manga panels, collage, Nen'],
  ['killua-manga', 'Killua · Manga', 'manga', '#253248', 'Killua Zoldyck, blue, navy, white, black, cool, electric, lightning, glow, manga panels, collage'],
  ['kurapika-manga', 'Kurapika · Manga', 'manga', '#472730', 'Kurapika Kurta, red, crimson, gold, amber, black, blond, chain, glow, manga panels, collage'],
  ['leorio-manga', 'Leorio · Manga', 'manga', '#39332c', 'Leorio Paradinight, yellow, orange, yellow orange, amber, sepia, navy, black, warm, glasses, suit, glow, manga panels, collage'],
  ['hisoka-manga', 'Hisoka · Manga', 'manga', '#402337', 'Hisoka Morow, pink, rose, magenta, purple, black, glow, magician, playing card, manga panels, collage'],
  ['gon-plain', 'Gon · Green', 'plain', '#244c35', 'Gon Freecss, green, forest green, black, white, amber eyes, monochrome, manga portrait, minimalist, solid background'],
  ['killua-plain', 'Killua · Blue', 'plain', '#21445d', 'Killua Zoldyck, blue, slate blue, black, white, blue eyes, monochrome, manga portrait, minimalist, solid background'],
  ['kurapika-plain', 'Kurapika · Crimson', 'plain', '#741329', 'Kurapika Kurta, red, crimson, burgundy, black, white, scarlet eyes, monochrome, chain, manga portrait, minimalist, solid background'],
  ['hisoka-plain', 'Hisoka · Pink', 'plain', '#d92370', 'Hisoka Morow, pink, hot pink, black, white, golden eyes, amber eyes, monochrome, magician, manga portrait, minimalist, solid background'],
  ['gon-chibi', 'Gon · Chibi', 'chibi', '#52684b', 'Gon Freecss, green, sage, olive green, amber eyes, seated, cute, plain, textured'],
  ['killua-chibi', 'Killua · Chibi', 'chibi', '#7786a6', 'Killua Zoldyck, blue, slate blue, periwinkle, lavender, white hair, blue eyes, seated, cute, plain, textured'],
  ['kurapika-chibi', 'Kurapika · Chibi', 'chibi', '#814d50', 'Kurapika Kurta, red, burgundy, gold, antique gold, blond, chain, chains, seated, cute'],
  ['leorio-chibi', 'Leorio · Chibi', 'chibi', '#355b6b', 'Leorio Paradinight, teal, navy, blue, brown, glasses, sunglasses, attache case, attaché case, briefcase, suit, seated, cute'],
  ['phantom-troupe', 'Phantom Troupe', 'group', '#faf8f3', 'Phantom Troupe, Phantom gang, spider, Genei Ryodan, Chrollo, Machi, Shizuku, Nobunaga, Bonolenov, Uvogin, Phinks, Hisoka, Pakunoda, Franklin, Kortopi, Feitan, Shalnark, white, pink, coral, doodle, chibi, logo'],
  ['four-slash', 'Four Hunters · Slash', 'group', '#f4f1eb', 'Gon Freecss, Killua Zoldyck, Kurapika Kurta, Leorio Paradinight, black, white, gray, monochrome, grayscale, manga, diagonal, slash, panels, quartet'],
];

export const hunterTemplates = designs.map(([suffix, name, family, background, keywords]) => {
  const id = `hxh-${suffix}`;
  const ink = family === 'chibi' || family === 'group' ? '#25252d' : '#fff8ed';
  return {
    id, name, family, collection: 'hunter-x-hunter', mobileOnly: true, createdAt,
    description: `Hunter × Hunter ${family === 'group' ? 'group artwork' : `${family} portrait`} for mobile.`,
    keywords: `Hunter x Hunter, Hunter × Hunter, HxH, anime, ${family}, ${keywords}`,
    background, ink, muted: ink, line: `${ink}55`,
    surface: family === 'chibi' || family === 'group' ? '#fffdf5ed' : '#181925ed',
    containerStyle: 'solid', containerShape: 'rounded', containerFill: true,
    schedulePosition: 'center', particleStyle: 'none', showScheduleTitle: true,
    artworkFooter: false,
    ...(['plain', 'manga'].includes(family) ? {
      containerStyle: 'glass', containerShape: 'pill', fontScale: 0.9,
      surface: ({ 'gon-manga': '#3e221a', 'leorio-manga': '#49351f', 'hisoka-plain': '#7a1648' })[suffix] || background,
      containerOpacity: family === 'manga' ? 80 : 85,
      verticalPosition: family === 'manga' ? -20 : -30, showTitle: family === 'manga',
    } : {}),
    ...(family === 'chibi' ? {
      containerStyle: 'glass', containerShape: 'pill', fontScale: 0.9, containerOpacity: 85,
      surface: ({ 'gon-chibi': '#374c32', 'killua-chibi': '#25354b', 'kurapika-chibi': '#482c32', 'leorio-chibi': '#183b4b' })[suffix],
      ink: '#fff8ed', muted: '#fff8ed', line: '#fff8ed55',
      topMargin: 20, verticalPosition: 0, showTitle: false,
    } : {}),
    ...(id === 'hxh-gon-chibi' ? { headingInk: '#fff8ed' } : {}),
    image: `/wallpapers/scenic/${id}/mobile.png`,
    deviceImages: { mobile: `/wallpapers/scenic/${id}/mobile.png` },
  };
});
