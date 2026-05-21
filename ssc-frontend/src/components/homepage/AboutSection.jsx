import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const pillars = [
  { tag: 'Mission',  title: 'Affordable selection for every aspirant.', text: 'Premium prep without metro-only price tags. Hindi + English mediums, mobile-first.' },
  { tag: 'Method',   title: 'Outcome-engineered curriculum.',           text: 'Every lecture maps to a syllabus node. Every quiz validates retention.' },
  { tag: 'Mentors',  title: 'Toppers who teach.',                       text: 'Recent SSC tier-1 selections lead live rooms. They remember the traps.' },
];

const AboutSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yVisual = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="about" className="py-28 px-6 lg:px-8" style={{ background: '#ffffff' }}>
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-4 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: '#fff7ed', color: '#F77F00' }}>
            About
          </span>
          <h2 className="mb-5 font-display text-4xl font-black leading-tight sm:text-5xl" style={{ color: '#0B2545' }}>
            We built what we<br />
            <span style={{ color: '#F77F00' }}>wish we'd had.</span>
          </h2>
          <p className="mb-8 max-w-xl text-lg leading-relaxed" style={{ color: '#4b5563' }}>
            SSC Pathnirman is built by selected officers and engineers who watched capable aspirants lose to slow feedback. We replaced the gaps with tech and mentorship.
          </p>
          <div className="space-y-4">
            {pillars.map((p, i) => (
              <motion.div
                key={p.tag}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="rounded-xl border-l-4 bg-white p-5 shadow-sm"
                style={{ borderLeftColor: '#F77F00', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: '#F77F00' }}>{p.tag}</span>
                <h3 className="mt-1 font-display text-base font-bold" style={{ color: '#0B2545' }}>{p.title}</h3>
                <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>{p.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div style={{ y: yVisual }} className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border shadow-xl" style={{ borderColor: '#e5e7eb' }}>
            {/* mock dashboard */}
            <div className="flex items-center gap-2 border-b px-5 py-3" style={{ background: '#0B2545', borderColor: '#1a3a6e' }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#fbbf24' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#94a3b8' }}>Live Dashboard</span>
            </div>

            <div className="p-6" style={{ background: '#f9fafb' }}>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <DashTile label="Accuracy" value="86%" color="#0B2545" light="#eff6ff" />
                <DashTile label="Percentile" value="98.4" color="#F77F00" light="#fff7ed" />
              </div>

              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>This Week</span>
                <span className="font-mono text-[10px]" style={{ color: '#16a34a' }}>+12.4%</span>
              </div>
              <div className="flex h-28 items-end gap-1.5">
                {[34, 48, 41, 62, 55, 72, 80, 68, 91, 78, 95, 88].map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                    className="flex-1 rounded-t"
                    style={{ background: `linear-gradient(to top, #F77F00, #fbbf24)` }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border p-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>Next Drill</div>
                  <div className="mt-1 font-display text-sm font-bold" style={{ color: '#0B2545' }}>Quant · Profit & Loss</div>
                </div>
                <button className="rounded-lg px-4 py-2 font-display text-xs font-bold text-white" style={{ background: '#F77F00' }}>
                  Start
                </button>
              </div>
            </div>
          </div>

          {/* floating streak badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-6 top-8 hidden rounded-xl border bg-white p-4 shadow-lg sm:block"
            style={{ borderColor: '#fed7aa' }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>Streak</div>
            <div className="mt-1 font-display text-2xl font-black" style={{ color: '#F77F00' }}>42 days</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const DashTile = ({ label, value, color, light }) => (
  <div className="rounded-xl border p-4" style={{ background: light, borderColor: '#e5e7eb' }}>
    <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>{label}</div>
    <div className="mt-1 font-display text-2xl font-black" style={{ color }}>{value}</div>
  </div>
);

export default AboutSection;
