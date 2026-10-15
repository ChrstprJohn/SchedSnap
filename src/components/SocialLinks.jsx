import { SOCIAL_LINKS } from '../config/socialLinks.js';

const socials = [
  { name: 'GitHub', key: 'github', icon: <path fill="currentColor" stroke="none" d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /> },
  { name: 'Facebook', key: 'facebook', icon: <path d="M14 22v-9h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z" fill="currentColor" stroke="none" /> },
  { name: 'Instagram', key: 'instagram', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></> },
];

export default function SocialLinks() {
  return (
<div className="footer-socials" role="group" aria-label="Social media">
          {socials.map(({ name, key, icon }) => {
            const artwork = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{icon}</svg>;
            return SOCIAL_LINKS[key] ? <a key={key} className="footer-social-icon" href={SOCIAL_LINKS[key]} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`}>{artwork}</a> : <span key={key} className="footer-social-icon" role="img" aria-label={`${name} link coming soon`} title={`${name} link coming soon`}>{artwork}</span>;
          })}
        </div>
  );
}
