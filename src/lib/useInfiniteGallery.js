import { useEffect, useState } from 'react';

export default function useInfiniteGallery(total, filterKey, pageSize = 20) {
  const [page, setPage] = useState({ key: filterKey, count: pageSize });
  const [sentinel, setSentinel] = useState(null);
  const count = page.key === filterKey ? page.count : pageSize;
  const hasMore = count < total;
  const loadMore = () => setPage(current => ({ key: filterKey, count: (current.key === filterKey ? current.count : pageSize) + pageSize }));
  useEffect(() => {
    if (!hasMore || !sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        setPage(current => ({ key: filterKey, count: (current.key === filterKey ? current.count : pageSize) + pageSize }));
      }
    }, { rootMargin: '1000px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, count, filterKey, pageSize, sentinel]);
  return { count, hasMore, sentinel: setSentinel, loadMore };
}
