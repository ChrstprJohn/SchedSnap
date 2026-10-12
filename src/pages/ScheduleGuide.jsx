import { Link } from 'react-router';
import './legal.css';

export default function ScheduleGuide() {
  return <article className="legal-page">
    <header>
      <h1>How to make a class schedule wallpaper</h1>
      <p className="legal-intro">Keep your timetable on your phone, tablet, or laptop. SchedSnap turns class details into a PNG wallpaper you can save and set as your background.</p>
    </header>
    <nav aria-label="Guide navigation"><Link to="/services/schedule-wallpaper">Open the wallpaper creator</Link></nav>
    <section><h2>1. Choose your device and design</h2><p>Open the creator and choose mobile, tablet, or laptop. Pick a design for the device where you will use the wallpaper. A phone needs a portrait layout, while a laptop usually needs a wider layout.</p></section>
    <section><h2>2. Add your classes</h2><p>Enter your classes manually, or import an image of your timetable. Manual entry is useful when your schedule is short or the source image is hard to read. Image import uses AI, so review the results before continuing.</p><p>Remove personal information you do not need before uploading. You can use manual entry if you prefer not to send a schedule image for analysis.</p></section>
    <section><h2>3. Check days, times, and labels</h2><p>Compare every class with your original timetable. Check the day, start and end times, and any room or subject labels. Pay particular attention to morning and afternoon times after importing an image.</p></section>
    <section><h2>4. Preview and customize</h2><p>Review the wallpaper preview and adjust the available appearance settings. Keep labels short enough to read on your device. If the schedule does not fit, revise the layout or shorten labels before exporting.</p></section>
    <section><h2>5. Download and set your wallpaper</h2><p>Download the finished PNG. Open it in your device's photo or wallpaper settings and set it as your lock screen, home screen, or desktop background. Check the final crop so your clock, icons, and screen edges do not hide class details.</p><p>If a mobile browser opens the image in another tab, save it from there. Some browsers inside social apps handle downloads differently; opening SchedSnap in your regular browser can help.</p></section>
    <section><h2>When your timetable changes</h2><p>Create an updated wallpaper when a class moves or a room changes. Your downloaded PNG will not update automatically. Avoid sharing a wallpaper publicly if it reveals personal details or locations you want to keep private.</p></section>
    <footer><Link to="/services/schedule-wallpaper">Create your schedule wallpaper</Link></footer>
  </article>;
}
