import { useState, useRef, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FaTelegram, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion } from "motion/react";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

const INFO = [
  {
    icon: <FaPhoneAlt size={18} />,
    label: "Phone",
    value: "+91 97995 00688",
    href: "tel:+919799500688",
    accent: "#F77F00",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  {
    icon: <FaEnvelope size={18} />,
    label: "Email",
    value: "sscinstitutepathnirman@gmail.com",
    href: "mailto:sscinstitutepathnirman@gmail.com",
    accent: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
];

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/ssc_pathnirman?igsh=YW5jMW1rbW82d252", Icon: FaInstagram, color: "#E1306C" },
  { label: "YouTube",   href: "https://youtube.com/@sscinstitutepathnirman?si=DMH9hvXPF4L4vReZ", Icon: FaYoutube,   color: "#FF0000" },
  { label: "Telegram",  href: "https://t.me/SSC_Pathnirman",                                       Icon: FaTelegram,  color: "#0088cc" },
];

function InputField({ label, error, inputRef, textarea, ...props }) {
  const base = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-[inherit]";
  const style = { borderColor: error ? "#ef4444" : "#e5e7eb", background: "#f9fafb", color: "#0B2545" };
  const focus = {
    onFocus: e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.12)"; e.target.style.background = "#fff"; },
    onBlur:  e => { e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#f9fafb"; },
  };
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#0B2545" }}>{label}</label>
      {textarea
        ? <textarea ref={inputRef} className={`${base} resize-none`} style={{ ...style, minHeight: 130 }} {...focus} {...props} />
        : <input    ref={inputRef} className={base}                  style={style}                        {...focus} {...props} />
      }
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors]     = useState({});
  const [sent, setSent]         = useState(false);

  const refs = { name: useRef(), email: useRef(), subject: useRef(), message: useRef() };

  useEffect(() => {
    if (!Object.keys(errors).length) return;
    const t = setTimeout(() => setErrors({}), 3000);
    return () => clearTimeout(t);
  }, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "name")    { if (!/^[A-Za-z .-]*$/.test(v)) return; v = v.slice(0, 50); }
    if (name === "email")   { if (!/^[a-zA-Z0-9@._-]*$/.test(v)) return; v = v.slice(0, 100); }
    if (name === "subject") { if (!/^[A-Za-z .-]*$/.test(v)) return; v = v.slice(0, 100); }
    if (name === "message") { v = v.slice(0, 500); }
    setFormData(f => ({ ...f, [name]: v }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())                                   e.name    = "Name is required";
    else if (!/^[A-Za-z .-]+$/.test(formData.name))             e.name    = "Only letters allowed";
    if (!formData.email.trim())                                  e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))e.email   = "Invalid email format";
    if (!formData.subject.trim())                                e.subject = "Subject is required";
    if (!formData.message.trim())                                e.message = "Message is required";
    else if (formData.message.length < 10)                       e.message = "Minimum 10 characters";
    setErrors(e);
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      refs[Object.keys(errs)[0]]?.current?.focus();
      return;
    }
    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="px-6 lg:px-8 pt-32 pb-16 text-center" style={{ background: "#ffffff" }}>
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto">
          <motion.span variants={fadeUp} className="inline-block mb-5 px-4 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "#fff7ed", color: "#F77F00" }}>
            Get In Touch
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: "#0B2545" }}>
            We're here to<br /><span style={{ color: "#F77F00" }}>help you.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg" style={{ color: "#6b7280" }}>
            Questions, feedback, or just want to say hi? Reach out — we respond fast.
          </motion.p>
        </motion.div>
      </section>

      {/* ── INFO CARDS ── */}
      <section className="px-6 lg:px-8 pb-12" style={{ background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5">
          {INFO.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
              className="group relative rounded-2xl border bg-white p-6 text-center overflow-hidden"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
            >
              <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" style={{ background: item.accent }} />
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.accent }}>
                {item.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>{item.label}</p>
              {item.href
                ? <a href={item.href} className="text-sm font-semibold transition-colors hover:opacity-80 break-all" style={{ color: "#0B2545" }}>{item.value}</a>
                : <p className="text-sm font-semibold" style={{ color: "#0B2545" }}>{item.value}</p>
              }
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FORM + SOCIAL ── */}
      <section className="px-6 lg:px-8 py-16" style={{ background: "#f9fafb" }}>
        <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border bg-white p-8"
            style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderTop: "3px solid #F77F00" }}
          >
            <h2 className="text-2xl font-black mb-6" style={{ color: "#0B2545" }}>Send a Message</h2>

            {sent && (
              <div className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
                <span>✓</span> Message sent! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField label="Your Name" name="name" placeholder="Rahul Kumar" value={formData.name} onChange={handleChange} inputRef={refs.name} error={errors.name} />
                <InputField label="Email Address" name="email" placeholder="you@email.com" value={formData.email} onChange={handleChange} inputRef={refs.email} error={errors.email} />
              </div>
              <InputField label="Subject" name="subject" placeholder="What's this about?" value={formData.subject} onChange={handleChange} inputRef={refs.subject} error={errors.subject} />
              <InputField label="Message" name="message" placeholder="Write your message here..." value={formData.message} onChange={handleChange} inputRef={refs.message} error={errors.message} textarea maxLength={500} />
              <p className="text-xs text-right" style={{ color: "#9ca3af" }}>{formData.message.length}/500</p>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "#F77F00", boxShadow: "0 6px 20px rgba(247,127,0,0.35)" }}
              >
                Send Message →
              </button>
            </form>
          </motion.div>

          {/* Social + hours */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Follow us */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F77F00" }}>Follow Us</p>
              <div className="flex flex-col gap-3">
                {SOCIAL.map(({ label, href, Icon, color }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: "#f9fafb", color: "#0B2545", border: "1px solid #e5e7eb" }}
                    onMouseEnter={e => { e.currentTarget.style.background = color + "14"; e.currentTarget.style.borderColor = color + "44"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  >
                    <Icon size={16} style={{ color, flexShrink: 0 }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Support hours */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F77F00" }}>Support Hours</p>
              {[
                { day: "Mon – Sat", time: "9:00 AM – 8:00 PM" },
                { day: "Sunday",    time: "10:00 AM – 5:00 PM" },
              ].map(({ day, time }) => (
                <div key={day} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: "#f1f5f9" }}>
                  <span className="text-sm font-medium" style={{ color: "#6b7280" }}>{day}</span>
                  <span className="text-sm font-semibold" style={{ color: "#0B2545" }}>{time}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
