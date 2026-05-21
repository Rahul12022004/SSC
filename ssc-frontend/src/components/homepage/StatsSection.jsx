import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePlatformStats } from '@/common/hooks/usePlatformStats';

const useCounter = (end, duration = 2000, active = false) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active || !end) return;
    let raf, t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      setN(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step); else setN(end);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, active]);
  return n;
};

const StatCard = ({ value, suffix, label, sub, color, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const n = useCounter(value, 2000, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
      className="relative overflow-hidden rounded-2xl border bg-white p-8 transition-shadow"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-[0.08]" style={{ background: color }} />
      <div className="font-display text-5xl font-black" style={{ color }}>
        {n.toLocaleString()}<span className="text-3xl">{suffix}</span>
      </div>
      <div className="mt-4 font-display text-lg font-bold" style={{ color: '#0B2545' }}>{label}</div>
      <div className="mt-1 text-sm" style={{ color: '#6b7280' }}>{sub}</div>
    </motion.div>
  );
};

const StatsSection = () => {
  const { students, quizzes, selections } = usePlatformStats();

  const stats = [
    { value: students,    suffix: '+', label: 'Students Enrolled', sub: 'Active across India',    color: '#F77F00', delay: 0 },
    { value: quizzes,     suffix: '+', label: 'Mock Tests',         sub: 'Full & Sectional',       color: '#2563eb', delay: 0.08 },
    { value: 90, suffix: '%', label: 'Success Rate',       sub: 'CGL · CHSL · MTS',      color: '#16a34a', delay: 0.16 },
    { value: selections,  suffix: '+', label: 'Selections',         sub: '90% selection rate',      color: '#9333ea', delay: 0.24 },
  ];

  return (
    <section id="stats" className="py-28 px-6 lg:px-8" style={{ background: '#f9fafb' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: '#fff7ed', color: '#F77F00' }}>
            Numbers
          </span>
          <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl" style={{ color: '#0B2545' }}>
            Outcomes you can <span style={{ color: '#F77F00' }}>verify.</span>
          </h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
