const steps = [
  {
    title: 'Choose a design',
    description: 'Find a wallpaper that feels like you, from soft patterns to little companions.',
    image: '/images/how-it-works/choose-design.webp',
    height: 512,
  },
  {
    title: 'Add your classes',
    description: 'Upload your schedule or enter your classes, then check the details.',
    image: '/images/how-it-works/add-classes.webp',
    height: 512,
  },
  {
    title: 'Download wallpaper',
    description: 'Download your PNG and set it as your lock screen. Your week, always in view.',
    image: '/images/how-it-works/download-wallpaper.webp',
    height: 720,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-how-it-works" aria-labelledby="how-it-works-heading">
      <div className="page-wrap">
        <div className="how-it-works-heading">
          <h2 id="how-it-works-heading">How it works</h2>
          <p>A few simple steps. A schedule that stays with you.</p>
        </div>
        <ol className="how-it-works-steps">
          {steps.map(({ title, description, image, height }, index) => (
            <li key={title} className="how-it-works-step">
              <div className="how-it-works-art">
                <img src={image} alt="" width="768" height={height} loading="lazy" decoding="async" />
              </div>
              <div className="how-it-works-copy">
                <h3><span className="how-it-works-number" aria-hidden="true">{index + 1}</span>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
