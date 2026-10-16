import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { fittingFilterIndices } from '../utils/filterOverflow.js';

export default function CategoryFilters({ categories, value, onChange, controls }) {
  const root = useRef(null);
  const measurements = useRef(null);
  const id = useId();
  const [visibleIndices, setVisibleIndices] = useState([]);
  const [expanded, setExpanded] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      if (expanded || !root.current || !measurements.current) return;
      const items = [...measurements.current.children];
      const moreWidth = items.pop().getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(root.current).columnGap) || 0;
      setVisibleIndices(fittingFilterIndices(root.current.clientWidth, items.map(item => item.getBoundingClientRect().width), moreWidth, gap));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root.current);
    measure();
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [categories, expanded]);
  const button = category => <button type="button" key={category.id} className="template-category" aria-pressed={value === category.id} aria-controls={controls} onClick={() => onChange(category.id)}>{category.name}</button>;
  return <div ref={root} id={id} className="template-category-list category-filters" data-expanded={expanded}>
    <div ref={measurements} className="category-measurements" aria-hidden="true">
      {categories.map(category => <span key={category.id} className="template-category">{category.name}</span>)}
      <span className="template-category category-more-label">More<Plus size={16} /></span>
    </div>
    {(expanded ? categories : categories.filter((_, index) => visibleIndices.includes(index))).map(button)}
    {visibleIndices.length < categories.length && <button type="button" className="template-category category-more-label" aria-expanded={expanded} aria-controls={id} aria-label={expanded ? 'Show fewer filters' : 'Show more filters'} data-active={categories.some((category, index) => !visibleIndices.includes(index) && category.id === value)} onClick={() => setExpanded(previous => !previous)}>{expanded ? <>Less<Minus size={16} aria-hidden="true" /></> : <>More<Plus size={16} aria-hidden="true" /></>}</button>}
  </div>;
}
