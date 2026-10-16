export function sortTemplatesByLikes(templates, likes, sort = 'likes', downloads = {}) {
  return [...templates].sort((a, b) => {
    const difference = sort === 'downloads' ? (downloads[b.id] ?? 0) - (downloads[a.id] ?? 0) : sort === 'likes' ? (likes[b.id]?.count ?? 0) - (likes[a.id]?.count ?? 0) : 0;
    const published = template => Date.parse(template.publishedAt ?? template.createdAt) || 0;
    return difference || (sort === 'oldest' ? published(a) - published(b) : published(b) - published(a));
  });
}
