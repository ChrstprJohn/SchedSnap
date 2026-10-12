import { z } from 'zod';
import { scheduleSchema } from '../../shared/scheduleSchema.js';

export const draftKey = 'schedsnap-class-draft-v1';
// Drafts must also preserve unfinished classes that are not ready for export.
const draftSchema = z.object({
  schedule: scheduleSchema.extend({ classes: z.array(scheduleSchema.shape.classes.element.extend({ subject: z.string().max(160) })).min(1).max(40) }),
  title: z.string().max(160),
});

export function readDraft(storage) {
  try {
    const result = draftSchema.safeParse(JSON.parse(storage.getItem(draftKey)));
    if (result.success) return result.data;
    storage.removeItem(draftKey);
  } catch { /* Unavailable storage must not stop class entry. */ }
  return null;
}

export function saveDraft(storage, schedule, title) {
  try {
    if (schedule.classes.length) storage.setItem(draftKey, JSON.stringify({ schedule, title }));
    else storage.removeItem(draftKey);
    return true;
  } catch { return false; }
}
