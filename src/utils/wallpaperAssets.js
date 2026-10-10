const images = new Map();
let fonts;

function mascotBounds(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return undefined;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
  let left = image.width, top = image.height, right = -1, bottom = -1;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (pixels[(y * image.width + x) * 4 + 3] > 32) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  canvas.width = 0; canvas.height = 0;
  return right >= left ? { x: left, y: top, width: right - left + 1, height: bottom - top + 1 } : undefined;
}

export async function prepareWallpaperAssets(template, resolution) {
  const imagePath = template.deviceImages?.[resolution?.id || 'mobile'] || template.image;
  fonts ||= Promise.all([
    document.fonts.load('400 100px "Great Vibes"'),
    document.fonts.load('400 100px "DM Serif Display"'),
    document.fonts.load('italic 400 100px "DM Serif Display"'),
    document.fonts.load('600 40px "DM Sans Variable"'),
    document.fonts.load('750 100px "DM Sans Variable"'),
  ]);
  await fonts;
  // Wait for the chosen family before measuring or exporting canvas text.
  if (template.fontFamily) await Promise.all([400, 500, 600, 650, 750].map((weight) =>
    document.fonts.load(`${weight} 100px "${template.fontFamily}"`),
  ));
  if (!imagePath) return undefined;
  if (!images.has(imagePath)) images.set(imagePath, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        if (template.layout === 'mascot') image.mascotBounds = mascotBounds(image);
        resolve(image);
      } catch { images.delete(imagePath); reject(new Error('The mascot artwork could not load. Retry or choose another template.')); }
    };
    image.onerror = () => { images.delete(imagePath); reject(new Error('The template artwork could not load. Retry or choose another template.')); };
    image.src = imagePath;
  }));
  return images.get(imagePath);
}
