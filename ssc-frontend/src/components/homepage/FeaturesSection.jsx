import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  { title: 'Adaptive Mock Engine',     desc: 'Tests recalibrate to your weak spots every session. Real exam pattern, real timer.', icon: AdaptiveIcon,  bg: '#fff7ed', border: '#fed7aa', accent: '#F77F00' },
  { title: 'Performance Telemetry',    desc: 'Section-wise accuracy, percentile forecast, and weak-topic heatmaps after every attempt.', icon: ChartIcon,    bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  { title: 'Mentor Live Rooms',        desc: 'Drop-in doubt rooms with SSC tier-1 mentors. Recorded, indexed, searchable.',  icon: MentorIcon,   bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  { title: 'Smart PYQ Vault',          desc: '12 years of papers tagged by topic and difficulty. Drill what you missed.',      icon: VaultIcon,    bg: '#fdf4ff', border: '#e9d5ff', accent: '#9333ea' },
  { title: 'Daily Currents',           desc: 'Five-minute digest at 7 AM. Static GK refreshers woven in automatically.',      icon: NewsIcon,     bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c' },
  { title: 'Anti-Cheat Proctoring',    desc: 'Browser-locked tests with focus tracking. Your rank is real.',                   icon: ShieldIcon,   bg: '#f0f9ff', border: '#bae6fd', accent: '#0284c7' },
];

const FeatureCard = ({ f, i }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = f.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
      className="group relative rounded-2xl border bg-white p-7 transition-shadow"
      style={{ borderColor: '#e5e7eb' }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: f.accent }}
      />
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
        <Icon className="h-6 w-6" style={{ color: f.accent }} />
      </div>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#9ca3af' }}>
        {String(i + 1).padStart(2, '0')}
      </span>
      <h3 className="mb-2 font-display text-xl font-bold" style={{ color: '#0B2545' }}>{f.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{f.desc}</p>
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section id="features" className="py-28 px-6 lg:px-8" style={{ background: '#f9fafb' }}>
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-16 max-w-2xl"
      >
        <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: '#fff7ed', color: '#F77F00' }}>
          Capabilities
        </span>
        <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl" style={{ color: '#0B2545' }}>
          Built to put you on<br />
          <span style={{ color: '#F77F00' }}>the merit list.</span>
        </h2>
        <p className="mt-4 text-lg" style={{ color: '#6b7280' }}>
          Every module engineered around one metric: your selection.
        </p>
      </motion.div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
      </div>
    </div>
  </section>
);

function AdaptiveIcon({ className, style }) { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5m0 14h16M4 19l5-5 4 3 7-8" /><circle cx="20" cy="9" r="1.5" fill="currentColor" /></svg>; }
function ChartIcon({ className, style })   { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="6" width="4" height="15" rx="1" /><rect x="17" y="9" width="4" height="12" rx="1" /></svg>; }
function MentorIcon({ className, style })  { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 21c1.5-4 5-6 7-6s5.5 2 7 6" /></svg>; }
function VaultIcon({ className, style })   { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M12 9v-2M12 15v2M9 12H7M17 12h-2" /></svg>; }
function NewsIcon({ className, style })    { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="16" rx="2" /><path d="M17 8h4v10a2 2 0 01-2 2h-2" /><path d="M7 9h6M7 13h6M7 17h4" /></svg>; }
function ShieldIcon({ className, style })  { return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>; }

export default FeaturesSection;
