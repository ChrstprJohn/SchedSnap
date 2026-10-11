import { useEffect, useRef } from 'react';
import { ChevronDown, Laptop, Smartphone, Tablet } from 'lucide-react';

const devices = [
  ['mobile', 'Mobile', Smartphone],
  ['tablet', 'Tablet', Tablet],
  ['laptop', 'Laptop', Laptop],
];

export default function DevicePicker({ value = 'mobile', onChange, label = 'Device' }) {
  const pickerRef = useRef(null);
  const selected = devices.find(([id]) => id === value) || devices[0];
  const SelectedIcon = selected[2];
  useEffect(() => {
    const dismiss = event => {
      if (!pickerRef.current?.contains(event.target)) pickerRef.current?.removeAttribute('open');
    };
    const close = event => {
      if (event.key === 'Escape' && pickerRef.current?.open) {
        pickerRef.current.removeAttribute('open');
        pickerRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', close);
    };
  }, []);
  return <details ref={pickerRef} className="device-picker">
    <summary aria-label={`${label}: ${selected[1]}`}><SelectedIcon aria-hidden="true" /><span>{selected[1]}</span><ChevronDown className="device-picker-chevron" aria-hidden="true" /></summary>
    <div className="device-picker-menu" role="menu" aria-label={label}>
      {devices.map(([id, name, Icon]) => <button type="button" role="menuitem" key={id} aria-pressed={value === id} onClick={(event) => { onChange(id); event.currentTarget.closest('details').open = false; }}><Icon aria-hidden="true" /><span>{name}</span></button>)}
    </div>
  </details>;
}
