import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { usePlatformStats } from "@/common/hooks/usePlatformStats";
import StatsSection from "@/components/homepage/StatsSection";

const fadeUp = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

/* ── FEATURES ── */
const FEATURES = [
  { icon: "🎯", title: "Expert Guidance",      desc: "Learn from toppers, mentors & achievers who've cracked SSC.", accent: "#F77F00", bg: "#fff7ed", border: "#fed7aa" },
  { icon: "📘", title: "Smart Practice",        desc: "Daily mock tests, quizzes & real exam pattern drills.", accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { icon: "📅", title: "Updated Content",       desc: "Latest syllabus, exam patterns & current affairs woven in.", accent: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { icon: "📈", title: "Performance Tracking",  desc: "Section-wise accuracy, percentile ranks & weak-topic heatmaps.", accent: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff" },
  { icon: "🧑‍🏫", title: "Mentor Live Rooms",   desc: "Drop-in doubt rooms with SSC tier-1 mentors. Recorded & searchable.", accent: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
  { icon: "🏆", title: "Proven Results",        desc: "1,280+ selections across CGL, CHSL, MTS & more since 2020.", accent: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
];

function FeatureCard({ f, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
      className="group relative rounded-2xl border bg-white p-7 transition-shadow"
      style={{ borderColor: "#e5e7eb" }}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" style={{ background: f.accent }} />
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
        {f.icon}
      </div>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "#9ca3af" }}>
        {String(i + 1).padStart(2, "0")}
      </span>
      <h3 className="mb-2 text-lg font-bold" style={{ color: "#0B2545" }}>{f.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
    </motion.div>
  );
}

export default function About() {
  const platformStats = usePlatformStats();
  return (
    <div className="min-h-screen" style={{ background: "#ffffff", fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="px-6 lg:px-8 pt-32 pb-20 text-center" style={{ background: "#ffffff" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-2xl mx-auto"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block mb-5 px-4 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ background: "#fff7ed", color: "#F77F00" }}
          >
            Who We Are
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-black leading-tight mb-5"
            style={{ color: "#0B2545" }}
          >
            Built for every<br />
            <span style={{ color: "#F77F00" }}>SSC Aspirant.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            SSC Pathnirman is committed to helping students crack SSC exams with adaptive mock tests, expert mentors, and real-time analytics — all in one platform.
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <StatsSection />

      {/* ── FEATURES ── */}
      <section className="px-6 lg:px-8 py-24" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14 max-w-xl"
          >
            <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
              Why Choose Us
            </span>
            <h2 className="text-4xl font-black leading-tight sm:text-5xl" style={{ color: "#0B2545" }}>
              Why students<br />
              <span style={{ color: "#F77F00" }}>trust us.</span>
            </h2>
            <p className="mt-4 text-lg" style={{ color: "#6b7280" }}>
              Every feature engineered around one goal — your selection.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ── */}
      <section className="px-6 lg:px-8 py-20" style={{ background: "#f9fafb" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
              Our Direction
            </span>
            <h2 className="text-4xl font-black" style={{ color: "#0B2545" }}>
              Mission &amp; <span style={{ color: "#F77F00" }}>Vision.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                label: "Our Mission",
                icon: "🎯",
                text: "Deliver affordable, high-quality SSC preparation to every aspirant in India — regardless of background, city, or resources.",
                accent: "#F77F00",
                bg: "#fff7ed",
                border: "#fed7aa",
              },
              {
                label: "Our Vision",
                icon: "🚀",
                text: "To become India's most trusted SSC preparation platform, measured not by revenue but by the number of names on the merit list.",
                accent: "#0B2545",
                bg: "#eff6ff",
                border: "#bfdbfe",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border bg-white p-10 overflow-hidden"
                style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
              >
                <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: card.accent }} />
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl text-3xl" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                  {card.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold" style={{ color: "#0B2545" }}>{card.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 lg:px-8 py-24 text-center" style={{ background: "#ffffff" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "#0B2545" }}>
            Ready to start your<br /><span style={{ color: "#F77F00" }}>SSC journey?</span>
          </h2>
          <p className="text-base mb-8" style={{ color: "#6b7280" }}>
            Join {platformStats.students.toLocaleString()}+ aspirants already preparing with SSC Pathnirman.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#F77F00", boxShadow: "0 8px 24px rgba(247,127,0,0.35)" }}
          >
            Start Free Today →
          </a>
        </motion.div>
      </section>

    </div>
  );
}
