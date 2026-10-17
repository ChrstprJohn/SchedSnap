import { useEffect, useRef } from 'react';
import { CalendarArrowDown, CalendarArrowUp, ChevronDown, Download, Heart } from 'lucide-react';

const options = [
  ['likes', 'Most hearts', Heart],
  ['downloads', 'Most downloads', Download],
  ['newest', 'Newest', CalendarArrowDown],
  ['oldest', 'Oldest', CalendarArrowUp],
];

export default function SortPicker({ value, onChange }) {
  const picker = useRef(null);
  const selected = options.find(([id]) => id === value) || options[0];
  const SelectedIcon = selected[2];
  useEffect(() => {
    const dismiss = event => { if (!picker.current?.contains(event.target)) picker.current?.removeAttribute('open'); };
    const close = event => {
      if (event.key === 'Escape' && picker.current?.open) {
        picker.current.removeAttribute('open');
        picker.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', close); };
  }, []);
  return <details ref={picker} className="device-picker gallery-sort-picker">
    <summary aria-label={`Sort designs by: ${selected[1]}`}><SelectedIcon aria-hidden="true" /><span>{selected[1]}</span><ChevronDown className="device-picker-chevron" aria-hidden="true" /></summary>
    <div className="device-picker-menu" role="menu" aria-label="Sort designs by">
      {options.map(([id, name, Icon]) => <button type="button" role="menuitem" key={id} aria-pressed={value === id} onClick={event => { onChange(id); event.currentTarget.closest('details').open = false; }}><Icon aria-hidden="true" /><span>{name}</span></button>)}
    </div>
  </details>;
}
