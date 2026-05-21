import { motion } from "motion/react";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

const STATS = [
  { n: "12,000+", l: "Students Enrolled" },
  { n: "1,280+",  l: "Selections" },
  { n: "95%",     l: "Success Rate" },
  { n: "540+",    l: "Mock Tests Taken" },
];

const EXAMS = ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO", "SSC Stenographer", "SSC JE", "Selection Posts"];

export default function OurStudent() {
  return (
    <div className="min-h-screen" style={{ background: "#ffffff", fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="px-6 lg:px-8 pt-32 pb-20 text-center" style={{ background: "#ffffff" }}>
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto">
          <motion.span variants={fadeUp} className="inline-block mb-5 px-4 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
            Our Community
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black leading-tight mb-5" style={{ color: "#0B2545" }}>
            Students who made<br /><span style={{ color: "#F77F00" }}>it happen.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed" style={{ color: "#6b7280" }}>
            Thousands of aspirants from across India have cracked SSC exams with Pathnirman. Their journey inspires everything we build.
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="px-6 lg:px-8 py-16" style={{ background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border bg-white p-8 text-center"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
            >
              <div className="text-4xl font-black leading-none mb-3" style={{ color: "#F77F00" }}>{s.n}</div>
              <p className="text-sm font-medium" style={{ color: "#6b7280" }}>{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMING SOON ── */}
      <section className="px-6 lg:px-8 py-24" style={{ background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
              Success Stories
            </span>
            <h2 className="text-4xl font-black leading-tight sm:text-5xl" style={{ color: "#0B2545" }}>
              Real students,<br /><span style={{ color: "#F77F00" }}>real results.</span>
            </h2>
            <p className="mt-4 text-lg max-w-xl" style={{ color: "#6b7280" }}>
              Student testimonials and selection stories are on their way. Check back soon.
            </p>
          </motion.div>

          {/* placeholder cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border bg-white p-6 flex flex-col gap-4"
                style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                    <div className="h-2.5 w-16 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                  </div>
                  <div className="h-6 w-16 rounded-full animate-pulse" style={{ background: "#fff7ed" }} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-2.5 w-full rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                  <div className="h-2.5 w-5/6 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                  <div className="h-2.5 w-4/6 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                </div>
                <div className="mt-auto pt-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                  <div className="h-2.5 w-28 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "#fff7ed", color: "#F77F00", border: "1px solid #fed7aa" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#F77F00" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#F77F00" }} />
              </span>
              Stories dropping soon — stay tuned
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── EXAMS ── */}
      <section className="px-6 lg:px-8 py-16" style={{ background: "#f9fafb" }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <span className="mb-3 inline-block rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
              Exams Covered
            </span>
            <h2 className="text-3xl font-black" style={{ color: "#0B2545" }}>
              Selections across <span style={{ color: "#F77F00" }}>every SSC exam.</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {EXAMS.map((e, i) => (
              <motion.span
                key={e}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="px-5 py-2 rounded-full text-sm font-semibold border"
                style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#0B2545" }}
              >
                {e}
              </motion.span>
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
            Your name could be<br /><span style={{ color: "#F77F00" }}>next on the list.</span>
          </h2>
          <p className="text-base mb-8" style={{ color: "#6b7280" }}>
            Join 12,000+ aspirants already preparing with SSC Pathnirman.
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
