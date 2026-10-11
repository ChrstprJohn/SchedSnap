import { z } from 'zod';
const color = z.string().max(60).regex(/^(#[a-f0-9]{3,8}|rgba?\([\d.,%\s]+\))$/i);
const artwork = z.string().max(500).refine(value => /^\/wallpapers\/[a-z0-9/_.-]+$/i.test(value) || /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?:v\d+\/)?schedsnap\/admin\/artwork\/[a-z0-9_-]+\.(png|jpg|webp)$/i.test(value), 'Use uploaded artwork.');
export const templateSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  name: z.string().trim().min(1, 'Enter a title for this design.').max(80), description: z.string().max(240).optional(),
  status: z.enum(['draft', 'published', 'hidden']),
  collection: z.enum(['scenic', 'mascot', 'little-friends', 'pattern', 'original']).optional(),
  family: z.string().max(80).optional(),
  background: color, ink: color, muted: color, surface: color, line: color,
  image: artwork.optional(), deviceImages: z.object({ mobile: artwork.optional(), tablet: artwork.optional(), laptop: artwork.optional() }).optional(),
  layout: z.literal('mascot').optional(), mascot: z.string().max(80).optional(), mascotSide: z.enum(['left', 'right']).optional(),
  edition: z.union([z.number(), z.string().max(30)]).optional(),
  pattern: z.enum(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame']).optional(),
  patternColor: color.optional(), gradient: z.array(color).min(2).max(6).optional(), overlay: color.optional(),
  fontFamily: z.enum(['DM Sans Variable', 'Geist Variable', 'Poppins', 'Inter Variable', 'Roboto Variable', 'Open Sans Variable', 'Montserrat Variable', 'Lato', 'DM Serif Display', 'Georgia']).optional(),
  containerStyle: z.enum(['glass', 'solid']).optional(), containerShape: z.enum(['pill', 'rounded']).optional(),
  containerFill: z.boolean().optional(), containerBorder: z.boolean().optional(), showSeparators: z.boolean().optional(),
  schedulePosition: z.enum(['left', 'center', 'right']).optional(), orientation: z.enum(['portrait', 'landscape']).optional(),
  particleStyle: z.enum(['auto', 'none', 'hearts', 'sparkles', 'stars', 'paws', 'petals', 'bubbles']).optional(),
}).superRefine((t, ctx) => {
  if (t.status !== 'published') return;
  if (t.layout === 'mascot' && !t.image) ctx.addIssue({ code: 'custom', message: 'Upload a character image.', path: ['image'] });
  if (t.layout !== 'mascot' && (t.image || t.deviceImages || t.collection === 'scenic')) {
    const variants = ['mobile', 'tablet', 'laptop'].map(device => t.deviceImages?.[device]);
    if (!t.image || variants.some(value => !value) || new Set(variants).size !== 3 || t.image !== t.deviceImages?.mobile) ctx.addIssue({ code: 'custom', message: 'Add a mobile, tablet, and laptop background to publish. You can save a draft while uploading.', path: ['deviceImages'] });
  }
});
