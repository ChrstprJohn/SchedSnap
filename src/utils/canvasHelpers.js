import { days } from '../../shared/scheduleSchema.js';
import { mobileResolution } from '../assets/templates.js';
import { colorInputValue, mascotPosition, wallpaperFontScale } from './wallpaperTheme.js';
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
  const timeline = options.timeline === true;
  const compactTimeline = timeline && options.compactTimeline === true;
  const textFont = (size, weight = 500) => font(ctx, size, weight, template.fontFamily);
  const groups = groupSchedule(schedule);
  const x = options.x ?? 78, width = options.width ?? 924;
  // Keep the leading badge area proportional to the mobile row, even when
  // tablet and laptop cards use a shorter minimum height.
  const badgeScale = Math.min(1, (options.minCardHeight ?? 170) / 170);
  const dayWidth = timeline ? 0 : 160 * badgeScale, dayInset = 14 * badgeScale;
  const dayRadius = 65 * badgeScale;
  const timeWidth = options.timeWidth ?? 276;
  const timeX = timeline ? x + (compactTimeline ? 82 : 94) : x + dayWidth + 26 * badgeScale, subjectX = timeX + timeWidth;
  const roomWidth = options.roomWidth ?? 166, roomX = x + width - 32 - roomWidth;
  const subjectWidth = roomX - subjectX - 22;
  // Reserve the upper part of a portrait lock screen for its clock and date.
  const top = options.top ?? 760;
  const limit = options.limit ?? (template.layout === 'mascot' ? height - 660 : timeline ? height * 0.83 : template.collection === 'ghibli' ? height * 0.77 : height - 150);
  let result;
  for (let baseSize = compactTimeline ? 64 : timeline ? 56 : 42; baseSize >= 28; baseSize -= 2) {
    const size = baseSize * wallpaperFontScale(template);
    if (compactTimeline && baseSize > 28) {
      textFont(size * 0.78);
      if (groups.some(group => group.entries.some(entry => [entry.startTime, entry.endTime].some(time => ctx.measureText(formatWallpaperTime(time)).width > timeWidth - 8)))) continue;
    }
    const subjectLineHeight = size * 1.2;
    const detailLineHeight = size * 0.65 * 1.25;
    const timeLineHeight = size * (timeline ? 0.78 : 0.65) * 1.3;
    const detailGap = 6, entryGap = compactTimeline ? options.entryGap ?? 16 : timeline ? 28 : size >= 38 ? 20 : 8;
    const groupGap = timeline ? 16 + (options.groupGap ?? 16) * 0.4 : options.groupGap ?? 16;
    const cardPadding = compactTimeline ? 16 : size >= 38 ? 40 : 28;
    const codeGap = size >= 38 ? 4 : 2;
    const codeLineHeight = size * (size >= 38 ? 1.2 : 1.05), roomLineHeight = size * 0.8 * 1.25;
    const plans = groups.map((group) => {
      const entries = group.entries.map((entry) => {
        const hasCode = Boolean(entry.courseCode?.trim());
        textFont(size, 750);
        const codeLines = hasCode ? wrapText(ctx, entry.courseCode, subjectWidth) : [];
        let subjectSize = hasCode ? size * (timeline ? 0.75 : 0.65) : size;
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
        const timeLines = timeline ? [start, end] : ctx.measureText(range).width <= timeWidth - 16 ? [range] : [`${start}–`, end];
        const codeHeight = codeLines.length * codeLineHeight;
        const subjectHeight = subjectLines.length * entrySubjectLineHeight;
        const contentHeight = codeHeight + (hasCode ? codeGap : 0) + subjectHeight + (detailLines.length ? detailGap + detailLines.length * detailLineHeight : 0);
        const entryHeight = Math.max(contentHeight, roomLines.length * roomLineHeight, timeLines.length * timeLineHeight) + (timeline ? compactTimeline ? 12 : 32 : 0);
        return { ...entry, codeLines, subjectLines, detailLines, roomLines, timeLines, subjectSize, entrySubjectLineHeight, contentHeight, codeHeight, subjectHeight, entryHeight };
      });
      const contentHeight = entries.reduce((sum, entry) => sum + entry.entryHeight, 0) + Math.max(0, entries.length - 1) * entryGap;
      const headerHeight = timeline ? size * 1.35 + (compactTimeline ? 12 : 24) : 0;
      return { day: group.day, entries, x, width, height: Math.max(options.minCardHeight ?? (timeline ? 130 : 170), contentHeight + cardPadding + headerHeight), headerHeight, contentHeight, dayWidth, dayInset, dayRadius, timeWidth, timeX, subjectX, subjectWidth, roomX, roomWidth };
    });
    // Cards keep their own height, while the mascot has a fixed protected footer.
    // Reduce text only within this bounded range; never resize art or drop meetings.
    let bottom = top;
    for (const plan of plans) {
      plan.y = bottom;
      let entryY = plan.y + plan.headerHeight + (plan.height - plan.headerHeight - plan.contentHeight) / 2;
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
    result = { plans, size, bottom, subjectLineHeight, codeLineHeight, roomLineHeight, detailLineHeight, timeLineHeight, ...(timeline ? { limit } : {}), overflow: bottom > limit };
    if (!result.overflow) return result;
  }
  // A full week may need the earlier card start to preserve all meetings and
  // the protected character footer; the phone heading still stays below its clock.
  if (result.overflow && options.top === undefined) return layoutSchedule(ctx, schedule, template, height, { ...options, top: 680 });
  if (result.overflow && timeline && options.limit === undefined && template.layout !== 'mascot') return layoutSchedule(ctx, schedule, template, height, { ...options, limit: height - 150 });
  return result;
}

export function scheduleLayoutOptions(device) {
  return [
    { value: 'stacked', label: 'Stacked days', description: 'One day per row' },
    ...(['tablet', 'laptop'].includes(device) ? [{ value: 'day-cards', label: 'Day cards', description: 'Paired days with a timeline' }] : []),
    ...(['mobile', 'tablet'].includes(device) ? [{ value: 'timeline', label: 'Timeline', description: 'Connected days, clear rows' }] : []),
    ...(device === 'laptop' ? [{ value: 'weekly', label: 'Weekly timetable', description: 'Weekdays and time blocks' }] : []),
  ];
}

export function scheduleLayout(template, device = template.device) {
  return scheduleLayoutOptions(device).some(option => option.value === template.scheduleLayout) ? template.scheduleLayout : 'stacked';
}

// Tablet alternative: paired day cards read left to right, then top to bottom.
// All measurements stay in design coordinates so previews and PNGs agree.
function layoutDayCards(ctx, schedule, template, height, options) {
  const groups = groupSchedule(schedule);
  const gap = options.groupGap;
  const cardWidth = (options.width - gap) / 2;
  let result;
  for (let baseSize = 42; baseSize >= 28; baseSize -= 2) {
    const size = baseSize * wallpaperFontScale(template);
    const padding = 32, headerHeight = size * 1.4 + 36;
    const lineHeight = size * 1.2, smallLineHeight = size * 0.65 * 1.3;
    const plans = groups.map((group, index) => {
      const width = index === groups.length - 1 && groups.length % 2 === 1 ? options.width : cardWidth;
      const subjectWidth = width - padding * 2 - 48 - 154;
      const entries = group.entries.map(entry => {
        font(ctx, size, 750, template.fontFamily);
        const codeLines = entry.courseCode?.trim() ? wrapText(ctx, entry.courseCode, subjectWidth) : [];
        const subjectSize = size * (codeLines.length ? 0.65 : 1);
        font(ctx, subjectSize, 500, template.fontFamily);
        const subject = entry.subject.replace(/\s+/g, ' ').trim();
        let fittedSize = subjectSize;
        while (ctx.measureText(subject).width > subjectWidth && fittedSize > subjectSize * 0.8) {
          fittedSize = Math.max(subjectSize * 0.8, fittedSize - 1);
          font(ctx, fittedSize, 500, template.fontFamily);
        }
        const chars = Array.from(subject);
        const truncated = ctx.measureText(subject).width > subjectWidth;
        if (truncated) while (chars.length && ctx.measureText(`${chars.join('')}…`).width > subjectWidth) chars.pop();
        font(ctx, size * 0.65, 500, template.fontFamily);
        const timeLines = wrapText(ctx, `${formatWallpaperTime(entry.startTime)}–${formatWallpaperTime(entry.endTime)}`, width - padding * 2 - 48);
        const detailLines = entry.dateLabel ? wrapText(ctx, entry.dateLabel, subjectWidth) : [];
        font(ctx, size * 0.8, 650, template.fontFamily);
        const roomLines = entry.room ? wrapText(ctx, entry.room, 126) : [];
        const textHeight = codeLines.length * lineHeight + fittedSize * 1.25 + detailLines.length * smallLineHeight;
        const entryHeight = timeLines.length * smallLineHeight + 10 + Math.max(textHeight, roomLines.length * size);
        return { ...entry, codeLines, subjectLines: [chars.join('') + (truncated ? '…' : '')], subjectSize: fittedSize, timeLines, roomLines, detailLines, entryHeight };
      });
      const contentHeight = entries.reduce((sum, entry) => sum + entry.entryHeight, 0) + Math.max(0, entries.length - 1) * 26;
      return { day: group.day, entries, width, height: Math.max(250, headerHeight + contentHeight + padding * 2), headerHeight, subjectWidth };
    });
    let bottom = options.top;
    for (let index = 0; index < plans.length; index += 2) {
      const row = plans.slice(index, index + 2);
      const rowHeight = Math.max(...row.map(plan => plan.height));
      row.forEach((plan, column) => {
        plan.x = 78 + column * (cardWidth + gap); plan.y = bottom; plan.height = rowHeight;
        let entryY = bottom + padding + headerHeight;
        for (const entry of plan.entries) {
          entry.y = entryY; entry.bottom = entryY + entry.entryHeight;
          entryY = entry.bottom + 26;
        }
      });
      bottom += rowHeight + gap;
    }
    bottom = plans.length ? bottom - gap : options.top;
    result = { plans, size, bottom, lineHeight, smallLineHeight, overflow: bottom > (options.limit ?? height) };
    if (!result.overflow) break;
  }
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
  if (template.pattern === 'frame') {
    const inset = Math.min(width, height) * 0.035;
    ctx.save(); ctx.strokeStyle = template.patternColor; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(inset, inset); ctx.lineTo(width - inset, inset);
    ctx.lineTo(width - inset, height - inset); ctx.lineTo(inset, height - inset); ctx.lineTo(inset, inset);
    ctx.stroke(); ctx.restore();
  }
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
  if (template.showTitle === false) return;
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
    const placement = mascotPosition(template);
    const x = placement === 'center' ? (1080 - width) / 2 : placement === 'right' ? 1080 - width : 0;
    ctx.save(); ctx.imageSmoothingEnabled = !template.pixelArt;
    ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, x, 2400 - height, width, height);
    ctx.restore();
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
    textFont((initialDays[plan.day].length > 1 ? 44 : 58) * badgeRadius / 65 * wallpaperFontScale(template), 750);
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

function drawDayCards(ctx, template, layout) {
  const backdrop = frostedBackdrop(ctx, template);
  const card = plan => {
    const radius = template.containerShape === 'rounded' ? 22 : 48;
    if (backdrop) drawGlassCard(ctx, template, plan, radius, backdrop);
    else rectangle(ctx, plan.x, plan.y, plan.width, plan.height, radius, template.containerFill === false ? undefined : template.surface, template.containerBorder === false ? undefined : template.line);
  };
  ctx.save(); ctx.textBaseline = 'top';
  for (const plan of layout.plans) {
    card(plan);
    ctx.fillStyle = template.ink; ctx.textAlign = 'center';
    font(ctx, layout.size, 750, template.fontFamily);
    ctx.fillText(plan.day.toUpperCase(), plan.x + plan.width / 2, plan.y + 32);
    if (plan.entries.length > 1) {
      ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = template.ink; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plan.x + 46, plan.entries[0].y + layout.smallLineHeight / 2);
      ctx.lineTo(plan.x + 46, plan.entries.at(-1).y + layout.smallLineHeight / 2);
      ctx.stroke(); ctx.restore();
    }
    for (const [index, entry] of plan.entries.entries()) {
      const textX = plan.x + 80;
      ctx.textAlign = 'left'; ctx.fillStyle = template.muted;
      font(ctx, layout.size * 0.65, 500, template.fontFamily);
      entry.timeLines.forEach((line, i) => ctx.fillText(line, textX, entry.y + i * layout.smallLineHeight));
      let textY = entry.y + entry.timeLines.length * layout.smallLineHeight + 10;
      ctx.fillStyle = template.ink; font(ctx, layout.size, 750, template.fontFamily);
      entry.codeLines.forEach((line, i) => ctx.fillText(line, textX, textY + i * layout.lineHeight));
      textY += entry.codeLines.length * layout.lineHeight;
      font(ctx, entry.subjectSize, entry.codeLines.length ? 500 : 650, template.fontFamily);
      ctx.fillText(entry.subjectLines[0], textX, textY);
      textY += entry.subjectSize * 1.25;
      font(ctx, layout.size * 0.65, 500, template.fontFamily);
      entry.detailLines.forEach((line, i) => ctx.fillText(line, textX, textY + i * layout.smallLineHeight));
      ctx.textAlign = 'center'; font(ctx, layout.size * 0.8, 650, template.fontFamily);
      const roomX = plan.x + plan.width - 95;
      const roomY = entry.y + (entry.entryHeight - entry.roomLines.length * layout.size) / 2;
      entry.roomLines.forEach((line, i) => ctx.fillText(line, roomX, roomY + i * layout.size));
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = template.ink;
      ctx.beginPath(); ctx.arc(plan.x + 46, entry.y + layout.smallLineHeight / 2, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      if (template.showSeparators && index < plan.entries.length - 1) {
        ctx.strokeStyle = template.line; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(plan.x + 32, entry.bottom + 13); ctx.lineTo(plan.x + plan.width - 32, entry.bottom + 13); ctx.stroke();
      }
    }
  }
  ctx.restore();
  if (backdrop) { backdrop.width = 0; backdrop.height = 0; }
}

function drawTimeline(ctx, template, layout) {
  ctx.save(); ctx.textBaseline = 'top';
  const radius = layout.size * 0.5;
  for (const [index, plan] of layout.plans.entries()) {
    const markerX = plan.x + 26, markerY = plan.y + layout.size * 0.65;
    ctx.strokeStyle = template.ink; ctx.lineWidth = 2.5;
    if (index < layout.plans.length - 1) {
      const next = layout.plans[index + 1];
      ctx.beginPath(); ctx.moveTo(markerX, markerY + radius);
      ctx.lineTo(markerX, next.y + layout.size * 0.65 - radius); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(markerX, markerY, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = template.ink;
    font(ctx, layout.size * 1.3, 650, template.fontFamily);
    ctx.fillText(plan.day, plan.x + 80, plan.y);
    for (const [entryIndex, entry] of plan.entries.entries()) {
      const nextEntry = plan.entries[entryIndex + 1];
      if (nextEntry || index < layout.plans.length - 1) {
        ctx.save(); ctx.strokeStyle = template.line; ctx.globalAlpha = 0.8; ctx.lineWidth = 2;
        const dividerY = nextEntry ? (entry.bottom + nextEntry.y) / 2 : entry.bottom + 12;
        ctx.beginPath(); ctx.moveTo(plan.timeX, dividerY); ctx.lineTo(plan.x + plan.width - 16, dividerY); ctx.stroke(); ctx.restore();
      }
      ctx.fillStyle = template.ink; font(ctx, layout.size, 750, template.fontFamily);
      entry.codeLines.forEach((line, i) => ctx.fillText(line, plan.subjectX, entry.codeY + i * layout.codeLineHeight));
      font(ctx, entry.subjectSize, entry.codeLines.length ? 500 : 650, template.fontFamily);
      entry.subjectLines.forEach((line, i) => ctx.fillText(line, plan.subjectX, entry.subjectY + i * entry.entrySubjectLineHeight));
      ctx.fillStyle = template.muted; font(ctx, layout.size * 0.65, 500, template.fontFamily);
      entry.detailLines.forEach((line, i) => ctx.fillText(line, plan.subjectX, entry.detailY + i * layout.detailLineHeight));
      font(ctx, layout.size * 0.78, 500, template.fontFamily);
      entry.timeLines.forEach((line, i) => ctx.fillText(line, plan.timeX, entry.timeY + i * layout.timeLineHeight));
      ctx.fillStyle = template.ink; font(ctx, layout.size * 0.8, 650, template.fontFamily);
      entry.roomLines.forEach((line, i) => ctx.fillText(line, plan.roomX, entry.roomY + i * layout.roomLineHeight));
    }
  }
  ctx.restore();
}

function layoutWeeklyTimetable(ctx, schedule, template, height, options) {
  const groups = groupSchedule(schedule);
  const activeDays = [...days.slice(0, 5), ...days.slice(5).filter(day => groups.some(group => group.day === day))];
  const minutes = time => time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN;
  const entries = groups.flatMap(group => group.entries.map(entry => ({ ...entry, day: group.day, start: minutes(entry.startTime), end: minutes(entry.endTime) })));
  const valid = entries.filter(entry => Number.isFinite(entry.start) && Number.isFinite(entry.end) && entry.end > entry.start);
  const startMinute = Math.floor(Math.min(...valid.map(entry => entry.start), valid.length ? Infinity : 480) / 60) * 60;
  const endMinute = Math.max(startMinute + 240, Math.ceil(Math.max(...valid.map(entry => entry.end), startMinute + 60) / 60) * 60);
  const bodyHeight = Math.max(720, (endMinute - startMinute) / 60 * (options.hourHeight ?? 100));
  const headerHeight = 76, timeWidth = 150, axisFooter = 24;
  const dayWidth = (options.width - timeWidth) / activeDays.length;
  const gridTop = options.top + headerHeight;
  const plans = activeDays.map((day, index) => ({ day, x: 78 + timeWidth + index * dayWidth, y: options.top, width: dayWidth, height: headerHeight + bodyHeight + axisFooter, entries: [] }));
  let overflow = valid.length !== entries.length, contentOverflow = false;
  for (const plan of plans) {
    const meetings = valid.filter(entry => entry.day === plan.day).sort((a, b) => a.start - b.start || a.end - b.end);
    let cluster = [], laneEnds = [], clusterEnd = -1;
    const finishCluster = () => { for (const meeting of cluster) meeting.lanes = laneEnds.length; cluster = []; laneEnds = []; };
    for (const meeting of meetings) {
      if (meeting.start >= clusterEnd) finishCluster();
      let lane = laneEnds.findIndex(end => end <= meeting.start);
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = meeting.end; meeting.lane = lane; cluster.push(meeting);
      clusterEnd = Math.max(clusterEnd, meeting.end);
    }
    finishCluster();
    for (const meeting of meetings) {
      // Meetings are table cells: fill their day (or overlap lane) and meet
      // exactly at the time boundaries, without floating-card gutters.
      const laneWidth = plan.width / meeting.lanes;
      const box = { x: plan.x + meeting.lane * laneWidth, y: gridTop + (meeting.start - startMinute) / (endMinute - startMinute) * bodyHeight, width: laneWidth, height: (meeting.end - meeting.start) / (endMinute - startMinute) * bodyHeight };
      let fitted;
      for (let baseSize = 42; baseSize >= 28; baseSize -= 2) {
        const size = baseSize * wallpaperFontScale(template), maxWidth = box.width - 24;
        font(ctx, size, 750, template.fontFamily);
        const codeLines = meeting.courseCode?.trim() ? wrapText(ctx, meeting.courseCode, maxWidth) : [];
        const subjectSize = size * (codeLines.length ? 0.72 : 1);
        font(ctx, subjectSize, 500, template.fontFamily);
        const subjectLines = wrapText(ctx, meeting.subject, maxWidth);
        font(ctx, size * 0.7, 500, template.fontFamily);
        const roomLines = meeting.room ? wrapText(ctx, meeting.room, maxWidth) : [];
        const detailLines = meeting.dateLabel ? wrapText(ctx, meeting.dateLabel, maxWidth) : [];
        const subjectGap = codeLines.length ? 6 : 0;
        const detailGap = roomLines.length || detailLines.length ? 8 : 0;
        const contentHeight = codeLines.length * size * 1.15 + subjectGap + subjectLines.length * subjectSize * 1.2 + detailGap + (roomLines.length + detailLines.length) * size * 0.85;
        fitted = { ...meeting, ...box, size, subjectSize, codeLines, subjectLines, roomLines, detailLines, subjectGap, detailGap, contentHeight };
        if (contentHeight <= box.height - 20 && maxWidth >= size * 2) break;
      }
      const crowded = fitted.contentHeight > box.height - 20 || box.width < fitted.size * 2 + 24;
      contentOverflow ||= crowded;
      overflow ||= crowded;
      plan.entries.push(fitted);
    }
  }
  overflow ||= valid.some(entry => !activeDays.includes(entry.day));
  // A one-hour class can need more vertical room for its full subject name.
  // Try one taller grid before the shared renderer fits it to the wallpaper.
  if (contentOverflow && options.hourHeight === undefined && valid.every(entry => entry.end - entry.start >= 45)) return layoutWeeklyTimetable(ctx, schedule, template, height, { ...options, hourHeight: 160 });
  const gridBottom = gridTop + bodyHeight, bottom = gridBottom + axisFooter;
  return { plans, size: 42, startMinute, endMinute, timeWidth, dayWidth, gridTop, gridBottom, headerHeight, bodyHeight, gridX: 78, gridWidth: options.width, top: options.top, bottom, overflow: overflow || bottom > (options.limit ?? height) };
}

function drawWeeklyTimetable(ctx, template, layout) {
  const backdrop = frostedBackdrop(ctx, template);
  const lineColor = colorInputValue(template.line);
  const drawBox = (box, meeting = false) => {
    const radius = meeting ? 0 : template.containerShape === 'rounded' ? 12 : 30;
    if (backdrop) drawGlassCard(ctx, { ...template, containerBorder: false }, box, radius, backdrop);
    else rectangle(ctx, box.x, box.y, box.width, box.height, radius, template.containerFill === false ? undefined : template.surface);
    if (template.containerBorder !== false) {
      ctx.save(); ctx.strokeStyle = lineColor; ctx.globalAlpha = meeting ? 0.85 : 0.7; ctx.lineWidth = meeting ? 2.5 : 2;
      ctx.beginPath(); ctx.roundRect(box.x, box.y, box.width, box.height, radius); ctx.stroke(); ctx.restore();
    }
  };
  ctx.save(); ctx.textBaseline = 'middle';
  drawBox({ x: layout.gridX, y: layout.top, width: layout.gridWidth, height: layout.bottom - layout.top });
  ctx.fillStyle = template.ink; ctx.textAlign = 'center'; font(ctx, 34, 650, template.fontFamily);
  ctx.fillText('Time', layout.gridX + layout.timeWidth / 2, layout.top + layout.headerHeight / 2);
  for (const plan of layout.plans) ctx.fillText(plan.day, plan.x + plan.width / 2, layout.top + layout.headerHeight / 2, plan.width - 16);
  ctx.save(); ctx.strokeStyle = lineColor;
  for (let minute = layout.startMinute; minute <= layout.endMinute; minute += 30) {
    const hour = minute % 60 === 0;
    ctx.globalAlpha = hour ? 0.6 : 0.3; ctx.lineWidth = hour ? 2 : 1;
    ctx.setLineDash?.(hour ? [] : [6, 6]);
    const y = layout.gridTop + (minute - layout.startMinute) / (layout.endMinute - layout.startMinute) * layout.bodyHeight;
    ctx.beginPath(); ctx.moveTo(layout.gridX + layout.timeWidth, y); ctx.lineTo(layout.gridX + layout.gridWidth, y); ctx.stroke();
  }
  ctx.setLineDash?.([]); ctx.globalAlpha = 0.8; ctx.lineWidth = 2.5;
  for (const plan of layout.plans) { ctx.beginPath(); ctx.moveTo(plan.x, layout.top); ctx.lineTo(plan.x, layout.gridBottom); ctx.stroke(); }
  ctx.restore(); ctx.fillStyle = template.ink; font(ctx, 26, 500, template.fontFamily);
  for (let minute = layout.startMinute; minute <= layout.endMinute; minute += 30) {
    const label = formatWallpaperTime(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`);
    const y = layout.gridTop + (minute - layout.startMinute) / (layout.endMinute - layout.startMinute) * layout.bodyHeight;
    ctx.fillText(label, layout.gridX + layout.timeWidth / 2, y);
  }
  for (const plan of layout.plans) for (const entry of plan.entries) {
    drawBox(entry, true);
    let y = entry.y + (entry.height - entry.contentHeight) / 2;
    const center = entry.x + entry.width / 2;
    ctx.textBaseline = 'top'; ctx.fillStyle = template.ink; font(ctx, entry.size, 750, template.fontFamily);
    entry.codeLines.forEach(line => { ctx.fillText(line, center, y); y += entry.size * 1.15; });
    y += entry.subjectGap;
    font(ctx, entry.subjectSize, entry.codeLines.length ? 500 : 650, template.fontFamily);
    entry.subjectLines.forEach(line => { ctx.fillText(line, center, y); y += entry.subjectSize * 1.2; });
    y += entry.detailGap; font(ctx, entry.size * 0.7, 500, template.fontFamily);
    [...entry.roomLines, ...entry.detailLines].forEach(line => { ctx.fillText(line, center, y); y += entry.size * 0.85; });
  }
  ctx.restore();
  if (backdrop) { backdrop.width = 0; backdrop.height = 0; }
}

export function schedulePosition(template) {
  if (template.device === 'mobile') return 'center';
  if (['left', 'center', 'right'].includes(template.schedulePosition)) return template.schedulePosition;
  if (template.device === 'laptop') {
    if (template.layout !== 'mascot') return 'center';
    if (template.mascotPosition === 'center') return 'center';
    if (template.mascotPosition) return mascotPosition(template) === 'left' ? 'right' : 'left';
    return template.mascotSide === 'left' ? 'right' : 'left';
  }
  if (template.layout !== 'mascot') return 'center';
  return ['left', 'center', 'right'][(Number(template.edition || 1) - 1) % 3];
}

export function scheduleTopMargin(template) {
  const value = Number(template.topMargin || 0);
  return Number.isFinite(value) ? Math.max(0, Math.min(20, value)) : 0;
}

export function scheduleBottomMargin(template) {
  const value = Number(template.bottomMargin || 0);
  return Number.isFinite(value) ? Math.max(0, Math.min(20, value)) : 0;
}

export function scheduleSideMargin(template, side) {
  if (template[`${side}MarginEnabled`] !== true) return 0;
  const value = Number(template[`${side}Margin`] || 0);
  return Number.isFinite(value) ? Math.max(0, Math.min(20, value)) : 0;
}

export function scheduleMovement(template, axis) {
  const value = Number(template[`${axis}Position`] || 0);
  return Number.isFinite(value) ? Math.max(-100, Math.min(100, value)) : 0;
}

export function tabletBoxSpacing(template) {
  const value = Number(template.tabletBoxSpacing ?? 80);
  return Number.isFinite(value) ? Math.max(0, Math.min(300, value)) : 80;
}

function movementShift(position, before, after) {
  return position / 100 * Math.max(0, position < 0 ? before : after);
}

// Preview only: exports call drawWallpaper without this sample clock.
export function drawSampleClock(canvas, template) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = template.ink;
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = canvas.height * 0.004;
  font(ctx, canvas.height * 0.09, 600, 'DM Sans Variable');
  const timeWidth = ctx.measureText('9:41').width;
  const gap = canvas.height * 0.012;
  const x = (canvas.width - timeWidth) / 2;
  const y = canvas.height * 0.16;
  font(ctx, canvas.height * 0.09, 600, 'DM Sans Variable');
  ctx.fillText('9:41', x, y);
  font(ctx, canvas.height * 0.028, 600, 'DM Sans Variable');
  ctx.fillText('AM', x + timeWidth + gap, y);
  ctx.restore();
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
  const placement = mascotPosition(template);
  const selectedLayout = scheduleLayout(template, resolution.id);
  const weekly = selectedLayout === 'weekly';
  // Explicit placements sharing the schedule column use a protected footer.
  const footerCharacter = hasCharacter && (weekly || placement === 'center' || (template.mascotPosition && ((placement === 'left' && position !== 'right') || (placement === 'right' && position !== 'left'))));
  const leftInset = resolution.id === 'tablet' ? width * scheduleSideMargin(template, 'left') / 100 : 0;
  const rightInset = resolution.id === 'tablet' ? width * scheduleSideMargin(template, 'right') / 100 : 0;
  const dayCards = selectedLayout === 'day-cards';
  const timeline = selectedLayout === 'timeline';
  const columnWidth = width * (weekly || timeline && !landscape || dayCards && (!landscape || !hasCharacter) ? 0.94 : landscape ? 0.65 : 0.82);
  const topOffset = height * scheduleTopMargin(template) / 100;
  const minTop = resolution.id === 'tablet' ? height * 0.22 : 0;
  const baseTop = Math.max(minTop, landscape ? footerCharacter ? height * 0.06 : 0 : height * 0.16);
  // Ghibli's portrait artwork occupies the footer; dense schedules retain
  // their meetings while fitting above the character stamps and faces.
  const availableHeight = Math.min(height * (landscape ? footerCharacter ? 0.6 : 0.88 : hasCharacter ? 0.62 : 0.82), height * 0.965 - baseTop,
    timeline && !landscape ? height * 0.68 : weekly ? height * 0.78 : Infinity,
    template.collection === 'ghibli' && !landscape && selectedLayout === 'stacked' ? height * 0.77 - baseTop : Infinity);
  const count = dayCards ? Math.ceil(groupSchedule(schedule).length / 2) : groupSchedule(schedule).length;
  const designWidth = dayCards || weekly ? 1900 : 1400;
  const groupGap = resolution.id === 'tablet' ? tabletBoxSpacing(template) : 16;
  const layoutOptions = { top: 180, width: dayCards || weekly ? 1744 : 1244, timeWidth: 310, roomWidth: 210, minCardHeight: 130, groupGap, timeline, ...(timeline ? { compactTimeline: true, entryGap: 20 } : {}) };
  const measureLayout = weekly ? layoutWeeklyTimetable : dayCards ? layoutDayCards : layoutSchedule;
  let scale = Math.min(columnWidth / designWidth, availableHeight / (240 + count * 146 + Math.max(0, count - 1) * (groupGap - 16)));
  if (weekly) scale = columnWidth / designWidth;
  const logicalHeight = availableHeight / scale;
  let layout = measureLayout(ctx, schedule, template, logicalHeight, { ...layoutOptions, limit: logicalHeight - 60 });
  if (layout.overflow) {
    const expanded = measureLayout(ctx, schedule, template, 10000, { ...layoutOptions, limit: 9940 });
    const fittedScale = Math.min(columnWidth / designWidth, availableHeight / (expanded.bottom + 60));
    // Keep every meeting and reject overcrowded schedules before text becomes tiny.
    if (!expanded.overflow && fittedScale >= 0.42) { scale = fittedScale; layout = expanded; }
  }
  const contentHeight = (layout.bottom + 60) * scale;
  const margin = width * 0.05;
  const columnX = position === 'left' ? margin : position === 'right' ? width - columnWidth - margin : (width - columnWidth) / 2;
  const baseX = columnX + (columnWidth - designWidth * scale) / 2 + leftInset - rightInset;
  const x = baseX + movementShift(scheduleMovement(template, 'horizontal'), baseX + 78 * scale, width - (baseX + (78 + layoutOptions.width) * scale));
  const initialY = Math.max(baseTop, weekly ? height * 0.025 : landscape && !footerCharacter ? (height - contentHeight) / 2 : baseTop);
  const baseY = Math.max(0, Math.min(height * 0.965 - contentHeight, initialY + topOffset - height * scheduleBottomMargin(template) / 100));
  const upwardSpace = timeline && !landscape ? Math.max(0, baseY - (height * 0.18 - 12 * scale)) : baseY;
  const y = baseY + movementShift(scheduleMovement(template, 'vertical'), upwardSpace, height * 0.965 - (baseY + contentHeight));
  layout.overflow ||= y + contentHeight > height * 0.965 + 0.001;
  const scheduleBounds = { x: x + 78 * scale, y, width: layoutOptions.width * scale, height: contentHeight };
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  drawHeading(ctx, template, 100, designWidth);
  if (layout.overflow) { ctx.fillStyle = template.ink; font(ctx, 32, 600, template.fontFamily); ctx.fillText('Your schedule needs more room.', 90, 400); }
  else if (dayCards) drawDayCards(ctx, template, layout);
  else if (timeline) drawTimeline(ctx, template, layout);
  else if (weekly) drawWeeklyTimetable(ctx, template, layout);
  else drawScheduleCards(ctx, template, layout);
  ctx.restore();
  let art;
  if (hasCharacter && backgroundImage && !layout.overflow) {
    const bounds = backgroundImage.mascotBounds || { x: 0, y: 0, width: backgroundImage.width, height: backgroundImage.height };
    const maxWidth = width * (landscape ? footerCharacter ? 0.3 : position === 'center' ? 0.14 : 0.23 : 0.5);
    const belowSchedule = height - (scheduleBounds.y + scheduleBounds.height) - height * 0.025;
    const maxHeight = Math.max(0, landscape ? footerCharacter ? Math.min(height * 0.32, belowSchedule) : height * 0.58 : Math.min(height * 0.32, height * 0.965 - (scheduleBounds.y + scheduleBounds.height) - height * 0.025));
    if (maxHeight <= 0) return { ...layout, scheduleBounds, art, position };
    const artScale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
    const artWidth = bounds.width * artScale, artHeight = bounds.height * artScale;
    // Portrait artwork follows its mobile corner; landscape artwork sits
    // opposite the schedule. Anchor occupied bounds to the canvas edges.
    const right = template.mascotPosition ? placement === 'right' : landscape
      ? position === 'left' || (position === 'center' && template.mascotSide === 'right')
      : template.mascotSide === 'right';
    const artX = placement === 'center' ? (width - artWidth) / 2 : right ? width - artWidth : 0;
    const artY = height - artHeight;
    art = { x: artX, y: artY, width: artWidth, height: artHeight };
    ctx.save(); ctx.imageSmoothingEnabled = !template.pixelArt;
    ctx.drawImage(backgroundImage, bounds.x, bounds.y, bounds.width, bounds.height, artX, artY, artWidth, artHeight);
    ctx.restore();
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
  const topOffset = 2400 * scheduleTopMargin(template) / 100;
  const bottomOffset = 2400 * scheduleBottomMargin(template) / 100;
  const verticalOffset = topOffset - bottomOffset;
  const timeline = scheduleLayout(template, 'mobile') === 'timeline';
  // Use the phone's narrow canvas for readable rows rather than card padding,
  // while keeping the upper clock area clear.
  const timelineTop = 640;
  const layout = layoutSchedule(ctx, schedule, template, 2400, { ...(timeline ? { timeline: true, compactTimeline: true, x: 36, width: 1008, timeWidth: 230, roomWidth: 224, top: timelineTop + verticalOffset } : verticalOffset ? { top: 760 + verticalOffset } : {}) });
  const headingY = (timeline ? timelineTop - 110 : 650) + verticalOffset;
  const sideSpace = timeline ? 36 : 78;
  const moveX = movementShift(scheduleMovement(template, 'horizontal'), timeline ? Math.max(0, sideSpace + 26 - layout.size * 0.5 - 2) : sideSpace, sideSpace);
  const limit = template.layout === 'mascot' ? 1740 : timeline ? layout.limit : template.collection === 'ghibli' ? 2400 * 0.77 : 2250;
  const moveY = movementShift(scheduleMovement(template, 'vertical'), timeline ? Math.max(0, headingY - 500) : headingY - 88, limit - layout.bottom);
  ctx.save();
  if (moveX || moveY) ctx.translate(moveX, moveY);
  drawHeading(ctx, template, headingY);
  if (layout.overflow) {
    ctx.fillStyle = template.ink; textFont(38, 600); ctx.fillText('Your schedule needs more room.', 90, 1060);
    textFont(28); ctx.fillText('Shorten subject names or reduce the details.', 90, 1120);
    ctx.restore();
    return layout;
  }
  if (timeline) drawTimeline(ctx, template, layout);
  else drawScheduleCards(ctx, template, layout);
  ctx.restore();
  const scheduleBounds = { x: sideSpace + moveX, y: headingY - 88 + moveY, width: timeline ? 1008 : 924, height: layout.bottom - (headingY - 88) };
  if (template.layout === 'mascot') {
    const art = drawMascotFooter(ctx, template, backgroundImage);
    if (art && ctx.bezierCurveTo) drawParticles(ctx, template, art, timeline ? scheduleBounds : { x: 78 + moveX, y: 460 + moveY, width: 924, height: layout.bottom - 460 });
  }
  return { ...layout, scheduleBounds };
}

export function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export the wallpaper. Please try again.')), 'image/png'));
}
