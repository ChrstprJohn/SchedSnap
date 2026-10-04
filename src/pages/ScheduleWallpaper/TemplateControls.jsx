import { colorInputValue, wallpaperFonts } from '../../utils/wallpaperTheme.js';

const colorFields = {
  background: { label: 'Background', colors: ['#dce8cb', '#f5daca', '#d8cbef', '#192f4b'] },
  patternColor: { label: 'Pattern', colors: ['#c8d7b7', '#e8c6ae', '#c0afd5', '#c5d8e7'] },
  surface: { label: 'Fill', colors: ['#f8faf2', '#ffffff', '#f8ebe7', '#2b5145'] },
  ink: { label: 'Text', colors: ['#294b38', '#0f172a', '#71394d', '#fffdf4'] },
  line: { label: 'Border', colors: ['#a6b5a1', '#e2e8f0', '#b98c96', '#8caa96'] },
};
const editablePatterns = new Set(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves']);

function AppearanceColor({ colorKey, template, onChange, toggleKey }) {
  const { label, colors } = colorFields[colorKey];
  const value = template[colorKey] || (colorKey === 'patternColor' ? template.pattern === 'circle' ? '#ad5b45' : template.line : '#ffffff');
  const enabled = !toggleKey || template[toggleKey] !== false;
  return <div className="appearance-row">
    {toggleKey ? <label className="appearance-label appearance-switch"><input type="checkbox" checked={enabled} onChange={(event) => onChange(toggleKey, event.target.checked)} />{label}</label> : <span className="appearance-label">{label}</span>}
    <fieldset className="appearance-palette" aria-label={`${label} choices`} disabled={!enabled}>
      {colors.map((color) => <button key={color} type="button" aria-label={`${label} ${color}`} aria-pressed={colorInputValue(value) === color} onClick={() => onChange(colorKey, color)} className="color-swatch" style={{ '--swatch': color }} />)}
      <label className="custom-color" title={`Custom ${label.toLowerCase()}`}><span className="sr-only">Custom {label.toLowerCase()}</span><input type="color" aria-label={`Custom ${label.toLowerCase()}`} value={colorInputValue(value)} onChange={(event) => onChange(colorKey, event.target.value)} /></label>
    </fieldset>
  </div>;
}

export default function TemplateControls({ template, onChange, onReset }) {
  const fixedBackground = Boolean(template.image && template.layout !== 'mascot');
  return <aside aria-label="Template appearance" className="template-settings">
    <fieldset className="appearance-group">
      <legend>Wallpaper</legend>
      {fixedBackground ? <p className="text-xs leading-relaxed text-muted">Background artwork stays fixed.</p> : <AppearanceColor colorKey="background" template={template} onChange={onChange} />}
      {editablePatterns.has(template.pattern) && <AppearanceColor colorKey="patternColor" template={template} onChange={onChange} />}
    </fieldset>
    <fieldset className="appearance-group">
      <legend>Day containers</legend>
      <div className="appearance-row"><label className="appearance-label" htmlFor="appearance-shape">Shape</label><select id="appearance-shape" className="field-input appearance-select" value={template.containerShape || 'pill'} onChange={(event) => onChange('containerShape', event.target.value)}><option value="pill">Pill</option><option value="rounded">Rounded rectangle</option></select></div>
      <AppearanceColor colorKey="surface" template={template} onChange={onChange} toggleKey="containerFill" />
      <AppearanceColor colorKey="line" template={template} onChange={onChange} toggleKey="containerBorder" />
    </fieldset>
    <fieldset className="appearance-group">
      <legend>Schedule Text</legend>
      <div className="appearance-row"><label className="appearance-label" htmlFor="appearance-font">Font family</label><select id="appearance-font" className="field-input appearance-select" value={template.fontFamily || 'DM Sans Variable'} onChange={(event) => onChange('fontFamily', event.target.value)}>{wallpaperFonts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
      <AppearanceColor colorKey="ink" template={template} onChange={onChange} />
    </fieldset>
    <button type="button" className="text-link appearance-reset" onClick={onReset}>Reset appearance</button>
  </aside>;
}
