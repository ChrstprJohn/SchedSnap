export function genshinKeywords(template) {
  const officialNamecard = /^genshin-(?:namecard|card)-/.test(template.id || '');
  const namecard = officialNamecard || template.family === 'chibi-namecards';
  const chibi = !officialNamecard && template.id !== 'genshin-sky-welkin';
  return [...new Set([
    'Genshin Impact', 'background', 'wallpaper', 'anime', 'game', 'Teyvat',
    template.name?.split(/[·—]/)[0].trim(),
    ...(template.family === 'hutao' ? ['Hu Tao', 'Hutao'] : []),
    ...(namecard || chibi ? ['character'] : []),
    ...(namecard ? ['namecard', 'name card', 'banner', 'profile card'] : []),
    ...(chibi ? ['chibi', 'doodle', 'illustration'] : []),
  ].filter(Boolean))].join(', ');
}

const collectionTags = {
  sanrio: ['Sanrio', 'kawaii', 'cute', 'cartoon'],
  snoopy: ['Snoopy', 'Peanuts', 'dog', 'cartoon', 'hand drawn'],
  genshin: ['Genshin Impact', 'anime', 'game'],
  'hunter-x-hunter': ['Hunter x Hunter', 'HxH', 'anime'],
  'we-bare-bears': ['We Bare Bears', 'bears', 'cartoon', 'cute'],
  domo: ['Domo', 'Domo-kun', 'brown', 'cartoon'],
  'adventure-time': ['Adventure Time', 'cartoon', 'illustration'],
  chiikawa: ['Chiikawa', 'Chikawa', 'cute', 'kawaii', 'illustration'],
  ghibli: ['Studio Ghibli', 'anime', 'hand drawn', 'stationery'],
  meep: ['Meep', 'yellow', 'cartoon', 'expression', 'cute'],
  pattern: ['pattern', 'geometric', 'stationery'],
};

// Match only details present in the design metadata, rather than tagging every
// design in a collection with every character, color, or motif.
const detailTags = [
  [/\b(rose|pink|blush|berry)\b/i, ['pink']],
  [/\b(lilac|lavender|violet|purple|periwinkle)\b/i, ['purple']],
  [/\b(blue|navy|denim|icy|sky)\b/i, ['blue']],
  [/\b(mint|sage|matcha|olive|green|seafoam)\b/i, ['green']],
  [/\b(yellow|butter|golden|ochre)\b/i, ['yellow']],
  [/\b(crimson|red)\b/i, ['red']],
  [/\b(brown|caramel|chocolate|terracotta)\b/i, ['brown']],
  [/\b(peach|apricot|orange|flame)\b/i, ['orange']],
  [/\b(cream|ivory|oat|beige)\b/i, ['cream', 'beige']],
  [/\b(black|charcoal|midnight)\b/i, ['black', 'dark']],
  [/\b(grey|gray|silver)\b/i, ['gray', 'grey']],
  [/\bwhite\b/i, ['white']],
  [/\b(pastel|soft|pale|powder)\b/i, ['pastel']],
  [/\b(minimal|simple|quiet)\b/i, ['minimal', 'simple']],
  [/\b(handmade|sketch|ink|doodle|hand.drawn)\b/i, ['hand drawn', 'doodle']],
  [/\b(flowers?|floral|blossom|dais(y|ies)|hydrangea|wreath)\b/i, ['floral', 'flowers']],
  [/\b(forest|woodland|grove|garden|meadow|hill|leaf|leaves|botanical)\b/i, ['nature']],
  [/\b(stars?|starlight|moon|crescent|cosmos|celestial|orbit|planets?)\b/i, ['celestial', 'space']],
  [/\b(cloud|clouds|cloudscape)\b/i, ['sky', 'clouds']],
  [/\bsky\b(?! blue)/i, ['sky']],
  [/\brainbow\b/i, ['rainbow']],
  [/\b(rain|umbrella)\b/i, ['rainy', 'umbrella']],
  [/\b(hearts?|love)\b/i, ['hearts']],
  [/\b(bows?|ribbons?)\b/i, ['bows', 'ribbons']],
  [/\blace\b/i, ['lace']],
  [/\b(gingham|plaid|tartan|checks?|checker)\b/i, ['checkered', 'gingham']],
  [/\b(dots?|dotted|speckles?|sprinkles?)\b/i, ['dots', 'polka dots']],
  [/\bstripes?\b/i, ['stripes']],
  [/\b(grid|graph|blueprint)\b/i, ['grid', 'graph paper']],
  [/\b(ruled|notebook|journal)\b/i, ['notebook', 'journal']],
  [/\bdiamonds?\b/i, ['diamonds']],
  [/\b(waves?|flowing|current)\b/i, ['waves']],
  [/\b(frame|border|postcard)\b/i, ['frame', 'border']],
  [/\b(scrapbook|collage|patchwork|stamps?|cutout|paper.cut)\b/i, ['scrapbook', 'collage']],
  [/\bstickers?\b/i, ['stickers']],
  [/\b(photo|snapshot|album|selfie)\b/i, ['photo', 'memories']],
  [/\b(pixel|8.bit)\b/i, ['pixel art', 'retro']],
  [/\b(tea|teacup|patisserie|pastr(y|ies)|cakes?)\b/i, ['tea party', 'cafe']],
  [/\bstrawberr(y|ies)\b/i, ['strawberry', 'fruit']],
  [/\b(sleep|sleepy|snooze|nap|bedtime|dream|cozy)\b/i, ['cozy', 'sleepy']],
  [/\b(book|reader|reading|study)\b/i, ['reading', 'study']],
  [/\b(picnic|clearing)\b/i, ['picnic']],
  [/\b(watercolor|gouache)\b/i, ['watercolor', 'painted']],
  [/\b(screenprint|printed|repeat)\b/i, ['print', 'repeat']],
  [/\b(plush|textile|embroidered|cloth)\b/i, ['plush', 'fabric']],
  [/\b(manga|comic)\b/i, ['manga', 'comic']],
  [/\bchibi\b/i, ['chibi']],
];

const characterTags = [
  [/\b(melody)\b/i, ['My Melody']], [/\bpiano\b/i, ['My Sweet Piano']],
  [/\bkitty\b/i, ['Hello Kitty']], [/\b(cinnamon|cinnamoroll)\b/i, ['Cinnamoroll', 'Cinnamon']],
  [/\bkuromi\b/i, ['Kuromi']], [/\bwoodstock\b/i, ['Woodstock', 'bird']],
  [/\b(ice.bear)\b/i, ['Ice Bear', 'polar bear']], [/\bpanda\b/i, ['Panda']],
  [/\bgrizzly\b/i, ['Grizzly', 'Grizz']], [/\btotoro\b/i, ['Totoro', 'My Neighbor Totoro']],
  [/\bjiji\b/i, ['Jiji', 'black cat', "Kiki's Delivery Service"]],
  [/\bhachiware\b/i, ['Hachiware']], [/\busagi\b/i, ['Usagi', 'bunny']],
  [/\bjake\b/i, ['Jake', 'dog']], [/\bfinn\b/i, ['Finn']],
  [/\bmarceline\b/i, ['Marceline', 'vampire']], [/\bbmo\b/i, ['BMO', 'robot']],
  [/\blumpy.space\b/i, ['Lumpy Space Princess']], [/\blemongrab\b/i, ['Lemongrab', 'lemon']],
  [/\bflame.princess\b/i, ['Flame Princess', 'fire']],
];

export function backgroundColorKeywords(color = '') {
  let hex = /^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(color)?.[1];
  if (!hex) return [];
  if (hex.length === 3) hex = [...hex].map(part => part + part).join('');
  const [r, g, b] = hex.match(/../g).map(part => parseInt(part, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const lightness = (max + min) / 2;
  if (delta < .03) return lightness > .93 ? ['white'] : lightness < .18 ? ['black', 'dark'] : ['gray', 'grey'];
  const hue = ((max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360;
  if (hue >= 20 && hue < 65 && lightness > .88) return ['cream', 'beige', 'pastel'];
  const name = hue < 15 ? lightness > .7 ? 'pink' : 'red' : hue < 45 ? lightness < .58 ? 'brown' : 'orange' : hue < 70 ? 'yellow' : hue < 170 ? 'green' : hue < 195 ? 'teal' : hue < 255 ? 'blue' : hue < 290 ? 'purple' : 'pink';
  return [name, ...(lightness > .78 ? ['pastel'] : []), ...(lightness < .25 ? ['dark'] : [])];
}

export function templateColorKeywords(template) {
  const authored = (template.keywords || '').split(',').map(term => term.trim().toLowerCase());
  const colors = authored.filter(term => ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'cream', 'beige', 'white', 'gray', 'grey', 'black'].includes(term));
  // Existing artwork tags outrank the fallback canvas color behind an image.
  return colors.length ? colors : backgroundColorKeywords(template.background);
}

export function withTemplateKeywords(template) {
  const existing = (template.keywords || '').split(',').map(term => term.trim()).filter(Boolean);
  const collection = ['chikawa', 'little-friends'].includes(template.collection) ? 'chiikawa' : template.collection;
  const text = [template.name, template.description, template.family, template.pattern].filter(Boolean).join(' ').replaceAll('-', ' ');
  const details = detailTags.filter(([pattern]) => pattern.test(text)).flatMap(([, tags]) => tags);
  const characters = characterTags.filter(([pattern]) => pattern.test(text)).flatMap(([, tags]) => tags);
  if (collection === 'we-bare-bears' && /\b(trio|three)\b/i.test(text)) characters.push('Ice Bear', 'Grizzly', 'Panda');
  if (collection === 'chiikawa') {
    if (/\b(trio|friends)\b/i.test(text)) characters.push('Hachiware', 'Usagi');
    if (/little-friends-kitten/.test(template.id)) characters.push('Hachiware', 'cat');
    if (/little-friends-bunny/.test(template.id)) characters.push('Usagi', 'bunny');
  }
  const tags = [...existing, ...templateColorKeywords(template), ...(collectionTags[collection] || [collection || 'original', 'illustration']), ...characters,
    ...(collection === 'genshin' ? genshinKeywords(template).split(', ') : []), ...details,
    template.name?.split(/[·—]/)[0].trim(), template.name, template.family?.replaceAll('-', ' '), template.pattern];
  const seen = new Set();
  const accepted = [];
  for (const tag of tags.filter(Boolean)) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    if ([...accepted, tag].join(', ').length > 500) continue;
    seen.add(key); accepted.push(tag);
  }
  return { ...template, keywords: accepted.join(', ') };
}
