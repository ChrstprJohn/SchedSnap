import { scheduleLayout, scheduleLayoutOptions } from '../../utils/canvasHelpers.js';

export default function ScheduleLayoutPicker({ template, onChange }) {
  const options = scheduleLayoutOptions(template.device);
  if (options.length < 2) return null;
  return <fieldset className="schedule-layout-picker">
    <legend>Schedule layout</legend>
    <div className="schedule-layout-options">
      {options.map(({ value, label, description }) => <label key={value} className="schedule-layout-option">
        <input type="radio" name="schedule-layout" value={value} checked={scheduleLayout(template) === value} onChange={() => onChange('scheduleLayout', value)} />
        <span className={`layout-miniature layout-miniature-${value}`} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</span>
        <span className="layout-option-copy"><strong>{label}</strong><span>{description}</span></span>
      </label>)}
    </div>
  </fieldset>;
}
