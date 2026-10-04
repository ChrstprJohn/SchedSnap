import { days } from '../../shared/scheduleSchema.js';
import { mobileResolution } from '../assets/templates.js';

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

export function layoutSchedule(ctx, schedule, template, height = 2400) {
  const textFont = (size, weight = 500) => font(ctx, size, weight, template.fontFamily);
  const groups = groupSchedule(schedule);
  const x = 78, width = 924;
  const dayWidth = 160;
  const timeX = x + dayWidth + 26, subjectX = timeX + 276;
  const roomWidth = 166, roomX = x + width - 32 - roomWidth;
  const subjectWidth = roomX - subjectX - 22;
  // Reserve the upper part of a portrait lock screen for its clock and date.
  const top = 680;
  const limit = template.layout === 'mascot' ? height - 660 : height - 150;
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
        const timeLines = ctx.measureText(range).width <= 260 ? [range] : [`${start}–`, end];
        const codeHeight = codeLines.length * codeLineHeight;
        const subjectHeight = subjectLines.length * entrySubjectLineHeight;
        const contentHeight = codeHeight + (hasCode ? codeGap : 0) + subjectHeight + (detailLines.length ? detailGap + detailLines.length * detailLineHeight : 0);
        const entryHeight = Math.max(contentHeight, roomLines.length * roomLineHeight, timeLines.length * timeLineHeight);
        return { ...entry, codeLines, subjectLines, detailLines, roomLines, timeLines, subjectSize, entrySubjectLineHeight, contentHeight, codeHeight, subjectHeight, entryHeight };
      });
      const contentHeight = entries.reduce((sum, entry) => sum + entry.entryHeight, 0) + Math.max(0, entries.length - 1) * entryGap;
      return { day: group.day, entries, x, width, height: Math.max(170, contentHeight + cardPadding), contentHeight, dayWidth, timeX, subjectX, subjectWidth, roomX, roomWidth };
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
  return result;
}

function rectangle(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function drawBackground(ctx, template, image) {
  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, 1080, 2400);
  if (image && template.layout !== 'mascot') {
    const scale = Math.max(1080 / image.width, 2400 / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (1080 - width) / 2, (2400 - height) / 2, width, height);
  }
  if (template.overlay) { ctx.fillStyle = template.overlay; ctx.fillRect(0, 0, 1080, 2400); }
  if (template.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, 1080, 2400);
    template.gradient.forEach((color, i) => gradient.addColorStop(i / (template.gradient.length - 1), color));
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 2400);
  }
  if (template.pattern === 'checker') {
    ctx.fillStyle = template.patternColor;
    for (let row = -1; row < 12; row++) for (let col = -1; col < 6; col++) if ((row + col) % 2 === 0) {
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
    for (let y = 0; y < 2400; y += 64) { ctx.moveTo(0, y); ctx.lineTo(1080, y); }
    if (template.pattern === 'grid') for (let x = 0; x < 1080; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, 2400); }
    ctx.stroke(); ctx.restore();
  }
  if (template.pattern === 'circle') { ctx.fillStyle = template.patternColor || '#ad5b45'; ctx.beginPath(); ctx.arc(1050, 200, 420, 0, Math.PI * 2); ctx.fill(); }
  if (template.pattern === 'dots') {
    ctx.fillStyle = template.patternColor;
    for (let y = 36; y < 2400; y += 72) for (let x = 36; x < 1080; x += 72) {
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (template.pattern === 'stripes') {
    ctx.fillStyle = template.patternColor;
    for (let x = 0; x < 1080; x += 180) ctx.fillRect(x, 0, 70, 2400);
  }
  if (template.pattern === 'diamonds') {
    ctx.fillStyle = template.patternColor;
    for (let y = 0; y <= 2520; y += 180) for (let x = 0; x <= 1260; x += 180) {
      ctx.beginPath(); ctx.moveTo(x, y - 72); ctx.lineTo(x + 72, y);
      ctx.lineTo(x, y + 72); ctx.lineTo(x - 72, y); ctx.lineTo(x, y - 72); ctx.fill();
    }
  }
  if (template.pattern === 'waves') {
    ctx.strokeStyle = template.patternColor; ctx.lineWidth = 3;
    for (let y = -60; y < 2460; y += 110) {
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < 1080; x += 360) ctx.bezierCurveTo(x + 120, y - 55, x + 240, y + 55, x + 360, y);
      ctx.stroke();
    }
  }
}

function drawHeading(ctx, template) {
  ctx.save();
  ctx.fillStyle = template.ink; ctx.textAlign = 'center';
  font(ctx, 88, 750, template.fontFamily);
  const title = template.scheduleTitle?.trim() || 'Class Schedule';
  for (let size = 86; size >= 24 && ctx.measureText(title).width > 924; size -= 2) font(ctx, size, 750, template.fontFamily);
  ctx.fillText(title, 540, 570, 924);
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
  }
  ctx.fillStyle = template.ink;
  ctx.textAlign = template.mascotSide === 'right' ? 'left' : 'right';
  const labelX = template.mascotSide === 'right' ? 78 : 1002;
  font(ctx, 22, 650, template.fontFamily); ctx.fillText(template.name.toUpperCase(), labelX, 2300);
  font(ctx, 18, 500, template.fontFamily); ctx.fillText(`EDITION ${template.edition}`, labelX, 2334);
  ctx.textAlign = 'left';
}

export function drawWallpaper(canvas, { schedule, template, resolution = mobileResolution, backgroundImage }) {
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
  for (const plan of layout.plans) {
    rectangle(ctx, plan.x, plan.y, plan.width, plan.height, template.containerShape === 'rounded' ? 22 : plan.height / 2, template.containerFill === false ? undefined : template.surface, template.containerBorder === false ? undefined : template.line);
    const dayX = plan.x + plan.dayWidth / 2 + 14, dayY = plan.y + plan.height / 2;
    ctx.save(); ctx.fillStyle = template.ink; ctx.globalAlpha = 0.1;
    ctx.beginPath(); ctx.arc(dayX, dayY, 65, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.textAlign = 'center'; ctx.fillStyle = template.ink;
    textFont(initialDays[plan.day].length > 1 ? 44 : 58, 750);
    ctx.save(); ctx.textBaseline = 'middle';
    ctx.fillText(initialDays[plan.day], dayX, dayY);
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
      entry.timeLines.forEach((line, i) => ctx.fillText(line, plan.timeX + 130, entry.timeY + i * layout.timeLineHeight));
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
  if (template.layout === 'mascot') drawMascotFooter(ctx, template, backgroundImage);
  return layout;
}

export function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export the wallpaper. Please try again.')), 'image/png'));
}
