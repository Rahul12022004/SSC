import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/home.css";

import mathImg from "../assets/images/Math.jpg";
import reasoningImg from "../assets/images/Reasoning.jpg";
import englishImg from "../assets/images/English.jpg";
import generalAwarenessImg from "../assets/images/General-Awareness.jpg";

import hero1 from "../assets/images/home3.jpeg";
import hero2 from "../assets/images/home4.jpeg";

function ImageCard({ src, title, desc, delay }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      className="subjectCard"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="imgWrapper">
        <div className={`skeleton ${loaded ? "hide" : ""}`}></div>

        <img
          src={src}
          alt={title}
          onLoad={() => setLoaded(true)}
          className={`img ${loaded ? "show" : ""}`}
        />
      </div>

      <div className="cardContent">
        <h3>{title}</h3>
        <p>{desc}</p>
        <button>Start</button>
      </div>
    </motion.div>
  );
}

function Home() {
  const heroImages = [hero1, hero2];
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="homePage">
      <section className="hero">
        <div className="heroSlider">
          <motion.div
            key={heroIndex}
            className="heroSlide"
            style={{ backgroundImage: `url(${heroImages[heroIndex]})` }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="heroOverlay"></div>

        <div className="heroContainer">
          {/* LEFT CONTENT */}
          <div className="heroContent">
            <span className="heroBadge">
              {" "}
              SSC Preparation {new Date().getFullYear()}
            </span>

            <h1>
              Crack SSC Exams with <span>Confidence</span>
            </h1>

            <p>
              Join Pathnirman and master Math, Reasoning, English & General
              Awareness with expert guidance.
            </p>

            <div className="heroButtons">
              <button
                className="primaryBtn"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>

              <button
                className="secondaryBtn"
                onClick={() => navigate("/courses")}
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="subjects">
        <h2>Subjects</h2>

        <div className="subjectGrid">
          <ImageCard
            src={mathImg}
            title="Math"
            desc="Practice SSC Math with quizzes and tests."
            delay={0.1}
          />
          <ImageCard
            src={reasoningImg}
            title="Reasoning"
            desc="Improve logical thinking with reasoning sets."
            delay={0.2}
          />
          <ImageCard
            src={englishImg}
            title="English"
            desc="Boost grammar, vocab and comprehension skills."
            delay={0.3}
          />
          <ImageCard
            src={generalAwarenessImg}
            title="General Awareness"
            desc="Stay updated with core GS subjects, current affairs and static general awareness."
            delay={0.4}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;
