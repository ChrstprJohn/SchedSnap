import { scheduleLayout, scheduleLayoutOptions } from '../../utils/canvasHelpers.js';
import { ChevronDown, LayoutTemplate } from 'lucide-react';

export default function ScheduleLayoutPicker({ template, onChange }) {
  const options = scheduleLayoutOptions(template.device);
  if (options.length < 2) return null;
  return <details className="flow-customize schedule-layout-picker">
    <summary className="disclosure-summary"><span><LayoutTemplate size={16} aria-hidden="true" />Schedule layout</span><ChevronDown className="disclosure-icon size-4" aria-hidden="true" /></summary>
    <fieldset className="schedule-layout-fieldset">
    <legend className="sr-only">Schedule layout</legend>
    <div className="schedule-layout-options">
      {options.map(({ value, label, description }) => <label key={value} className="schedule-layout-option">
        <input type="radio" name="schedule-layout" value={value} checked={scheduleLayout(template) === value} onChange={() => onChange('scheduleLayout', value)} />
        <span className={`layout-miniature layout-miniature-${value}`} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</span>
        <span className="layout-option-copy"><strong>{label}</strong><span>{description}</span></span>
      </label>)}
    </div>
    </fieldset>
  </details>;
}
