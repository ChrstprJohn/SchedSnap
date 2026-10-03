import Hero from '../components/Hero.jsx';
import StatsBanner from '../components/StatsBanner.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import ComingSoonTools from '../components/ComingSoonTools.jsx';
import { services } from '../config/services.js';
import '../landing.css';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBanner />
      <section id="services" aria-labelledby="services-heading" className="page-wrap landing-services">
        <h2 id="services-heading" className="services-heading">Tools for student life</h2>
        <div className="service-list">
          {services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
        <ComingSoonTools />
      </section>
    </>
  );
}
