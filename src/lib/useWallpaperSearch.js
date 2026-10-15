import { useEffect, useState } from 'react';

const examples = ['Genshin Impact…', 'Sanrio…', 'Notebook Hours…', 'We Bare Bears…', 'Chiikawa…', 'Pixel art…', 'Patterns & prints…'];

export function useSearchPlaceholder(value) {
  const [placeholder, setPlaceholder] = useState(examples[0]);

  useEffect(() => {
    if (value) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    let example = 0;

    function rotate() {
      example = (example + 1) % examples.length;
      const text = examples[example];
      let length = motion.matches ? text.length : 1;
      function type() {
        setPlaceholder(text.slice(0, length));
        if (length < text.length) {
          length++;
          timer = window.setTimeout(type, 50);
        } else {
          timer = window.setTimeout(rotate, motion.matches ? 3000 : 3000 - (text.length - 1) * 50);
        }
      }
      type();
    }

    function start() {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(rotate, 3000);
    }

    function restart() {
      setPlaceholder(examples[example]);
      start();
    }

    start();
    motion.addEventListener('change', restart);
    document.addEventListener('visibilitychange', restart);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
    };
  }, [value]);

  return placeholder;
}

export function useDebouncedSearch(value) {
  const [query, setQuery] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(value), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return value.trim() ? query : '';
}
