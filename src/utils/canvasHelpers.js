import { days } from '../../shared/scheduleSchema.js';
import { mobileResolution } from '../assets/templates.js';
import { colorInputValue } from './wallpaperTheme.js';
import { drawParticles } from './wallpaperParticles.js';

export function formatTime(value) {
  if (!value) return 'Time needed';
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function formatWallpaperTime(value) {
  return value ? formatTime(value) : 'Time needed';
}

export function groupSchedule(schedule) {
  const groups = [...days, 'Day needed'].map((day) => ({ day, entries: [] }));
  for (const course of schedule.classes) for (const meeting of course.meetings) {
    const group = groups.find((item) => item.day === (meeting.day || 'Day needed'));
    if (group) group.entries.push({ ...meeting, subject: course.subject || 'Subject needed', courseCode: course.courseCode });
  }
  return groups.filter((group) => group.entries.length).map((group) => ({ ...group, entries: group.entries.sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99')) }));
}

export function findOverlaps(schedule) {
  const warnings = [];
  for (const group of groupSchedule(schedule)) for (let i = 0; i < group.entries.length; i++) for (let j = i + 1; j < group.entries.length; j++) {
    const a = group.entries[i], b = group.entries[j];
    if (a.startTime && a.endTime && b.startTime && b.endTime && a.startTime < b.endTime && b.startTime < a.endTime) warnings.push(`${group.day}: ${a.subject} overlaps with ${b.subject}.`);
  }
  return [...new Set(warnings)];
}

export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    if (ctx.measureText(`${line}${line ? ' ' : ''}${word}`).width <= maxWidth) line += `${line ? ' ' : ''}${word}`;
    else {
      if (line) lines.push(line);
      line = '';
      for (const char of word) {
        if (ctx.measureText(line + char).width > maxWidth && line) { lines.push(line); line = ''; }
        line += char;
      }
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function font(ctx, size, weight = 500, family = 'DM Sans Variable', italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${family}", ${['DM Serif Display', 'Georgia'].includes(family) ? 'serif' : 'sans-serif'}`;
}

export function layoutSchedule(ctx, schedule, template, height = 2400, options = {}) {
  const textFont = (size, weight = 500) => font(ctx, size, weight, template.fontFamily);
  const groups = groupSchedule(schedule);
  const x = 78, width = options.width ?? 924;
  // Keep the leading badge area proportional to the mobile row, even when
  // tablet and laptop cards use a shorter minimum height.
  const badgeScale = Math.min(1, (options.minCardHeight ?? 170) / 170);
  const dayWidth = 160 * badgeScale, dayInset = 14 * badgeScale;
  const dayRadius = 65 * badgeScale;
  const timeWidth = options.timeWidth ?? 276;
  const timeX = x + dayWidth + 26 * badgeScale, subjectX = timeX + timeWidth;
  const roomWidth = options.roomWidth ?? 166, roomX = x + width - 32 - roomWidth;
  const subjectWidth = roomX - subjectX - 22;
  // Reserve the upper part of a portrait lock screen for its clock and date.
  const top = options.top ?? 760;
  const limit = options.limit ?? (template.layout === 'mascot' ? height - 660 : height - 150);
  let result;
  for (let size = 42; size >= 28; size -= 2) {
    const subjectLineHeight = size * 1.2;
    const detailLineHeight = size * 0.65 * 1.25;
    const timeLineHeight = size * 0.65 * 1.3;
    const detailGap = 6, entryGap = size >= 38 ? 20 : 8, groupGap = 16;
    const cardPadding = size >= 38 ? 40 : 28;
    const codeGap = size >= 38 ? 4 : 2;
    const codeLineHeight = size * (size >= 38 ? 1.2 : 1.05), roomLineHeight = size * 0.8 * 1.25;
    const plans = groups.map((group) => {
      const entries = group.entries.map((entry) => {
        const hasCode = Boolean(entry.courseCode?.trim());
        textFont(size, 750);
        const codeLines = hasCode ? wrapText(ctx, entry.courseCode, subjectWidth) : [];
        let subjectSize = hasCode ? size * 0.65 : size;
        const subjectWeight = hasCode ? 500 : 650;
        const subjectText = entry.subject.replace(/\s+/g, ' ').trim();
        const minSubjectSize = subjectSize * 0.8;
        textFont(subjectSize, subjectWeight);
        while (ctx.measureText(subjectText).width > subjectWidth && subjectSize > minSubjectSize) {
          subjectSize = Math.max(minSubjectSize, subjectSize - 1);
          textFont(subjectSize, subjectWeight);
        }
        let fittedSubject = subjectText;
        if (ctx.measureText(fittedSubject).width > subjectWidth) {
          const characters = Array.from(fittedSubject);
          while (characters.length && ctx.measureText(`${characters.join('').trimEnd()}…`).width > subjectWidth) characters.pop();
          fittedSubject = `${characters.join('').trimEnd()}…`;
        }
        const entrySubjectLineHeight = subjectSize * (size >= 38 ? 1.25 : 1.1);
        const subjectLines = [fittedSubject];
        textFont(size * 0.65);
        const detailLines = entry.dateLabel ? wrapText(ctx, entry.dateLabel, subjectWidth) : [];
        textFont(size * 0.8, 650);
        const roomLines = entry.room ? wrapText(ctx, entry.room, roomWidth) : [];
        textFont(size * 0.65);
        const start = formatWallpaperTime(entry.startTime), end = formatWallpaperTime(entry.endTime);
        const range = `${start}–${end}`;
        const timeLines = ctx.measureText(range).width <= timeWidth - 16 ? [range] : [`${start}–`, end];
        const codeHeight = codeLines.length * codeLineHeight;
        const subjectHeight = subjectLines.length * entrySubjectLineHeight;
        const contentHeight = codeHeight + (hasCode ? codeGap : 0) + subjectHeight + (detailLines.length ? detailGap + detailLines.length * detailLineHeight : 0);
        const entryHeight = Math.max(contentHeight, roomLines.length * roomLineHeight, timeLines.length * timeLineHeight);
        return { ...entry, codeLines, subjectLines, detailLines, roomLines, timeLines, subjectSize, entrySubjectLineHeight, contentHeight, codeHeight, subjectHeight, entryHeight };
      });
      const contentHeight = entries.reduce((sum, entry) => sum + entry.entryHeight, 0) + Math.max(0, entries.length - 1) * entryGap;
      return { day: group.day, entries, x, width, height: Math.max(options.minCardHeight ?? 170, contentHeight + cardPadding), contentHeight, dayWidth, dayInset, dayRadius, timeWidth, timeX, subjectX, subjectWidth, roomX, roomWidth };
    });
    // Cards keep their own height, while the mascot has a fixed protected footer.
    // Reduce text only within this bounded range; never resize art or drop meetings.
    let bottom = top;
    for (const plan of plans) {
      plan.y = bottom;
      let entryY = plan.y + (plan.height - plan.contentHeight) / 2;
      for (const entry of plan.entries) {
        entry.y = entryY;
        entry.codeY = entryY + (entry.entryHeight - entry.contentHeight) / 2;
        entry.subjectY = entry.codeY + entry.codeHeight + (entry.codeLines.length ? codeGap : 0);
        entry.timeY = entryY + (entry.entryHeight - entry.timeLines.length * timeLineHeight) / 2;
        entry.roomY = entryY + (entry.entryHeight - entry.roomLines.length * roomLineHeight) / 2;
        entry.detailY = entry.subjectY + entry.subjectHeight + detailGap;
        entry.bottom = entryY + entry.entryHeight;
        entryY = entry.bottom + entryGap;
      }
      bottom += plan.height + groupGap;
    }
    bottom = plans.length ? bottom - groupGap : top;
    result = { plans, size, bottom, subjectLineHeight, codeLineHeight, roomLineHeight, detailLineHeight, timeLineHeight, overflow: bottom > limit };
    if (!result.overflow) return result;
  }
  // A full week may need the earlier card start to preserve all meetings and
  // the protected character footer; the phone heading still stays below its clock.
  if (result.overflow && options.top === undefined) return layoutSchedule(ctx, schedule, template, height, { ...options, top: 680 });
  return result;
}

function rectangle(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function drawBackground(ctx, template, image, width = 1080, height = 2400) {
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  if (image && template.layout !== 'mascot') {
    const scale = Math.max(width / image.width, height / image.height);
    const imageWidth = image.width * scale, imageHeight = image.height * scale;
    ctx.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
  }
  if (template.overlay) { ctx.fillStyle = template.overlay; ctx.fillRect(0, 0, width, height); }
  if (template.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    template.gradient.forEach((color, i) => gradient.addColorStop(i / (template.gradient.length - 1), color));
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  }
  if (template.pattern === 'checker') {
    ctx.fillStyle = template.patternColor;
    for (let row = -1; row < Math.ceil(height / 220) + 1; row++) for (let col = -1; col < Math.ceil(width / 220) + 1; col++) if ((row + col) % 2 === 0) {
      const x = col * 220, y = row * 220, bend = row % 2 ? 24 : -24;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 70, y + bend, x + 150, y - bend, x + 220, y);
      ctx.bezierCurveTo(x + 220 + bend, y + 70, x + 220 - bend, y + 150, x + 220, y + 220);
      ctx.bezierCurveTo(x + 150, y + 220 - bend, x + 70, y + 220 + bend, x, y + 220);
      ctx.bezierCurveTo(x - bend, y + 150, x + bend, y + 70, x, y); ctx.fill();
    }
  }
  if (template.pattern === 'grid' || template.pattern === 'ruled') {
    ctx.save(); ctx.globalAlpha = 0.22; ctx.strokeStyle = template.patternColor || template.line; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y = 0; y < height; y += 64) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    if (template.pattern === 'grid') for (let x = 0; x < width; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    ctx.stroke(); ctx.restore();
  }
  if (template.pattern === 'circle') { ctx.fillStyle = template.patternColor || '#ad5b45'; ctx.beginPath(); ctx.arc(width - 30, 200, 420, 0, Math.PI * 2); ctx.fill(); }
  if (template.pattern === 'dots') {
    ctx.fillStyle = template.patternColor;
    for (let y = 36; y < height; y += 72) for (let x = 36; x < width; x += 72) {
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (template.pattern === 'stripes') {
    ctx.fillStyle = template.patternColor;
    for (let x = 0; x < width; x += 180) ctx.fillRect(x, 0, 70, height);
  }
  if (template.pattern === 'diamonds') {
    ctx.fillStyle = template.patternColor;
    for (let y = 0; y <= height + 180; y += 180) for (let x = 0; x <= width + 180; x += 180) {
      ctx.beginPath(); ctx.moveTo(x, y - 72); ctx.lineTo(x + 72, y);
      ctx.lineTo(x, y + 72); ctx.lineTo(x - 72, y); ctx.lineTo(x, y - 72); ctx.fill();
    }
  }
  if (template.pattern === 'waves') {
    ctx.strokeStyle = template.patternColor; ctx.lineWidth = 3;
    for (let y = -60; y < height + 110; y += 110) {
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < width; x += 360) ctx.bezierCurveTo(x + 120, y - 55, x + 240, y + 55, x + 360, y);
      ctx.stroke();
    }
  }
}

function drawHeading(ctx, template, y = 650, width = 1080) {
  ctx.save();
  ctx.fillStyle = template.ink; ctx.textAlign = 'center';
  font(ctx, 88, 750, template.fontFamily);
  const title = template.scheduleTitle?.trim() || 'Class Schedule';
  for (let size = 86; size >= 24 && ctx.measureText(title).width > width - 156; size -= 2) font(ctx, size, 750, template.fontFamily);
  ctx.fillText(title, width / 2, y, width - 156);
  ctx.restore();
}

const initialDays = { Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'TH', Friday: 'F', Saturday: 'SA', Sunday: 'SU', 'Day needed': '?' };
function drawMascotFooter(ctx, template, image) {
  // Normalize occupied animal bounds, not its transparent padding. Every animal
  // gets the same 620px display size, independent of the number of meetings.
  if (image) {
    const bounds = image.mascotBounds || { x: 0, y: 0, width: image.width, height: image.height };
    const scale = 620 / Math.max(bounds.width, bounds.height);
    const width = bounds.width * scale, height = bounds.height * scale;
    const x = template.mascotSide === 'right' ? 1080 - width : 0;
    ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, x, 2400 - height, width, height);
    return { x, y: 2400 - height, width, height };
  }

}

function frostedBackdrop(ctx, template) {
  if (template.containerStyle === 'solid' || template.containerFill === false || !ctx.canvas?.ownerDocument || !ctx.getTransform) return null;
  const snapshot = ctx.canvas.ownerDocument.createElement('canvas');
  snapshot.width = ctx.canvas.width; snapshot.height = ctx.canvas.height;
  const target = snapshot.getContext('2d');
  if (!target) return null;
  // Blur the backdrop once, then reuse it under each card; text is drawn later.
  const scale = Math.abs(ctx.getTransform().a);
  target.filter = `blur(${Math.max(1, 18 * scale)}px)`;
  target.drawImage(ctx.canvas, 0, 0);
  return snapshot;
}

function glassColor(color, opacity) {
  const hex = colorInputValue(color);
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `rgba(${channels.join(',')},${opacity})`;
}

function drawGlassCard(ctx, template, plan, radius, backdrop) {
  const matrix = ctx.getTransform();
  const ink = colorInputValue(template.ink);
  const brightText = [1, 3, 5].reduce((sum, offset) => sum + parseInt(ink.slice(offset, offset + 2), 16), 0) / 3 > 160;
  const tint = brightText ? template.background : template.surface;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(plan.x, plan.y, plan.width, plan.height, radius); ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(backdrop, 0, 0);
  ctx.setTransform(matrix);
  const frost = ctx.createLinearGradient(plan.x, plan.y, plan.x, plan.y + plan.height);
  frost.addColorStop(0, glassColor(tint, brightText ? 0.76 : 0.66));
  frost.addColorStop(0.45, glassColor(tint, brightText ? 0.62 : 0.38));
  frost.addColorStop(1, glassColor(tint, brightText ? 0.7 : 0.5));
  ctx.fillStyle = frost; ctx.fillRect(plan.x, plan.y, plan.width, plan.height);
  ctx.restore();
  if (template.containerBorder !== false) {
    ctx.save();
    ctx.shadowColor = 'rgba(15,23,42,0.12)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    rectangle(ctx, plan.x, plan.y, plan.width, plan.height, radius, undefined, template.line);
    ctx.shadowColor = 'transparent';
    const rim = ctx.createLinearGradient(plan.x, plan.y, plan.x, plan.y + plan.height);
    rim.addColorStop(0, 'rgba(255,255,255,0.82)'); rim.addColorStop(1, 'rgba(255,255,255,0.12)');
    rectangle(ctx, plan.x + 1.5, plan.y + 1.5, plan.width - 3, plan.height - 3, Math.max(0, radius - 1.5), undefined, rim);
    ctx.restore();
  }
}

function drawScheduleCards(ctx, template, layout) {
  const textFont = (size, weight = 500) => font(ctx, size, weight, template.fontFamily);
  const backdrop = frostedBackdrop(ctx, template);
  for (const plan of layout.plans) {
    const radius = template.containerShape === 'rounded' ? 22 : plan.height / 2;
    if (backdrop) drawGlassCard(ctx, template, plan, radius, backdrop);
    else rectangle(ctx, plan.x, plan.y, plan.width, plan.height, radius, template.containerFill === false ? undefined : template.surface, template.containerBorder === false ? undefined : template.line);
    const dayX = plan.x + plan.dayWidth / 2 + plan.dayInset, dayY = plan.y + plan.height / 2;
    ctx.save(); ctx.fillStyle = template.ink; ctx.globalAlpha = 0.1;
    const badgeRadius = Math.min(plan.dayRadius, (plan.height - 28) / 2);
    ctx.beginPath(); ctx.arc(dayX, dayY, badgeRadius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.textAlign = 'center'; ctx.fillStyle = template.ink;
    textFont((initialDays[plan.day].length > 1 ? 44 : 58) * badgeRadius / 65, 750);
    ctx.save();
    const dayLabel = initialDays[plan.day];
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText(dayLabel);
    if (Number.isFinite(metrics.actualBoundingBoxAscent) && Number.isFinite(metrics.actualBoundingBoxDescent)) {
      const inkCenter = Number.isFinite(metrics.actualBoundingBoxLeft) && Number.isFinite(metrics.actualBoundingBoxRight)
        ? (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2 : metrics.width / 2;
      const baseline = dayY + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      ctx.fillText(dayLabel, dayX - inkCenter, baseline);
    } else {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(dayLabel, dayX, dayY);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.save();
    ctx.textBaseline = 'top';
    for (const [index, entry] of plan.entries.entries()) {
      const subjectCenter = plan.subjectX + plan.subjectWidth / 2;
      ctx.textAlign = 'center'; ctx.fillStyle = template.ink; textFont(layout.size, 750);
      entry.codeLines.forEach((line, i) => ctx.fillText(line, subjectCenter, entry.codeY + i * layout.codeLineHeight));
      textFont(entry.subjectSize, entry.codeLines.length ? 500 : 650);
      entry.subjectLines.forEach((line, i) => ctx.fillText(line, subjectCenter, entry.subjectY + i * entry.entrySubjectLineHeight));
      ctx.fillStyle = template.muted; textFont(layout.size * 0.65);
      entry.detailLines.forEach((line, i) => ctx.fillText(line, subjectCenter, entry.detailY + i * layout.detailLineHeight));
      ctx.textAlign = 'center';
      entry.timeLines.forEach((line, i) => ctx.fillText(line, plan.timeX + (plan.timeWidth - 16) / 2, entry.timeY + i * layout.timeLineHeight));
      ctx.textAlign = 'center'; ctx.fillStyle = template.ink; textFont(layout.size * 0.8, 650);
      entry.roomLines.forEach((line, i) => ctx.fillText(line, plan.roomX + plan.roomWidth / 2, entry.roomY + i * layout.roomLineHeight));
      if (template.showSeparators === true && index < plan.entries.length - 1) {
        const separatorY = (entry.bottom + plan.entries[index + 1].y) / 2;
        ctx.strokeStyle = template.line; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(plan.timeX, separatorY); ctx.lineTo(plan.x + plan.width - 24, separatorY); ctx.stroke();
      }
    }
    ctx.restore();
  }
  if (backdrop) { backdrop.width = 0; backdrop.height = 0; }
}

export function schedulePosition(template) {
  if (template.device === 'laptop') {
    if (template.layout !== 'mascot') return 'center';
    if (['left', 'right'].includes(template.schedulePosition)) return template.schedulePosition;
    return template.mascotSide === 'left' ? 'right' : 'left';
  }
  if (['left', 'center', 'right'].includes(template.schedulePosition)) return template.schedulePosition;
  if (template.layout !== 'mascot') return 'center';
  return ['left', 'center', 'right'][(Number(template.edition || 1) - 1) % 3];
}

function drawDeviceWallpaper(canvas, { schedule, template, resolution, backgroundImage }) {
  // Use a stable design coordinate system for thumbnails and full-size exports.
  const width = 1920, height = width * resolution.height / resolution.width;
  canvas.width = resolution.width; canvas.height = resolution.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create the wallpaper preview.');
  ctx.scale(resolution.width / width, resolution.width / width);
  ctx.textBaseline = 'alphabetic';
  drawBackground(ctx, template, backgroundImage, width, height);
  const landscape = width > height;
  const hasCharacter = template.layout === 'mascot';
  const position = schedulePosition({ ...template, device: resolution.id });
  const columnWidth = width * (landscape ? 0.65 : 0.9);
  const availableHeight = height * (landscape ? 0.88 : hasCharacter ? 0.62 : 0.82);
  const count = groupSchedule(schedule).length;
  const designWidth = 1400;
  const layoutOptions = { top: 180, width: 1244, timeWidth: 310, roomWidth: 210, minCardHeight: 130 };
  let scale = Math.min(columnWidth / designWidth, availableHeight / (240 + count * 146));
  const logicalHeight = availableHeight / scale;
  let layout = layoutSchedule(ctx, schedule, template, logicalHeight, { ...layoutOptions, limit: logicalHeight - 60 });
  if (layout.overflow) {
    const expanded = layoutSchedule(ctx, schedule, template, 10000, { ...layoutOptions, limit: 9940 });
    const fittedScale = Math.min(columnWidth / designWidth, availableHeight / (expanded.bottom + 60));
    // Keep every meeting and reject overcrowded schedules before text becomes tiny.
    if (!expanded.overflow && fittedScale >= 0.42) { scale = fittedScale; layout = expanded; }
  }
  const contentHeight = (layout.bottom + 60) * scale;
  const margin = width * 0.05;
  const columnX = position === 'left' ? margin : position === 'right' ? width - columnWidth - margin : (width - columnWidth) / 2;
  const x = columnX + (columnWidth - designWidth * scale) / 2;
  const y = landscape ? (height - contentHeight) / 2 : height * 0.16;
  const scheduleBounds = { x: x + 78 * scale, y, width: layoutOptions.width * scale, height: contentHeight };
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  drawHeading(ctx, template, 100, designWidth);
  if (layout.overflow) { ctx.fillStyle = template.ink; font(ctx, 32, 600, template.fontFamily); ctx.fillText('Your schedule needs more room.', 90, 400); }
  else drawScheduleCards(ctx, template, layout);
  ctx.restore();
  let art;
  if (hasCharacter && backgroundImage && !layout.overflow) {
    const bounds = backgroundImage.mascotBounds || { x: 0, y: 0, width: backgroundImage.width, height: backgroundImage.height };
    const maxWidth = width * (landscape ? position === 'center' ? 0.14 : 0.23 : 0.5);
    const maxHeight = landscape ? height * 0.58 : Math.min(height * 0.32, height * 0.965 - (scheduleBounds.y + scheduleBounds.height) - height * 0.025);
    const artScale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
    const artWidth = bounds.width * artScale, artHeight = bounds.height * artScale;
    // Portrait artwork follows its mobile corner; landscape artwork sits
    // opposite the schedule. Anchor occupied bounds to the canvas edges.
    const right = landscape
      ? position === 'left' || (position === 'center' && template.mascotSide === 'right')
      : template.mascotSide === 'right';
    const artX = right ? width - artWidth : 0;
    const artY = height - artHeight;
    art = { x: artX, y: artY, width: artWidth, height: artHeight };
    ctx.drawImage(backgroundImage, bounds.x, bounds.y, bounds.width, bounds.height, artX, artY, artWidth, artHeight);
    drawParticles(ctx, template, art, scheduleBounds, width, height);
  }
  return { ...layout, scheduleBounds, art, position };
}

export function drawWallpaper(canvas, { schedule, template, resolution = mobileResolution, backgroundImage }) {
  if (resolution.id === 'tablet' || resolution.id === 'laptop') return drawDeviceWallpaper(canvas, { schedule, template, resolution, backgroundImage });
  canvas.width = resolution.width; canvas.height = resolution.height;
  const ctx = canvas.getContext('2d');
  const textFont = (size, weight = 500) => font(ctx, size, weight, template.fontFamily);
  if (!ctx) throw new Error('Your browser could not create the wallpaper preview.');
  ctx.scale(resolution.width / 1080, resolution.height / 2400);
  ctx.textBaseline = 'alphabetic';
  drawBackground(ctx, template, backgroundImage);
  const layout = layoutSchedule(ctx, schedule, template);
  drawHeading(ctx, template);
  if (layout.overflow) {
    ctx.fillStyle = template.ink; textFont(38, 600); ctx.fillText('Your schedule needs more room.', 90, 1060);
    textFont(28); ctx.fillText('Shorten subject names or reduce the details.', 90, 1120);
    return layout;
  }
  drawScheduleCards(ctx, template, layout);
  if (template.layout === 'mascot') {
    const art = drawMascotFooter(ctx, template, backgroundImage);
    if (art && ctx.bezierCurveTo) drawParticles(ctx, template, art, { x: 78, y: 460, width: 924, height: layout.bottom - 460 });
  }
  return layout;
}

export function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export the wallpaper. Please try again.')), 'image/png'));
}
