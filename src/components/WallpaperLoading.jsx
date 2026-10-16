export default function WallpaperLoading() {
  return <section className="page-wrap wallpaper-flow" aria-busy="true" aria-label="Loading wallpaper creator">
    <span role="status" className="sr-only">Loading wallpaper creator…</span>
    <div aria-hidden="true">
      <div className="wallpaper-skeleton h-5 w-16 rounded" />
      <div className="wallpaper-flow-header">
        <div className="wallpaper-skeleton h-9 w-60 max-w-full rounded-lg" />
        <div className="wallpaper-skeleton h-11 w-72 max-w-full rounded-lg" />
      </div>
      <div className="my-5 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="wallpaper-skeleton h-10 w-24 rounded-full" />)}
      </div>
      <div className="template-grid template-grid-mobile">
        {Array.from({ length: 10 }, (_, index) => <div key={index} className="gallery-card-skeleton wallpaper-skeleton" />)}
      </div>
    </div>
  </section>;
}
