import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDown, CircleAlert, ImageUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { days, getScheduleIssues } from '../../../shared/scheduleSchema.js';
import { formatTime } from '../../utils/canvasHelpers.js';

const newMeeting = () => ({ day: null, startTime: null, endTime: null, room: null, dateLabel: null });
const meetingSummary = (meeting) => [
  meeting.day?.slice(0, 3),
  meeting.startTime && meeting.endTime ? `${formatTime(meeting.startTime)}–${formatTime(meeting.endTime)}` : null,
  meeting.room,
].filter(Boolean).join(' · ');

function EditorField({ label, fieldId, error, children, className = '' }) {
  return <div className={`field-label ${className}`}><label htmlFor={fieldId}>{label}</label>{children}{error && <p id={`${fieldId}-error`} className="field-error"><CircleAlert size={14} aria-hidden="true" />{error}</p>}</div>;
}

export default function Editor({ schedule, onChange, onImport, preparingImage, validationRef, scheduleTitle = 'Class Schedule', onTitleChange }) {
  const editor = useRef(null);
  const pendingFocus = useRef(true);
  const scrollToNew = useRef(false);
  const titleInput = useRef(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(scheduleTitle);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(() => {
    const incomplete = schedule.classes.findIndex((course) => getScheduleIssues({ classes: [course] }).length > 0);
    return incomplete < 0 ? null : incomplete;
  });
  useEffect(() => { if (editingTitle) { titleInput.current?.focus(); titleInput.current?.select(); } }, [editingTitle]);
  function saveTitle() {
    onTitleChange(titleDraft.trim() || 'Class Schedule');
    setEditingTitle(false);
  }
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const target = editor.current?.querySelector('.class-entry[data-open="true"] input') || editor.current?.querySelector('.class-toggle');
    target?.focus({ preventScroll: true });
    if (scrollToNew.current) { target?.closest('.class-entry')?.scrollIntoView({ block: 'start', behavior: 'instant' }); scrollToNew.current = false; }
  }, [expandedIndex]);
  useImperativeHandle(validationRef, () => ({
    validate() {
      setSubmitted(true);
      setExpandedIndex(schedule.classes.findIndex((course) => getScheduleIssues({ classes: [course] }).length > 0));
      requestAnimationFrame(() => {
        const input = editor.current?.querySelector('[aria-invalid="true"]');
        input?.focus({ preventScroll: true });
        input?.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    },
  }), [schedule]);
  const visibleError = (key, error) => (submitted || touched[key]) ? error : '';
  const fieldProps = (key, error) => ({
    id: key,
    'aria-invalid': !!visibleError(key, error),
    'aria-describedby': visibleError(key, error) ? `${key}-error` : undefined,
    onBlur: (event) => {
      if (event.relatedTarget?.closest('button')) return;
      setTouched((previous) => ({ ...previous, [key]: true }));
    },
  });
  function updateCourse(index, key, value) {
    onChange({ ...schedule, classes: schedule.classes.map((course, i) => i === index ? { ...course, [key]: value } : course) });
  }
  function updateMeeting(index, meetingIndex, key, value) {
    updateCourse(index, 'meetings', schedule.classes[index].meetings.map((meeting, i) => i === meetingIndex ? { ...meeting, [key]: value || null } : meeting));
  }
  function addClass() {
    pendingFocus.current = true;
    scrollToNew.current = true;
    setSubmitted(false);
    setExpandedIndex(schedule.classes.length);
    onChange({ ...schedule, classes: [...schedule.classes, { subject: '', courseCode: null, meetings: [newMeeting()] }] });
  }
  function removeClass(index) {
    setTouched({});
    setExpandedIndex(expandedIndex === index ? null : expandedIndex > index ? expandedIndex - 1 : expandedIndex);
    onChange({ ...schedule, classes: schedule.classes.filter((_, i) => i !== index) });
  }
  return (
    <section ref={editor} aria-labelledby="editor-heading" className="class-form rounded-xl border border-line bg-white">
      <div className="review-toolbar rounded-t-xl bg-soft px-4">
        <div className="schedule-title-control">{editingTitle ? <><label id="editor-heading" htmlFor="schedule-title" className="sr-only">Schedule title</label><input ref={titleInput} id="schedule-title" className="field-input" value={titleDraft} maxLength={48} onChange={(event) => setTitleDraft(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); saveTitle(); } else if (event.key === 'Escape') { event.preventDefault(); setEditingTitle(false); } }} /></> : <><h2 id="editor-heading" className="schedule-title">{scheduleTitle}</h2><button type="button" className="icon-button" aria-label="Edit schedule title" onClick={() => { setTitleDraft(scheduleTitle); setEditingTitle(true); }}><Pencil size={15} aria-hidden="true" /></button></>}</div>
          {onImport && <button type="button" className="button-secondary" data-import-trigger disabled={preparingImage} onClick={onImport}><ImageUp size={16} aria-hidden="true" />{preparingImage ? 'Preparing…' : 'Upload image'}</button>}
      </div>
      <div className="border-t border-line">
        {schedule.classes.map((course, index) => {
          const subjectKey = `class-${index}-subject`;
          const codeKey = `class-${index}-code`;
          const subjectError = !course.subject.trim() ? 'Enter a subject.' : '';
          return (
          <article key={index} data-open={expandedIndex === index} className="class-entry min-w-0 border-b border-line">
            <div className="class-entry-header">
            <button type="button" aria-expanded={expandedIndex === index} aria-controls={`class-${index}-fields`} onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} className="class-toggle disclosure-summary">
              <span className="min-w-0 flex-1">
                <span className="class-name text-sm font-semibold">{course.subject.trim() || 'New Class'}{course.subject.trim() && course.courseCode && <> <span className="class-code">({course.courseCode})</span></>}</span>
                {expandedIndex !== index && course.meetings.some(meetingSummary) && <span className="mt-0.5 grid gap-y-0.5 text-xs leading-[18px] text-muted">{course.meetings.map((meeting, i) => { const summary = meetingSummary(meeting); return summary ? <span key={i}>{summary}</span> : null; })}</span>}
              </span>
              <ChevronDown className="disclosure-icon size-4 shrink-0 text-muted" aria-hidden="true" />
            </button>
            <button type="button" className="icon-button class-delete" aria-label={`Delete class ${index + 1}: ${course.subject || 'New Class'}`} onClick={() => removeClass(index)}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          {expandedIndex === index && <fieldset id={`class-${index}-fields`} className="min-w-0 px-4 pt-3 pb-4">
            <legend className="sr-only">Class {index + 1}: {course.subject || 'New class'}</legend>
            <div className="class-subject-fields">
              <EditorField label="Subject" fieldId={subjectKey} error={visibleError(subjectKey, subjectError)}><input className="field-input" {...fieldProps(subjectKey, subjectError)} maxLength={160} value={course.subject} onChange={(event) => updateCourse(index, 'subject', event.target.value)} placeholder="Subject name" /></EditorField>
              <EditorField label={<span>Course code <span className="field-optional">(optional)</span></span>} fieldId={codeKey}><input id={codeKey} className="field-input" maxLength={40} value={course.courseCode || ''} onChange={(event) => updateCourse(index, 'courseCode', event.target.value || null)} /></EditorField>
            </div>
            {course.meetings.map((meeting, meetingIndex) => {
              const key = `class-${index}-meeting-${meetingIndex}`;
              const dayError = !meeting.day ? 'Choose a day.' : '';
              const startError = !meeting.startTime ? 'Set a start time.' : '';
              const endError = !meeting.endTime ? 'Set an end time.' : meeting.startTime && meeting.endTime <= meeting.startTime ? 'End time must be after start time.' : '';
              return (
              <fieldset key={meetingIndex} className="class-meeting">
                <legend className="sr-only">Meeting {meetingIndex + 1}</legend>
                {course.meetings.length > 1 && <div className="meeting-toolbar"><span className="meeting-title">Meeting {meetingIndex + 1}</span><button type="button" className="remove-action" aria-label={`Remove meeting ${meetingIndex + 1} from class ${index + 1}`} onClick={() => { setTouched({}); updateCourse(index, 'meetings', course.meetings.filter((_, i) => i !== meetingIndex)); }}><Trash2 size={14} aria-hidden="true" />Remove</button></div>}
                <div className="class-meeting-fields">
                  <EditorField label="Day" fieldId={`${key}-day`} className="meeting-day" error={visibleError(`${key}-day`, dayError)}><div className="field-select"><select className="field-input" {...fieldProps(`${key}-day`, dayError)} value={meeting.day || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'day', event.target.value)}><option value="">Choose day</option>{days.map((day) => <option key={day}>{day}</option>)}</select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div></EditorField>
                  <EditorField label="Start time" fieldId={`${key}-start`} error={visibleError(`${key}-start`, startError)}><input className="field-input" {...fieldProps(`${key}-start`, startError)} type="time" value={meeting.startTime || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'startTime', event.target.value)} /></EditorField>
                  <EditorField label="End time" fieldId={`${key}-end`} error={visibleError(`${key}-end`, endError)}><input className="field-input" {...fieldProps(`${key}-end`, endError)} type="time" value={meeting.endTime || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'endTime', event.target.value)} /></EditorField>
                  <EditorField label={<span>Room number <span className="field-optional">(optional)</span></span>} fieldId={`${key}-room`} className="meeting-room"><input id={`${key}-room`} className="field-input" maxLength={80} value={meeting.room || ''} onChange={(event) => updateMeeting(index, meetingIndex, 'room', event.target.value)} /></EditorField>
                </div>
              </fieldset>
            ); })}
            {submitted && !course.meetings.length && <p className="field-error">Add a meeting.</p>}
            <div className="class-entry-actions">
              <button type="button" disabled={course.meetings.length >= 14} className="text-link" onClick={() => updateCourse(index, 'meetings', [...course.meetings, newMeeting()])}><Plus size={16} aria-hidden="true" />Add meeting</button>
            </div>
          </fieldset>}
          </article>
        ); })}
      </div>
      <button type="button" disabled={schedule.classes.length >= 40} className="button-secondary add-class" onClick={addClass}><Plus className="size-4" aria-hidden="true" />Add class</button>
    </section>
  );
}
