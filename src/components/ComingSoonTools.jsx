import { Plus } from 'lucide-react';

export default function ComingSoonTools() {
  return (
    <aside className="coming-soon-tools" aria-labelledby="coming-soon-heading">
      <div className="coming-soon-icon" aria-hidden="true">
        <Plus size={24} strokeWidth={1.5} />
      </div>
      <div className="coming-soon-copy">
        <h3 id="coming-soon-heading" className="coming-soon-heading">More tools coming soon</h3>
        <p className="coming-soon-description">More ways to make student life a little easier. Stay tuned.</p>
      </div>
    </aside>
  );
}
