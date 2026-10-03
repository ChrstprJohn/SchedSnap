import { services } from '../config/services.js';
import { wallpaperTemplates } from '../assets/templates.js';

const numberFormat = new Intl.NumberFormat('en');
// Replace this display fixture with an aggregate analytics response when configured.
const sampleVisits = 1284;

export default function StatsBanner({ visits = sampleVisits, sample = true }) {
  const stats = [
    { label: 'Total visits', value: visits, sample },
    { label: 'Tools available', value: services.length },
    { label: 'Wallpaper styles', value: wallpaperTemplates.length },
  ];

  return (
    <section className="stats-banner" aria-label="UniToolbox at a glance">
      <dl className="page-wrap stats-list">
        {stats.map(({ label, value, sample: isSample }) => (
          <div key={label} className="stats-item">
            <dt className="stats-label">{label}{isSample && <span className="stats-sample">Sample</span>}</dt>
            <dd className="stats-value" aria-label={value === null ? 'Unavailable' : undefined}>
              {value === null ? '—' : numberFormat.format(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
