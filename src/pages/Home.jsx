import Hero from '../components/Hero.jsx';
import DesignShowcase from '../components/DesignShowcase.jsx';
import LandingStats from '../components/LandingStats.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import '../landing.css';

export default function Home() {
  return <><Hero /><LandingStats /><HowItWorks /><DesignShowcase /></>;
}
