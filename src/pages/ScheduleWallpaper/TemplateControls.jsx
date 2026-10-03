import { colorInputValue, wallpaperFonts } from '../../utils/wallpaperTheme.js';

const colorFields = [
  { key: 'background', label: 'Background', colors: ['#dce8cb', '#f5daca', '#d8cbef', '#192f4b'] },
  { key: 'patternColor', label: 'Pattern', colors: ['#c8d7b7', '#e8c6ae', '#c0afd5', '#c5d8e7'] },
  { key: 'surface', label: 'Day containers', colors: ['#f8faf2', '#ffffff', '#f8ebe7', '#2b5145'] },
  { key: 'ink', label: 'Text', colors: ['#294b38', '#0f172a', '#71394d', '#fffdf4'] },
  { key: 'line', label: 'Border & separators', colors: ['#a6b5a1', '#e2e8f0', '#b98c96', '#8caa96'] },
];
const editablePatterns = new Set(['checker', 'grid', 'ruled', 'circle', 'dots', 'stripes', 'diamonds', 'waves']);

export default function TemplateControls({ template, onChange, onReset }) {
  const fixedBackground = Boolean(template.image && template.layout !== 'mascot');
  const fields = colorFields.filter(({ key }) => !(key === 'background' && fixedBackground) && !(key === 'patternColor' && !editablePatterns.has(template.pattern)));
  return <aside aria-label="Template appearance" className="template-settings space-y-4">
    <div><h3 className="font-semibold">Make it yours</h3><p className="mt-1 text-xs leading-relaxed text-muted">Colors and type carry through to your PNG.</p></div>
    {fixedBackground && <p className="text-xs leading-relaxed text-muted">The background is artwork. Customize its containers, text and font below.</p>}
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Day containers</legend>
      <label className="field-label">Shape<select className="field-input" value={template.containerShape || 'pill'} onChange={(event) => onChange('containerShape', event.target.value)}><option value="pill">Pill</option><option value="rounded">Rounded rectangle</option></select></label>
      {[{ key: 'containerBorder', label: 'Show border', checked: template.containerBorder !== false }, { key: 'containerFill', label: 'Fill background', checked: template.containerFill !== false }, { key: 'showSeparators', label: 'Show row separators', checked: template.showSeparators === true }].map(({ key, label, checked }) => <label key={key} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-accent" checked={checked} onChange={(event) => onChange(key, event.target.checked)} />{label}</label>)}
    </fieldset>
    {fields.map(({ key, label, colors }) => { const value = template[key] || (key === 'patternColor' ? template.pattern === 'circle' ? '#ad5b45' : template.line : '#ffffff'); return <fieldset key={key}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => <button key={color} type="button" aria-label={`${label} ${color}`} aria-pressed={value === color} onClick={() => onChange(key, color)} className="color-swatch" style={{ '--swatch': color }} />)}
        <label className="custom-color" title={`Custom ${label.toLowerCase()} color`}><span className="sr-only">Custom {label.toLowerCase()} color</span><input type="color" aria-label={`Custom ${label.toLowerCase()} color`} value={colorInputValue(value)} onChange={(event) => onChange(key, event.target.value)} /></label>
      </div>
    </fieldset>; })}
    <label className="field-label">Font<select className="field-input" value={template.fontFamily || 'DM Sans Variable'} onChange={(event) => onChange('fontFamily', event.target.value)}>{wallpaperFonts.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
    <button type="button" className="text-link text-sm" onClick={onReset}>Reset appearance</button>
  </aside>;
}
