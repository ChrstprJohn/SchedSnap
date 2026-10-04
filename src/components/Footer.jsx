import { Link } from 'react-router';
import BrandMark from './BrandMark.jsx';
import MakerBanner from './MakerBanner.jsx';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <img className="maker-background" src="/images/hero-ambient.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" />
      <MakerBanner />
      <div className="page-wrap footer-content"><Link to="/" className="site-brand"><BrandMark /> SchedSnap</Link><span className="footer-credit">Made by <strong>.dcd</strong></span></div>
    </footer>
  );
}
