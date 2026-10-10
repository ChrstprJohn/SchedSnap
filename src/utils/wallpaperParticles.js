export const particleStyles = [
  { value: 'auto', label: 'Design default' },
  { value: 'none', label: 'None' },
  { value: 'hearts', label: 'Hearts' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'stars', label: 'Stars' },
  { value: 'paws', label: 'Paw prints' },
  { value: 'petals', label: 'Petals' },
  { value: 'bubbles', label: 'Bubbles' },
];
const motifs = {
  hearts: ['heart', 'heart', 'dot'],
  sparkles: ['sparkle', 'dot', 'sparkle'],
  stars: ['star', 'dot', 'star'],
  paws: ['paw', 'dot', 'paw'],
  petals: ['petal', 'petal', 'dot'],
  bubbles: ['bubble', 'dot', 'bubble'],
};

export function layoutParticles(template, art, scheduleBounds, width = 1080, height = 2400) {
  if (!art || template.particleStyle === 'none') return [];
  let seed = 2166136261;
  for (const char of template.id || template.mascot || 'wallpaper') seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const keys = Object.keys(motifs);
  const kinds = motifs[template.particleStyle] || motifs[keys[seed % keys.length]];
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const points = [[-0.1, 0.24], [0.2, -0.1], [0.7, -0.06], [1.08, 0.26], [-0.06, 0.68], [1.06, 0.74]];
  const count = 4 + seed % 3;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const size = Math.max(8, Math.min(art.width, art.height) * (0.024 + random() * 0.016));
    const padding = size * 2 + 8;
    const x = Math.max(padding, Math.min(width - padding, art.x + (points[i][0] + (random() - 0.5) * 0.08) * art.width));
    const y = Math.max(padding, Math.min(height - padding, art.y + (points[i][1] + (random() - 0.5) * 0.08) * art.height));
    const opacity = 0.22 + random() * 0.12;
    if (scheduleBounds && x + padding > scheduleBounds.x && x - padding < scheduleBounds.x + scheduleBounds.width && y + padding > scheduleBounds.y && y - padding < scheduleBounds.y + scheduleBounds.height) continue;
    particles.push({ x, y, size, opacity, kind: kinds[i % kinds.length] });
  }
  return particles;
}

export function drawParticles(ctx, template, art, scheduleBounds, width, height) {
  const particles = layoutParticles(template, art, scheduleBounds, width, height);
  ctx.save(); ctx.fillStyle = template.accent || template.ink; ctx.strokeStyle = ctx.fillStyle;
  for (const { x, y, size: s, opacity, kind } of particles) {
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    if (kind === 'heart') {
      ctx.moveTo(x, y + s);
      ctx.bezierCurveTo(x - s * 2, y - s * 0.2, x - s, y - s * 1.5, x, y - s * 0.3);
      ctx.bezierCurveTo(x + s, y - s * 1.5, x + s * 2, y - s * 0.2, x, y + s);
    } else if (kind === 'star' || kind === 'sparkle') {
      const tips = kind === 'star' ? 5 : 4;
      for (let i = 0; i <= tips * 2; i++) {
        const angle = -Math.PI / 2 + i * Math.PI / tips;
        const radius = s * (i % 2 ? 0.35 : 1);
        const px = x + Math.cos(angle) * radius, py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else if (kind === 'paw') {
      for (const [dx, dy, r] of [[0, 0.35, 0.6], [-0.65, -0.4, 0.3], [0, -0.75, 0.3], [0.65, -0.4, 0.3]]) {
        ctx.moveTo(x + (dx + r) * s, y + dy * s);
        ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
      }
    } else if (kind === 'petal') {
      ctx.moveTo(x - s, y + s);
      ctx.bezierCurveTo(x - s * 0.7, y - s * 1.3, x + s * 1.1, y - s * 1.3, x + s, y - s);
      ctx.bezierCurveTo(x + s * 1.3, y + s * 1.1, x - s * 0.5, y + s * 1.2, x - s, y + s);
    } else {
      ctx.arc(x, y, s * (kind === 'dot' ? 0.35 : 0.8), 0, Math.PI * 2);
    }
    if (kind === 'bubble') { ctx.lineWidth = Math.max(2, s * 0.12); ctx.stroke(); } else ctx.fill();
  }
  ctx.restore();
}
