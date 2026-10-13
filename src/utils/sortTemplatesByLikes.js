export function sortTemplatesByLikes(templates, likes) {
  return [...templates].sort((a, b) => {
    const difference = (likes[b.id]?.count ?? 0) - (likes[a.id]?.count ?? 0);
    const published = template => Date.parse(template.publishedAt ?? template.createdAt) || 0;
    return difference || published(b) - published(a);
  });
}
