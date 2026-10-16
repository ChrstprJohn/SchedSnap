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
