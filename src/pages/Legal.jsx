import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { analyticsEnabled } from '../lib/analytics.js';
import { getCookieConsent, getServerCookieConsent, setCookieConsent, subscribeCookieConsent } from '../lib/cookieConsent.js';
import './legal.css';

export default function Legal({ kind }) {
  const privacy = kind === 'privacy';
  const cookies = kind === 'cookies';
  const consent = useSyncExternalStore(subscribeCookieConsent, getCookieConsent, getServerCookieConsent);

  return <article className="legal-page">
    <header><h1>{cookies ? 'Cookie Policy' : privacy ? 'Privacy Policy' : 'Terms of Use'}</h1><p className="text-muted">Updated October 12, 2026</p></header>
    <nav aria-label="Legal pages">
      <Link to="/terms" aria-current={kind === 'terms' ? 'page' : undefined}>Terms of Use</Link>
      <Link to="/privacy" aria-current={privacy ? 'page' : undefined}>Privacy Policy</Link>
      <Link to="/cookies" aria-current={cookies ? 'page' : undefined}>Cookies</Link>
    </nav>
    {cookies ? <>
      <p className="legal-intro">Here’s how SchedSnap uses cookies and how you can choose which ones to allow.</p>
      <section><h2>Essential cookies</h2><p>These cookies keep administrator sign-in secure. We also remember your cookie choice so you aren’t asked on every visit. These features are separate from optional cookies.</p></section>
      <section><h2>Optional cookies</h2><p>With your permission, these cookies help us understand which pages and features people use. They help us improve SchedSnap. Rejecting them won’t stop you from creating or downloading wallpapers.</p></section>
      <section><h2>Your cookie settings</h2><p>Accept or reject optional cookies below. You can change your choice here at any time. If you clear your browser’s site data or use another browser, you’ll be asked again.</p>
        {analyticsEnabled ? <>
          <p role="status">{consent === 'granted' ? 'Optional cookies are on.' : 'Optional cookies are off.'}</p>
          <div className="legal-cookie-actions">
            <button type="button" className="button-secondary" aria-pressed={consent === 'denied'} onClick={() => setCookieConsent('denied')}>Reject cookies</button>
            <button type="button" className="button-secondary" aria-pressed={consent === 'granted'} onClick={() => setCookieConsent('granted')}>Accept cookies</button>
          </div>
        </> : <p>Optional cookies are currently off.</p>}
      </section>
      <section><h2>More about your privacy</h2><p>Read our <Link to="/privacy">Privacy Policy</Link> to learn how we handle schedule images and other information.</p></section>
    </> : privacy ? <>
      <p className="legal-intro">This policy explains what happens to your information when you create a wallpaper with SchedSnap.</p>
      <section><h2>Your schedule</h2><p>You don’t need an account to create a wallpaper. Your classes and edits stay in the current page and are cleared when you reload or leave it. We don’t keep a saved history of your schedules.</p><p>Your wallpaper is created in your browser and downloaded to your device. We don’t upload the finished wallpaper to our storage.</p></section>
      <section><h2>Importing a schedule image</h2><p>Selecting an image creates a preview in your browser. It is sent through our server to Google Gemini only when you choose Import classes. Gemini reads the image and returns the class details for you to review.</p><p>SchedSnap does not save uploaded schedule images or extracted classes to its application storage. Google’s handling of that data is described below. Crop out names, student IDs, contact details, grades, and other sensitive information before importing.</p><p>You can choose Enter manually instead. Manual entry does not send your schedule to Gemini.</p></section>
      <section><h2>Google’s processing of images</h2><p>Google’s Gemini API terms apply to submitted images and responses. For unpaid services, Google may use them to improve its products, and human reviewers may review them. For paid services, Google does not use them for product improvement, but may retain them for safety, security, and legal requirements. Which rules apply depends on the service’s billing setup.</p><p><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Read Google’s data-use terms</a> before submitting sensitive information.</p></section>
      <section><h2>Website usage</h2><p>If you accept optional cookies, we use PostHog to understand visits and actions such as choosing a design, importing classes, and downloading a wallpaper. This can include browser and device details, approximate location, template choices, class counts, and file type and size.</p><p>These usage reports do not include your uploaded image, class names, or room details. We don’t record your browsing session.</p><p>You can accept or reject optional cookies at any time on the <Link to="/cookies">Cookies page</Link>.</p></section>
      <section><h2>Services that help run the site</h2><p>Vercel hosts SchedSnap, and Cloudinary serves template artwork. These providers may process IP addresses and request details to deliver and protect their services. Their own privacy and retention policies apply.</p></section>
      <section><h2>Daily AI import allowance</h2><p>AI imports are limited to 10 attempts per day for each internet connection, resetting at midnight Philippine time. Devices on shared Wi-Fi share this allowance. Failed or cancelled imports may count once processing starts. Manual entry is unlimited.</p><p>We store a daily import count linked to a keyed hash of your IP address in Upstash Redis. Raw IP addresses, schedule images, and extracted classes are not stored with this counter. The counter expires at the daily reset.</p></section>
      <section><h2>Your choices</h2><p>Use manual entry to avoid sending an image to Google, remove personal information before importing, and reload or close the creator to clear your current schedule. Downloaded wallpapers remain on your device until you delete them.</p></section>
    </> : <>
      <p className="legal-intro">These terms explain how you can use SchedSnap to create a schedule wallpaper.</p>
      <section><h2>Using SchedSnap</h2><p>Use SchedSnap only with schedules and images you have permission to use. Don’t upload unlawful or confidential material, share someone else’s personal information without permission, or attempt to misuse the service or bypass its limits.</p></section>
      <section><h2>Importing classes with AI</h2><p>Choosing Import classes sends your selected image to Google Gemini. Read our <Link to="/privacy">Privacy Policy</Link> and <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Google’s Gemini API terms</a> before importing. AI can make mistakes, so check every subject, day, time, and room before downloading. Your institution’s official timetable remains the source of truth.</p><p>AI importing is for users aged 18 or older under Google’s API requirements. You can enter classes manually without using Gemini.</p></section>
      <section><h2>Your information and downloads</h2><p>You keep any rights you have in your submitted information. SchedSnap does not claim ownership of your schedule. Save your downloaded wallpaper if you want to keep it; your current edits are cleared when you reload or leave the creator.</p></section>
      <section><h2>Template artwork</h2><p>Template artwork may belong to its respective creators or rights holders. Downloading a wallpaper does not transfer ownership of that artwork or grant permission to sell or redistribute it. Only use or share it in ways you have permission to.</p></section>
      <section><h2>Availability and responsibility</h2><p>SchedSnap is provided as available. Features and third-party services may change or become unavailable, and we cannot guarantee uninterrupted operation or accurate AI results. You are responsible for checking your wallpaper and keeping any files you need.</p><p>Nothing in these terms takes away rights or protections you have under applicable law.</p></section>
      <section><h2>Updates to these terms</h2><p>We may update these terms when SchedSnap changes. The date above shows when this version was last updated. Google Gemini and the other services we use also have their own terms and policies.</p></section>
    </>}
    <footer><Link to="/services/schedule-wallpaper">Open wallpaper creator</Link></footer>
  </article>;
}
