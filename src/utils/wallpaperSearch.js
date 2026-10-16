import { galleryCategories, matchesGalleryCategory } from '../config/collections.js';
import { genshinKeywords } from '../../shared/templateKeywords.js';

/**
 * Normalizes a string for search comparison (lowercase, trims, strips diacritics).
 */
export function normalizeSearchText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings.
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Scores how well a search pattern matches a target wallpaper name.
 * Returns a number > 0 for a match (higher is better), or 0 for no match.
 */
export function scoreSearchPattern(query, target) {
  const q = normalizeSearchText(query);
  const t = normalizeSearchText(target);

  if (!q || !t) return 0;

  // 1. Exact match gets top score
  if (t === q) {
    return 1000;
  }

  // 2. Starts with query
  if (t.startsWith(q)) {
    return 800 + (q.length / t.length) * 100;
  }

  // 3. Word starts with query (e.g. "Blossom" in "Cherry Blossom")
  const words = t.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith(q)) {
      return 600 + (q.length / words[i].length) * 50 - i * 10;
    }
  }

  // 4. Substring anywhere in target
  const subIndex = t.indexOf(q);
  if (subIndex !== -1) {
    return 400 - subIndex * 5;
  }

  // 5. Fuzzy subsequence match (e.g. "notebk" in "notebook hours")
  let qIdx = 0;
  let tIdx = 0;
  let score = 0;
  let consecutive = 0;
  let firstMatchIdx = -1;
  let lastMatchIdx = -1;

  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      if (firstMatchIdx === -1) firstMatchIdx = tIdx;
      lastMatchIdx = tIdx;

      let charScore = 10;
      // Word start bonus
      if (tIdx === 0 || t[tIdx - 1] === ' ') {
        charScore += 15;
      }
      // Consecutive character bonus
      if (consecutive > 0) {
        charScore += consecutive * 8;
      }
      consecutive++;
      score += charScore;
      qIdx++;
    } else {
      consecutive = 0;
    }
    tIdx++;
  }

  if (qIdx === q.length) {
    // Penalize spread / distance
    const span = lastMatchIdx - firstMatchIdx + 1;
    const compactness = Math.max(0, 50 - (span - q.length) * 2);
    return Math.max(50, score + compactness);
  }

  // 6. Typo / fuzzy distance against individual words
  for (const word of words) {
    if (word.length >= 3 && q.length >= 3) {
      const dist = levenshteinDistance(q, word.slice(0, Math.min(word.length, q.length + 1)));
      const maxAllowed = q.length <= 4 ? 1 : 2;
      if (dist <= maxAllowed) {
        return Math.max(20, 100 - dist * 35);
      }
    }
  }

  return 0;
}

/**
 * Searches and ranks wallpaper templates by name, collection and contextual keywords.
 * Sorts from highest score (most relevant) to lowest score (least relevant).
 */
export function searchWallpaperTemplates(templates, query) {
  if (!Array.isArray(templates)) return [];
  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) {
    return templates;
  }

  const scored = [];
  for (const template of templates) {
    const title = template.name || template.title || '';
    const categories = galleryCategories.filter(category => category.id !== 'all' && matchesGalleryCategory(template, category.id));
    const categoryTerms = [template.collection, template.mascotStyle === 'pixel' ? 'pixel art' : template.mascotStyle, ...categories.flatMap(category => [category.id.replaceAll('-', ' '), category.name, ...(category.searchTerms || [])])];
    let score = Math.max(scoreSearchPattern(trimmed, title), ...categoryTerms.map(term => scoreSearchPattern(trimmed, term) * 0.8));
    const keywords = (template.keywords ?? (template.collection === 'genshin' ? genshinKeywords(template) : '')).split(',').map(term => term.trim()).filter(Boolean);
    if (keywords.length) {
      const words = normalizeSearchText([title, template.description, template.family, ...categoryTerms, ...keywords].filter(Boolean).join(' ')).split(/\s+/);
      const matchesContext = normalizeSearchText(trimmed).split(/\s+/).every(token => words.some(word => word.startsWith(token) || token === `${word}s`));
      if (matchesContext) score = Math.max(score, 300);
    }
    if (score > 0) {
      scored.push({ template, score });
    }
  }

  // Sort most to least
  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.template);
}
