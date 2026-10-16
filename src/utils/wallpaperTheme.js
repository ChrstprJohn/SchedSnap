export const wallpaperFonts = [
  { value: 'DM Sans Variable', label: 'DM Sans' },
  { value: 'Geist Variable', label: 'Geist' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Inter Variable', label: 'Inter' },
  { value: 'Roboto Variable', label: 'Roboto' },
  { value: 'Open Sans Variable', label: 'Open Sans' },
  { value: 'Montserrat Variable', label: 'Montserrat' },
  { value: 'Lato', label: 'Lato' },
  { value: 'DM Serif Display', label: 'DM Serif Display' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Quicksand', label: 'Quicksand · rounded' },
  { value: 'Nunito', label: 'Nunito · soft' },
  { value: 'Itim', label: 'Itim · handwritten' },
  { value: 'Fredoka', label: 'Fredoka · playful' },
  { value: 'Baloo 2', label: 'Baloo 2 · bubbly' },
  { value: 'Patrick Hand', label: 'Patrick Hand · handwritten' },
];

export function wallpaperFontScale(template) {
  const value = Number(template.fontScale ?? 1);
  return Number.isFinite(value) ? Math.min(1.6, Math.max(1, value)) : 1;
}

export function snapSchedulePosition(value, dragging = false, defaultValue = 0) {
  return dragging && Math.abs(value - defaultValue) <= 5 ? defaultValue : value;
}

export function mascotPosition(template) {
  return ['left', 'center', 'right'].includes(template.mascotPosition) ? template.mascotPosition : template.mascotSide === 'right' ? 'right' : 'left';
}

export function galleryPreviewTemplate(template) {
  // Samples share one placement so artwork can be compared across designs.
  return { ...template, topMargin: 0, bottomMargin: 0, leftMargin: 0, rightMargin: 0,
    leftMarginEnabled: false, rightMarginEnabled: false, horizontalPosition: 0,
    // The close-up face needs its composed schedule placement in thumbnails too.
    verticalPosition: ['ghibli-closeup', 'wbb-minimal', 'reference-minimal', 'chibi-elemental'].includes(template.family) ? template.verticalPosition ?? 0 : 0 };
}

export function customizeWallpaperTemplate(template, settings = {}, device = template?.device) {
  if (!template) return template;
  const tabletPortrait = device === 'tablet';
  if (!tabletPortrait && (template.collection !== 'genshin' || template.containerStyle === 'glass') && !Object.keys(settings).length) return template;
  const defaults = { ...(template.collection === 'genshin' ? { containerStyle: 'glass' } : {}), ...(tabletPortrait ? { schedulePosition: 'center', containerStyle: 'glass', tabletBoxSpacing: 80 } : {}) };
  // Device defaults precede the user's explicit appearance choices.
  const customized = { ...template, ...defaults, ...settings };
  if (tabletPortrait) customized.orientation = 'portrait';
  if (settings.ink) customized.muted = settings.ink;
  // Full wallpaper artwork is fixed; animal cutouts and native patterns are separate.
  if (template.image && template.layout !== 'mascot') {
    customized.background = template.background;
  } else if (settings.background) {
    customized.gradient = undefined;
  }
  return customized;
}

export function colorInputValue(value) {
  if (!value) return '#ffffff';
  if (/^#[0-9a-f]{6}/i.test(value)) return value.slice(0, 7).toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  const channels = value?.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return channels ? `#${channels.slice(1).map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`.toLowerCase() : '#ffffff';
}
