import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PHRASES = [
  'Crack SSC CGL with Confidence.',
  'Master Math, Reasoning & English.',
  'Built for Every Aspirant.',
  'Practice. Analyse. Conquer.',
];

const useTypewriter = (phrases, typeSpeed = 60, holdMs = 1600, eraseSpeed = 30) => {
  const [text, setText]   = useState('');
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState('typing');
  useEffect(() => {
    const phrase = phrases[idx % phrases.length];
    let t;
    if (phase === 'typing') {
      if (text.length < phrase.length) t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), typeSpeed);
      else t = setTimeout(() => setPhase('erasing'), holdMs);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(phrase.slice(0, text.length - 1)), eraseSpeed);
      else { setIdx(i => i + 1); setPhase('typing'); }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, phrases, typeSpeed, holdMs, eraseSpeed]);
  return text;
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const typed    = useTypewriter(PHRASES);

  return (
    <section
      className="relative flex min-h-[calc(100vh-70px)] items-center justify-center overflow-hidden pt-20 pb-24"
      style={{ background: '#ffffff' }}
    >
      {/* subtle warm radial behind hero text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(247,127,0,0.07) 0%, rgba(251,191,36,0.04) 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(#0B2545 1px, transparent 1px), linear-gradient(90deg, #0B2545 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* decorative corner rings */}
      <DecorRing className="absolute -top-24 -right-24 h-96 w-96 opacity-[0.06]" color="#F77F00" />
      <DecorRing className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] opacity-[0.05]" color="#0B2545" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          {/* session badge */}
          <motion.div variants={fadeUp} className="mt-8 mb-12 inline-flex items-center gap-2.5 rounded-full border px-5 py-2" style={{ borderColor: 'rgba(247,127,0,0.35)', background: '#fff7ed' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#F77F00' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#F77F00' }} />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#d96c00' }}>
              SSC Pathnirman · Batch {new Date().getFullYear()}
            </span>
          </motion.div>

          {/* main heading */}
          <motion.h1
            variants={fadeUp}
            className="mb-5 font-display text-[clamp(2.8rem,7.5vw,6.5rem)] font-black leading-[1.0] tracking-tight"
            style={{ color: '#0B2545' }}
          >
            India's Smartest<br />
            <span
              className="relative inline-block"
              style={{ background: 'linear-gradient(90deg,#F77F00,#d96c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              SSC Prep Platform
              <motion.span
                className="absolute -inset-x-1 -bottom-2 h-1 rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg,#F77F00,#fbbf24)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.0, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </motion.h1>

          {/* typewriter */}
          <motion.div variants={fadeUp} className="mb-7 flex h-10 items-center justify-center">
            <p className="font-mono text-base sm:text-lg" style={{ color: '#6b7280' }}>
              <span style={{ color: '#F77F00' }}>&gt;</span>{' '}{typed}
              <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse align-middle" style={{ background: '#F77F00' }} />
            </p>
          </motion.div>

          {/* sub-text */}
          <motion.p variants={fadeUp} className="mb-10 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: '#4b5563' }}>
            Adaptive mock tests, mentor-led doubt rooms, and real-time analytics, all engineered to put your name on the merit list.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(247,127,0,0.40)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="group relative overflow-hidden rounded-xl px-8 py-3.5 font-display font-semibold text-white transition-shadow"
              style={{ background: 'linear-gradient(135deg,#F77F00,#d96c00)', fontSize: '1rem' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="currentColor">
                  <path d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" />
                </svg>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/courses')}
              className="rounded-xl border-2 px-8 py-[13px] font-display font-semibold transition-colors"
              style={{ borderColor: '#0B2545', color: '#0B2545', fontSize: '1rem', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0B2545'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0B2545'; }}
            >
              Explore Courses
            </motion.button>
          </motion.div>


        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: '#9ca3af' }}>Scroll</span>
        <div className="h-10 w-6 rounded-full border-2 flex justify-center pt-1.5" style={{ borderColor: '#d1d5db' }}>
          <motion.span
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-[3px] rounded-full"
            style={{ background: '#F77F00' }}
          />
        </div>
      </motion.div>
    </section>
  );
};

const DecorRing = ({ className, color }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <circle cx="200" cy="200" r="190" stroke={color} strokeWidth="1" />
    <circle cx="200" cy="200" r="140" stroke={color} strokeWidth="1" strokeDasharray="8 12" />
    <circle cx="200" cy="200" r="90"  stroke={color} strokeWidth="1" />
  </svg>
);

export default HeroSection;
