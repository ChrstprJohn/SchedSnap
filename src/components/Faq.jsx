import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router';

const questions = [
  {
    question: 'Do I need an account?',
    answer: 'No. You can create and download your class schedule wallpaper without signing up.',
  },
  {
    question: 'Is SchedSnap free to use?',
    answer: 'Yes. You can create, customize, and download a class schedule wallpaper for free. AI schedule imports have a daily allowance, shown before you upload. You can also enter your classes manually.',
  },
  {
    question: 'How do I turn my class schedule into a wallpaper?',
    answer: 'Choose your device and a design, then upload an image of your timetable or enter your classes manually. Check your subjects, days, times, and rooms, customize the appearance, and download your wallpaper as a PNG.',
  },
  {
    question: 'Can I turn a timetable screenshot into a wallpaper?',
    answer: 'Yes. Upload your timetable screenshot, review the extracted classes, and download your schedule wallpaper. Remove unnecessary personal details before uploading.',
  },
  {
    question: 'Which devices are supported?',
    answer: 'Create class schedule wallpapers for your phone, tablet, or laptop. Select your device in the creator, then download the PNG and set it as your wallpaper.',
  },
];

export default function Faq() {
  return <section id="faq" className="page-wrap landing-faq" aria-labelledby="faq-heading">
    <div className="faq-intro">
      <h2 id="faq-heading">Frequently asked questions</h2>
      <p>What to know before making your class schedule wallpaper.</p>
    </div>
    <div className="faq-questions">
      {questions.map(({ question, answer }) => <details key={question} name="landing-faq">
        <summary><h3>{question}</h3><ChevronDown size={20} aria-hidden="true" /></summary>
        <p>{answer}</p>
      </details>)}
    </div>
    <div className="faq-cta">
      <div className="faq-cta-copy">
        <h2>Ready to make your schedule a wallpaper?</h2>
        <p>Add your classes, pick your style, and download it for free.</p>
      </div>
      <Link to="/services/schedule-wallpaper" className="button-primary">Create your wallpaper <ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
  </section>;
}
