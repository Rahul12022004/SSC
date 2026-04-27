import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/about.css";

/* FEATURE CARD */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="featureCard" data-aos="fade-up">
      <span className="featureIcon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* 🎰 ROLLING DIGIT */
function Digit({ digit }) {
  const numbers = Array.from({ length: 30 }, (_, i) => i % 10);
  const DIGIT_HEIGHT = 32;

  return (
    <div className="digitContainer">
      <div
        className="digitStrip"
        style={{
          transform: `translateY(-${(20 + digit) * DIGIT_HEIGHT}px)`,
        }}
      >
        {numbers.map((n, i) => (
          <div key={i} className={`digit ${n === digit ? "active" : ""}`}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function CountUp({ end, duration = 2000, suffix = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);

      // smoother easing with strong slow end
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.floor(end * eased);

      setValue((prev) => Math.max(prev, current));

      if (progress < 1) requestAnimationFrame(animate);
      else setValue(end);
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const digits = String(value).padStart(String(end).length, "0").split("");

  return (
    <div className="counter">
      <div className="digits">
        {digits.map((d, i) => (
          <Digit key={i} digit={parseInt(d)} />
        ))}

        {/* ✅ suffix inside digits flow */}
        {suffix && <div className="digit suffixDigit">{suffix}</div>}
      </div>
    </div>
  );
  
}

function About() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });

    AOS.refresh();
  }, []);

  return (
    <div className="aboutPage">
      {/* INTRO */}
      <section className="intro">
        <div className="container" data-aos="fade-up">
          <h1>About SSC Pathnirman</h1>
          <p>
            We are committed to helping students crack SSC exams with smart
            preparation, expert guidance, and consistent practice.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="statGrid">
          <div className="statCard" data-aos="zoom-in">
            <CountUp end={500} duration={2000} suffix="+" />
            <p>Students Enrolled</p>
          </div>

          <div className="statCard" data-aos="zoom-in">
            <CountUp end={200} duration={2300} suffix="+" />
            <p>Practice Tests</p>
          </div>

          <div className="statCard" data-aos="zoom-in">
            <CountUp end={95} duration={2000} suffix="%" />
            <p>Success Rate</p>
          </div>

          <div className="statCard" data-aos="zoom-in">
            <h2>24 x 7</h2>
            <p>Student Support</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why Students Trust Us</h2>

        <div className="featureGrid">
          <FeatureCard icon="🎯" title="Expert Guidance" desc="Learn from toppers, mentors & achievers." />
          <FeatureCard icon="📘" title="Smart Practice" desc="Daily mock tests, quizzes & real exam practice." />
          <FeatureCard icon="📅" title="Updated Content" desc="Latest syllabus, patterns & study updates." />
          <FeatureCard icon="📈" title="Performance Tracking" desc="Track progress, ranks & weak topics smartly." />
        </div>
      </section>

      {/* MISSION */}
      <section className="missionVision">
        <div className="mvGrid">
          <div className="mvCard" data-aos="fade-right">
            <h3>🎯 Our Mission</h3>
            <p>Affordable quality SSC preparation for every aspirant.</p>
          </div>

          <div className="mvCard" data-aos="fade-left">
            <h3>🚀 Our Vision</h3>
            <p>To become India's most trusted SSC preparation platform.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
