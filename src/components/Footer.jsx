import { Link } from 'react-router';
import BrandMark from './BrandMark.jsx';
import MakerBanner from './MakerBanner.jsx';
import SocialLinks from './SocialLinks.jsx';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <img className="maker-background" src="/images/hero/hero-ambient.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" />
      <MakerBanner />
      <div className="page-wrap footer-content">
        <Link to="/" className="site-brand"><BrandMark /> SchedSnap</Link>
        <nav className="footer-links footer-policies" aria-label="Footer">
          <Link to="/terms">Terms of use</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/cookies">Cookies</Link>
        </nav>
        <SocialLinks />
        <p className="footer-credit">© {new Date().getFullYear()} SchedSnap. All rights reserved. Made by <strong>.dcd</strong></p>
      </div>
    </footer>
  );
}
