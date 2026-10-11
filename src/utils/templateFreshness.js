export const NEW_TEMPLATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Publication starts the public window for a design created as a draft.
export function isNewTemplate(template, now = Date.now()) {
  const date = template.publishedAt ?? template.createdAt;
  if (typeof date !== 'string' || !date.trim()) return false;
  const timestamp = Date.parse(date);
  const age = now - timestamp;
  return Number.isFinite(timestamp) && Number.isFinite(now) && age >= 0 && age < NEW_TEMPLATE_WINDOW_MS;
}
