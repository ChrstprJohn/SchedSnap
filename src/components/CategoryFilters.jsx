import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fittingFilterCount } from '../utils/filterOverflow.js';

export default function CategoryFilters({ categories, value, onChange, controls }) {
  const root = useRef(null);
  const measurements = useRef(null);
  const disclosure = useRef(null);
  const id = useId();
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      if (!root.current || !measurements.current) return;
      const items = [...measurements.current.children];
      const moreWidth = items.pop().getBoundingClientRect().width;
      setCount(fittingFilterCount(root.current.clientWidth, items.map(item => item.getBoundingClientRect().width), moreWidth, 8));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root.current);
    measure();
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [categories]);
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !root.current.contains(event.target))) {
        if (disclosure.current?.open && event.key === 'Escape') disclosure.current.querySelector('summary').focus();
        if (disclosure.current) disclosure.current.open = false;
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, []);
  const button = category => <button type="button" key={category.id} className="template-category" aria-pressed={value === category.id} aria-controls={controls} onClick={event => {
    onChange(category.id);
    if (disclosure.current?.open) {
      const fromOverflow = disclosure.current.contains(event.currentTarget);
      disclosure.current.open = false;
      if (fromOverflow) disclosure.current.querySelector('summary').focus();
    }
  }}>{category.name}</button>;
  return <div ref={root} className="template-category-list category-filters">
    <div ref={measurements} className="category-measurements" aria-hidden="true">
      {categories.map(category => <span key={category.id} className="template-category">{category.name}</span>)}
      <span className="template-category category-more-label">More<ChevronDown size={16} /></span>
    </div>
    {categories.slice(0, count).map(button)}
    {count < categories.length && <details ref={disclosure} className="category-more">
      <summary className="template-category category-more-label" aria-label="More filters" aria-controls={id} data-active={categories.slice(count).some(category => category.id === value)}>More<ChevronDown size={16} aria-hidden="true" /></summary>
      <div id={id} className="category-overflow" role="group" aria-label="More design filters">{categories.slice(count).map(button)}</div>
    </details>}
  </div>;
}
