import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { days, getScheduleIssues } from '../../../shared/scheduleSchema.js';
import { formatTime } from '../../utils/canvasHelpers.js';

const newMeeting = () => ({ day: null, startTime: null, endTime: null, room: null, dateLabel: null });

export default function Editor({ schedule, onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(() => {
    const incomplete = schedule.classes.findIndex((course) => getScheduleIssues({ classes: [course] }).length > 0);
    return incomplete < 0 ? null : incomplete;
  });
  function updateCourse(index, key, value) {
    onChange({ ...schedule, classes: schedule.classes.map((course, i) => i === index ? { ...course, [key]: value } : course) });
  }
  function updateMeeting(index, meetingIndex, key, value) {
    updateCourse(index, 'meetings', schedule.classes[index].meetings.map((meeting, i) => i === meetingIndex ? { ...meeting, [key]: value || null } : meeting));
  }
  return (
    <section aria-labelledby="editor-heading" className="class-form rounded-xl border border-line bg-white">
      <div className="review-toolbar rounded-t-xl bg-soft px-4">
        <div className="flex min-h-11 flex-wrap items-center gap-x-3"><h2 id="editor-heading" className="text-xl font-semibold tracking-tight">Class details</h2><span className="text-sm text-muted">{schedule.classes.length} {schedule.classes.length === 1 ? 'class' : 'classes'}</span></div>
        <button type="button" disabled={schedule.classes.length >= 40} className="button-secondary review-toolbar-action" onClick={() => { setExpandedIndex(schedule.classes.length); onChange({ ...schedule, classes: [...schedule.classes, { subject: '', courseCode: null, meetings: [newMeeting()] }] }); }}><Plus className="size-4" aria-hidden="true" />Add class</button>
      </div>
      <div className="border-t border-line">
        {schedule.classes.map((course, index) => (
          <details key={index} open={expandedIndex === index} className="class-entry min-w-0 border-b border-line">
            <summary onClick={(event) => { event.preventDefault(); setExpandedIndex(expandedIndex === index ? null : index); }} className="disclosure-summary rounded-lg px-4 py-2">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"><span className="text-sm font-semibold">{course.subject || `Class ${index + 1}`}</span>{course.courseCode && <span className="text-xs font-medium text-muted">{course.courseCode}</span>}{getScheduleIssues({ classes: [course] }).length > 0 && <span className="text-xs font-semibold text-[#783c2e]">Needs details</span>}</span>
                <span className="mt-0.5 grid gap-y-0.5 text-xs leading-[18px] text-muted">{course.meetings.map((meeting, i) => <span key={i}>{meeting.day?.slice(0, 3) || 'Day needed'} · {formatTime(meeting.startTime)}–{formatTime(meeting.endTime)}{meeting.room && ` · ${meeting.room}`}</span>)}{!course.meetings.length && <span>Add a meeting time</span>}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium"><span className="collapsed-label">Edit</span><span className="expanded-label">Close</span><ChevronDown className="disclosure-icon size-4 text-muted" aria-hidden="true" /></span>
            </summary>
          <fieldset className="min-w-0 px-4 pt-3 pb-4">
            <legend className="sr-only">Class {index + 1}: {course.subject || 'New class'}</legend>
            <div className="flex items-start gap-3"><div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-[1fr_110px]">
              <label className="field-label">Subject<input className="field-input" maxLength={160} value={course.subject} onChange={(event) => updateCourse(index, 'subject', event.target.value)} placeholder="Subject name" /></label>
              <label className="field-label">Course code<input className="field-input" maxLength={40} value={course.courseCode || ''} onChange={(event) => updateCourse(index, 'courseCode', event.target.value || null)} placeholder="Optional" /></label>
            </div><button type="button" className="icon-button mt-7 shrink-0" aria-label={`Remove class ${index + 1}`} onClick={() => { setExpandedIndex(expandedIndex === index ? null : expandedIndex > index ? expandedIndex - 1 : expandedIndex); onChange({ ...schedule, classes: schedule.classes.filter((_, i) => i !== index) }); }}><Trash2 className="size-4" aria-hidden="true" /></button></div>
            {course.meetings.map((meeting, meetingIndex) => (
              <fieldset key={meetingIndex} className="mt-4 flex min-w-0 items-start gap-3">
                <legend className="sr-only">Meeting {meetingIndex + 1}</legend>
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_1.5fr]">
                  <label className="field-label col-span-2 sm:col-span-1">Day<select className="field-input" value={meeting.day || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'day', event.target.value)}><option value="">Choose day</option>{days.map((day) => <option key={day}>{day}</option>)}</select></label>
                  <label className="field-label">Starts<input className="field-input" type="time" value={meeting.startTime || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'startTime', event.target.value)} /></label>
                  <label className="field-label">Ends<input className="field-input" type="time" value={meeting.endTime || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'endTime', event.target.value)} /></label>
                  <label className="field-label col-span-2 sm:col-span-1">Room<input className="field-input" maxLength={80} value={meeting.room || ''} placeholder="Optional" onChange={(event) => updateMeeting(index, meetingIndex, 'room', event.target.value)} /></label>
                </div>
                <button type="button" className="icon-button mt-7 shrink-0" aria-label={`Remove meeting ${meetingIndex + 1} from class ${index + 1}`} onClick={() => updateCourse(index, 'meetings', course.meetings.filter((_, i) => i !== meetingIndex))}><Trash2 className="size-4" aria-hidden="true" /></button>
              </fieldset>
            ))}
            <button type="button" disabled={course.meetings.length >= 14} className="text-link mt-3 inline-flex items-center gap-2 text-sm" onClick={() => updateCourse(index, 'meetings', [...course.meetings, newMeeting()])}><Plus className="size-4" aria-hidden="true" /> Add meeting</button>
          </fieldset>
          </details>
        ))}
      </div>
    </section>
  );
}
