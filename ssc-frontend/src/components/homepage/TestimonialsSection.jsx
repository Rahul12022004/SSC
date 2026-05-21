import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const testimonials = [
  { name: 'Rahul Sharma',  role: 'SSC CGL 2023 · AIR 412',        initials: 'RS', color: '#F77F00', quote: 'Heatmaps caught a quant blindspot in week two. I would have shipped that gap into the real paper. My mocks were tier-1 grade within six weeks.' },
  { name: 'Priya Singh',   role: 'SSC CHSL · Joined CBDT',        initials: 'PS', color: '#2563eb', quote: 'The mentor rooms felt like real coaching without the commute. Recordings are indexed by topic — I rewatch only the part I missed.' },
  { name: 'Amit Kumar',    role: 'SSC MTS · Selected',            initials: 'AK', color: '#16a34a', quote: 'Anti-cheat proctoring means my rank means something. The percentile prediction was within 0.4 of my real result.' },
  { name: 'Sneha Verma',   role: 'CGL · Income Tax Inspector',    initials: 'SV', color: '#9333ea', quote: 'Adaptive drills, daily currents, and a real human checking in every week. No course felt this calm under pressure.' },
];

const TestimonialsSection = () => {
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setIdx(i => (i + 1) % testimonials.length), []);
  const prev = useCallback(() => setIdx(i => (i - 1 + testimonials.length) % testimonials.length), []);
  useEffect(() => { if (paused) return; const t = setInterval(next, 5500); return () => clearInterval(t); }, [paused, next]);
  const t = testimonials[idx];

  return (
    <section id="testimonials" className="py-28 px-6 lg:px-8" style={{ background: '#ffffff' }}>
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: '#fff7ed', color: '#F77F00' }}>
            Success Stories
          </span>
          <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl" style={{ color: '#0B2545' }}>
            Selections, not screenshots.<br />
            <span style={{ color: '#F77F00' }}>These officers used Pathnirman.</span>
          </h2>
        </motion.div>

        <div
          className="relative rounded-2xl border bg-white shadow-xl p-8 sm:p-12"
          style={{ borderColor: '#e5e7eb' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* top orange bar */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg,#F77F00,#fbbf24)` }} />

          <svg className="mb-6 h-10 w-10 opacity-15" viewBox="0 0 24 24" fill="#0B2545" aria-hidden="true">
            <path d="M7.17 17.5c-2.16 0-3.92-1.76-3.92-3.92 0-3.66 3.05-6.91 6.92-7.58l.59 1.74c-2.49.55-4.32 2.43-4.66 4.27.36-.18.79-.29 1.25-.29 1.79 0 3.25 1.46 3.25 3.25 0 1.79-1.46 2.53-3.43 2.53zm10 0c-2.16 0-3.92-1.76-3.92-3.92 0-3.66 3.05-6.91 6.92-7.58l.59 1.74c-2.49.55-4.32 2.43-4.66 4.27.36-.18.79-.29 1.25-.29 1.79 0 3.25 1.46 3.25 3.25 0 1.79-1.46 2.53-3.43 2.53z" />
          </svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-8 font-display text-xl font-medium leading-relaxed sm:text-2xl" style={{ color: '#1f2937' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl font-display text-lg font-bold text-white" style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-display text-base font-bold" style={{ color: '#0B2545' }}>{t.name}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: i === idx ? '2.5rem' : '0.75rem', background: i === idx ? '#F77F00' : '#e5e7eb' }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {[{ fn: prev, dir: 'prev' }, { fn: next, dir: 'next' }].map(({ fn, dir }) => (
                <motion.button key={dir} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={fn}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-orange-400"
                  style={{ borderColor: '#e5e7eb', color: '#0B2545' }}>
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 ${dir === 'prev' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
