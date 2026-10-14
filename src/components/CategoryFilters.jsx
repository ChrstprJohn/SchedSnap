import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fittingFilterCount } from '../utils/filterOverflow.js';

export default function CategoryFilters({ categories, value, onChange, controls }) {
  const root = useRef(null);
  const measurements = useRef(null);
  const id = useId();
  const [count, setCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
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
  const button = category => <button type="button" key={category.id} className="template-category" aria-pressed={value === category.id} aria-controls={controls} onClick={() => onChange(category.id)}>{category.name}</button>;
  return <div ref={root} id={id} className="template-category-list category-filters" data-expanded={expanded}>
    <div ref={measurements} className="category-measurements" aria-hidden="true">
      {categories.map(category => <span key={category.id} className="template-category">{category.name}</span>)}
      <span className="template-category category-more-label">More<ChevronDown size={16} /></span>
    </div>
    {(expanded ? categories : categories.slice(0, count)).map(button)}
    {count < categories.length && <button type="button" className="template-category category-more-label" aria-expanded={expanded} aria-controls={id} aria-label={expanded ? 'Show fewer filters' : 'Show more filters'} data-active={categories.slice(count).some(category => category.id === value)} onClick={() => setExpanded(previous => !previous)}>{expanded ? 'Less' : 'More'}<ChevronDown size={16} aria-hidden="true" /></button>}
  </div>;
}
