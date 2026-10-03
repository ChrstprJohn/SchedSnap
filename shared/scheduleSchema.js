import { z } from 'zod';

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const meetingSchema = z.object({
  day: z.enum(days).nullable(),
  startTime: timeSchema.nullable(),
  endTime: timeSchema.nullable(),
  room: z.string().max(80).nullable(),
  dateLabel: z.string().max(80).nullable(),
});
export const scheduleSchema = z.object({
  classes: z.array(z.object({
    subject: z.string().trim().min(1).max(160),
    courseCode: z.string().max(40).nullable(),
    meetings: z.array(meetingSchema).min(1).max(14),
  })).min(1).max(40),
  warnings: z.array(z.string().max(300)).max(40),
});

export function getScheduleIssues(schedule) {
  if (!schedule.classes.length) return ['Add at least one class to create your wallpaper.'];
  const issues = [];
  for (const course of schedule.classes) {
    if (!course.subject.trim()) issues.push('Every class needs a subject name.');
    if (!course.meetings.length) issues.push(`${course.subject || 'A class'} needs a meeting time.`);
    for (const meeting of course.meetings) {
      if (!meeting.day || !meeting.startTime || !meeting.endTime) issues.push(`${course.subject || 'A class'} has an incomplete day or time.`);
      else if (meeting.endTime <= meeting.startTime) issues.push(`${course.subject}: end time must be later than start time.`);
    }
  }
  return [...new Set(issues)];
}
