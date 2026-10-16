import { z } from 'zod';
import { generatedMasterUrl, generatedBackgroundUrl } from './generatedArtwork.js';
const color = z.string().max(60).regex(/^(#[a-f0-9]{3,8}|rgba?\([\d.,%\s]+\))$/i);
const artwork = z.string().max(500).refine(value => /^\/wallpapers\/[a-z0-9/_.-]+$/i.test(value) || /^\/images\/(mascots|pixel-mascots|goofy-mascots|doodle-mascots)\/masters\/[a-z0-9_-]+\.png$/i.test(value) || generatedMasterUrl.test(value) || generatedBackgroundUrl.test(value) || /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?:v\d+\/)?schedsnap\/admin\/artwork\/[a-z0-9_-]+\.(png|jpg|webp)$/i.test(value), 'Use uploaded artwork.');
export const templateSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  name: z.string().trim().min(1, 'Enter a title for this design.').max(80), description: z.string().max(240).optional(),
  keywords: z.string().trim().max(500, 'Keep keywords under 500 characters.').optional(),
  status: z.enum(['draft', 'published', 'hidden']),
  createdAt: z.iso.datetime().optional(), publishedAt: z.iso.datetime().optional(),
  collection: z.enum(['scenic', 'sanrio', 'snoopy', 'genshin', 'hunter-x-hunter', 'we-bare-bears', 'domo', 'adventure-time', 'chiikawa', 'chikawa', 'ghibli', 'mascot', 'meep', 'little-friends', 'pattern', 'original']).optional(),
  mobileOnly: z.boolean().optional(),
  family: z.string().max(80).optional(),
  background: color, ink: color, muted: color, surface: color, line: color,
  headingInk: color.optional(),
  image: artwork.optional(), deviceImages: z.object({ mobile: artwork.optional(), tablet: artwork.optional(), laptop: artwork.optional() }).optional(),
  layout: z.literal('mascot').optional(), mascot: z.string().max(80).optional(), mascotSide: z.enum(['left', 'right']).optional(),
  mascotStyle: z.enum(['soft', 'pixel', 'goofy', 'doodle']).optional(), pixelArt: z.boolean().optional(),
  mascotPosition: z.enum(['left', 'center', 'right']).optional(),
  edition: z.union([z.number(), z.string().max(30)]).optional(),
  pattern: z.enum(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame']).optional(),
  patternColor: color.optional(), gradient: z.array(color).min(2).max(6).optional(), overlay: color.optional(),
  fontFamily: z.enum(['DM Sans Variable', 'Geist Variable', 'Poppins', 'Inter Variable', 'Roboto Variable', 'Open Sans Variable', 'Montserrat Variable', 'Lato', 'DM Serif Display', 'Georgia', 'Quicksand', 'Nunito', 'Itim', 'Fredoka', 'Baloo 2', 'Patrick Hand']).optional(),
  fontScale: z.number().min(0.7).max(1.6).optional(),
  showTitle: z.boolean().optional(),
  showScheduleTitle: z.boolean().optional(), artworkFooter: z.boolean().optional(),
  scheduleLayout: z.enum(['stacked', 'grouped-list', 'day-columns', 'day-cards', 'timeline', 'weekly']).optional(),
  containerStyle: z.enum(['glass', 'solid']).optional(), containerShape: z.enum(['pill', 'rounded']).optional(),
  containerRadius: z.number().min(0).max(50).optional(),
  containerFill: z.boolean().optional(), containerBorder: z.boolean().optional(), showSeparators: z.boolean().optional(),
  tabletBoxSpacing: z.number().min(0).max(300).optional(),
  schedulePosition: z.enum(['left', 'center', 'right']).optional(), orientation: z.enum(['portrait', 'landscape']).optional(),
  topMargin: z.number().min(0).max(20).optional(), bottomMargin: z.number().min(0).max(20).optional(),
  leftMargin: z.number().min(0).max(20).optional(), rightMargin: z.number().min(0).max(20).optional(),
  leftMarginEnabled: z.boolean().optional(), rightMarginEnabled: z.boolean().optional(),
  horizontalPosition: z.number().min(-100).max(100).optional(), verticalPosition: z.number().min(-100).max(100).optional(),
  particleStyle: z.enum(['auto', 'none', 'hearts', 'sparkles', 'stars', 'paws', 'petals', 'bubbles']).optional(),
}).superRefine((t, ctx) => {
  if (t.status !== 'published') return;
  if (t.layout === 'mascot' && !t.image) ctx.addIssue({ code: 'custom', message: 'Upload a character image.', path: ['image'] });
  if (t.layout !== 'mascot' && !t.pattern && (t.image || t.deviceImages || t.collection === 'scenic')) {
    const devices = t.mobileOnly ? ['mobile'] : ['mobile', 'tablet', 'laptop'];
    const variants = devices.map(device => t.deviceImages?.[device]);
    if (!t.image || variants.some(value => !value) || new Set(variants).size !== devices.length || t.image !== t.deviceImages?.mobile) ctx.addIssue({ code: 'custom', message: t.mobileOnly ? 'Add a matching mobile background to publish.' : 'Add a mobile, tablet, and laptop background to publish. You can save a draft while uploading.', path: ['deviceImages'] });
  }
});
