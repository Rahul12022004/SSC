import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import ParticlesBackground from './ParticlesBackground';
import LoadingScreen from './LoadingScreen';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import AboutSection from './AboutSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';
import './homepage-overrides.css';

const Homepage = () => {
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const prevBg    = document.body.style.background;
    const prevColor = document.body.style.color;
    document.body.style.background = '#ffffff';
    document.body.style.color      = '#0B2545';
    return () => {
      document.body.style.background = prevBg;
      document.body.style.color      = prevColor;
    };
  }, []);

  return (
    <div
      className="ssc-home relative min-h-screen overflow-x-hidden"
      style={{ background: '#ffffff', color: '#0B2545', fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      <motion.div
        aria-hidden="true"
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="fixed left-0 right-0 top-0 z-[60] h-[3px]"
      >
        <div className="h-full w-full" style={{ background: 'linear-gradient(90deg,#F77F00,#fbbf24,#d96c00)' }} />
      </motion.div>

      <ParticlesBackground />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-10"
      >
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <StatsSection />
        <TestimonialsSection />
      </motion.main>
    </div>
  );
};

export default Homepage;
