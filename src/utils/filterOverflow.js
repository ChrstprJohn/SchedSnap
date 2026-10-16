export function fittingFilterCount(available, widths, moreWidth, gap) {
  const total = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * gap;
  if (total <= available) return widths.length;
  let used = moreWidth;
  let count = 0;
  for (const width of widths) {
    if (used + gap + width > available) break;
    used += gap + width;
    count++;
  }
  return count;
}

export function fittingFilterIndices(available, widths, moreWidth, gap) {
  const total = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * gap;
  if (total <= available) return widths.map((_, index) => index);
  let used = moreWidth;
  const indices = [];
  widths.forEach((width, index) => {
    if (used + gap + width > available) return;
    used += gap + width;
    indices.push(index);
  });
  return indices;
}
