import { particleStyles } from '../../utils/wallpaperParticles.js';
import { useRef } from 'react';
import { schedulePosition, scheduleMovement, tabletBoxSpacing, scheduleLayout } from '../../utils/canvasHelpers.js';
import { ChevronDown } from 'lucide-react';
import { colorInputValue, wallpaperFonts, mascotPosition, wallpaperFontScale, wallpaperCornerRadius, snapSchedulePosition } from '../../utils/wallpaperTheme.js';

const colorFields = {
  background: { label: 'Background', colors: ['#dce8cb', '#f5daca', '#d8cbef', '#192f4b'] },
  patternColor: { label: 'Pattern', colors: ['#c8d7b7', '#e8c6ae', '#c0afd5', '#c5d8e7'] },
  surface: { label: 'Fill', colors: ['#f8faf2', '#ffffff', '#f8ebe7', '#2b5145'] },
  ink: { label: 'Text', colors: ['#294b38', '#0f172a', '#71394d', '#fffdf4'] },
  line: { label: 'Border', colors: ['#a6b5a1', '#e2e8f0', '#b98c96', '#8caa96'] },
};
const editablePatterns = new Set(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves', 'frame']);

function AppearanceColor({ colorKey, template, onChange, toggleKey, label: labelOverride }) {
  const { label: defaultLabel, colors: defaultColors } = colorFields[colorKey];
  const label = labelOverride || defaultLabel;
  const rawValue = template[colorKey] || (colorKey === 'patternColor' ? (template.pattern === 'circle' ? '#ad5b45' : template.line) : '#ffffff');
  const normalizedValue = colorInputValue(rawValue);
  const colors = defaultColors.slice(0, 3);
  const enabled = !toggleKey || template[toggleKey] !== false;
  return <div className="appearance-row">
    {toggleKey ? <label className="appearance-label appearance-switch"><input type="checkbox" checked={enabled} onChange={(event) => onChange(toggleKey, event.target.checked)} />{label}</label> : <span className="appearance-label">{label}</span>}
    <fieldset className="appearance-palette" aria-label={`${label} choices`} disabled={!enabled}>
      {colors.map((color) => <button key={color} type="button" aria-label={`${label} ${color}`} aria-pressed={normalizedValue === colorInputValue(color)} onClick={() => onChange(colorKey, color)} className="color-swatch" style={{ '--swatch': color }} />)}
      <label className="custom-color" data-active={!colors.some(color => colorInputValue(color) === normalizedValue)} title={`Custom ${label.toLowerCase()}`}><span className="sr-only">Custom {label.toLowerCase()}</span><input type="color" aria-label={`Custom ${label.toLowerCase()}${!colors.some(color => colorInputValue(color) === normalizedValue) ? ', selected' : ''}`} value={normalizedValue} onChange={(event) => onChange(colorKey, event.target.value)} /></label>
    </fieldset>
  </div>;
}

export default function TemplateControls({ template, onChange, onReset, defaultTemplate = {}, enablePlacement = false }) {
  const fixedBackground = Boolean(template.image && template.layout !== 'mascot');
  const timeline = ['timeline', 'grouped-list', 'day-columns'].includes(scheduleLayout(template));
  const radius = wallpaperCornerRadius(template);
  const defaultRadius = wallpaperCornerRadius({ ...template, containerRadius: undefined });
  const dragging = useRef({});
  return <aside aria-label="Template appearance" className="template-settings">
    {(enablePlacement || (template.device && template.device !== 'mobile')) && <fieldset className="appearance-group">
      <legend>Schedule placement</legend>
      {['horizontal', 'vertical'].map(axis => {
        const value = scheduleMovement(template, axis);
        const defaultValue = scheduleMovement(defaultTemplate, axis);
        const direction = axis === 'horizontal' ? value < 0 ? 'Left' : 'Right' : value < 0 ? 'Up' : 'Down';
        const description = value === defaultValue ? 'Default position' : `${direction} ${Math.abs(value)}%`;
        const id = `schedule-${axis}-position`;
        return <div key={axis} className="top-margin-control">
          <div className="top-margin-label position-label"><label htmlFor={id}>{axis === 'horizontal' ? 'Horizontal position' : 'Vertical position'}</label><span className="position-value"><output htmlFor={id}>{description}</output><button type="button" className="position-reset" aria-label={`Reset ${axis} position`} disabled={value === defaultValue} onClick={() => onChange(`${axis}Position`, defaultValue)}>Reset</button></span></div>
          <input id={id} type="range" min="-100" max="100" step="1" value={value} aria-valuetext={description} onPointerDown={() => { dragging.current[axis] = true; }} onPointerUp={() => { dragging.current[axis] = false; }} onPointerCancel={() => { dragging.current[axis] = false; }} onBlur={() => { dragging.current[axis] = false; }} onChange={event => onChange(`${axis}Position`, snapSchedulePosition(Number(event.target.value), dragging.current[axis], defaultValue))} />
        </div>;
      })}
      <p className="placement-note">Move the title and classes together. Their size stays the same.</p>
      {template.device && template.device !== 'mobile' && <div className="appearance-row">
        <label className="appearance-label" htmlFor="schedule-position">Schedule position</label>
        <div className="field-select appearance-select"><select id="schedule-position" className="field-input" value={schedulePosition(template)} onChange={(event) => onChange('schedulePosition', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>
      </div>}
    </fieldset>}
    <fieldset className="appearance-group">
      <legend>Wallpaper</legend>
      {template.layout === 'mascot' && <div className="appearance-row">
        <label className="appearance-label" htmlFor="mascot-position">Character position</label>
        <div className="field-select appearance-select"><select id="mascot-position" className="field-input" value={mascotPosition(template)} onChange={(event) => onChange('mascotPosition', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>
      </div>}
      {fixedBackground ? <p className="text-xs leading-relaxed text-muted">Background artwork stays fixed.</p> : <AppearanceColor colorKey="background" template={template} onChange={onChange} />}
      {editablePatterns.has(template.pattern) && <AppearanceColor colorKey="patternColor" template={template} onChange={onChange} />}
    </fieldset>
    <fieldset className="appearance-group">
      <legend>{timeline ? 'Timeline' : 'Day containers'}</legend>
      {template.device === 'tablet' && <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="tablet-box-spacing">{timeline ? 'Space between days' : 'Space between boxes'}</label><output htmlFor="tablet-box-spacing">{tabletBoxSpacing(template)}</output></div>
        <input id="tablet-box-spacing" type="range" min="0" max="300" step="1" value={tabletBoxSpacing(template)} aria-valuetext={`${tabletBoxSpacing(template)} spacing units`} onChange={event => onChange('tabletBoxSpacing', Number(event.target.value))} />
      </div>}
      <div className="appearance-row">
        <label className="appearance-label" htmlFor="container-style">Finish</label>
        <div className="field-select appearance-select"><select id="container-style" className="field-input" value={template.containerStyle || 'glass'} onChange={(event) => onChange('containerStyle', event.target.value)}><option value="glass">Frosted glass</option><option value="solid">Solid</option></select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>
      </div>
      <div className="top-margin-control">
        <div className="top-margin-label"><label htmlFor="appearance-shape">Corner radius</label><span className="position-value"><output htmlFor="appearance-shape">{radius}%</output><button type="button" className="position-reset" aria-label="Reset corner radius" disabled={radius === defaultRadius} onClick={() => onChange('containerRadius', undefined)}>Reset</button></span></div>
        <input id="appearance-shape" type="range" min="0" max="50" step="1" value={radius} aria-valuetext={`${radius}% corner radius`} onChange={event => onChange('containerRadius', Number(event.target.value))} />
      </div>
      <AppearanceColor colorKey="surface" template={template} onChange={onChange} toggleKey="containerFill" />
      {!timeline && <AppearanceColor colorKey="line" template={template} onChange={onChange} toggleKey="containerBorder" />}
      {timeline && <>
        <div className="appearance-row"><label className="appearance-label appearance-switch"><input type="checkbox" checked={template.containerBorder !== false} onChange={event => onChange('containerBorder', event.target.checked)} />Day outline</label></div>
        <AppearanceColor colorKey="line" label="Lines" template={template} onChange={onChange} />
      </>}
    </fieldset>
    <fieldset className="appearance-group">
      <legend>Schedule Text</legend>
      <div className="appearance-row">
        <label className="appearance-label appearance-switch"><input type="checkbox" checked={template.showTitle !== false} onChange={event => onChange('showTitle', event.target.checked)} />Show title</label>
      </div>
      <div className="appearance-row">
        <label className="appearance-label" htmlFor="appearance-font-size">Font size</label>
        <div className="field-select appearance-select"><select id="appearance-font-size" className="field-input" value={wallpaperFontScale(template)} onChange={event => onChange('fontScale', Number(event.target.value))}>{[70, 80, 90, 100, 110, 120, 130, 140, 150, 160].map(percent => <option key={percent} value={percent / 100}>{percent === 100 ? 'Default · 100%' : `${percent}%`}</option>)}</select><ChevronDown size={16} className="field-select-icon" aria-hidden="true" /></div>
      </div>
      <div className="appearance-row">
        <label className="appearance-label" htmlFor="appearance-font">Font family</label>
        <div className="field-select appearance-select">
          <select id="appearance-font" className="field-input" value={template.fontFamily || 'DM Sans Variable'} onChange={(event) => onChange('fontFamily', event.target.value)}>
            {wallpaperFonts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <ChevronDown size={16} className="field-select-icon" aria-hidden="true" />
        </div>
      </div>
      <AppearanceColor colorKey="ink" template={template} onChange={onChange} />
    </fieldset>
    {template.layout === 'mascot' && <fieldset className="appearance-group">
      <legend>Decorations</legend>
      <div className="appearance-row">
        <label className="appearance-label" htmlFor="particle-style">Particles</label>
        <div className="field-select appearance-select">
          <select id="particle-style" className="field-input" value={template.particleStyle || 'auto'} onChange={(event) => onChange('particleStyle', event.target.value)}>
            {particleStyles.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <ChevronDown size={16} className="field-select-icon" aria-hidden="true" />
        </div>
      </div>
    </fieldset>}
    <button type="button" className="text-link appearance-reset" onClick={onReset}>Reset appearance</button>
  </aside>;
}

