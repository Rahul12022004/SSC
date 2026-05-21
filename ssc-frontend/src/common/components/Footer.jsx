import { useState, useEffect } from "react";
import { FaInstagram, FaYoutube, FaTelegram, FaPhoneAlt, FaEye } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import logo from "@/assets/img/cut_transperent logo.png";
import http from "@/services/http";

const LINKS = {
  Platform: [
    { l: "Courses",     h: "/courses"      },
    { l: "Mock Tests",  h: "/tests"        },
    { l: "Batches",     h: "/batches"      },
    { l: "Our Mentors", h: "/our-mentors"  },
    { l: "About Us",    h: "/about"        },
  ],
  Resources: [
    { l: "Previous Papers",  h: "#" },
    { l: "Syllabus",         h: "#" },
    { l: "Cut-off Tracker",  h: "#" },
    { l: "Study Materials",  h: "#" },
    { l: "Blog",             h: "#" },
  ],
  Company: [
    { l: "About Us",     h: "/about"        },
    { l: "Contact",      h: "/contact"      },
    { l: "Our Students", h: "/our-students" },
    { l: "Privacy",      h: "/privacy"      },
  ],
};

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/ssc_pathnirman?igsh=YW5jMW1rbW82d252", Icon: FaInstagram, color: "#E1306C" },
  { label: "YouTube",   href: "https://youtube.com/@sscinstitutepathnirman?si=DMH9hvXPF4L4vReZ", Icon: FaYoutube,   color: "#FF0000" },
  { label: "Telegram",  href: "https://t.me/SSC_Pathnirman",                                       Icon: FaTelegram,  color: "#0088cc" },
];

export default function Footer() {
  const [visitors, setVisitors] = useState(null);

  useEffect(() => {
    const alreadyTracked = sessionStorage.getItem("ssc_visited");
    if (alreadyTracked) {
      // just fetch current count without incrementing
      http.get("/visitors").then(r => setVisitors(r.data.count)).catch(() => {});
    } else {
      // first visit this session — increment
      http.post("/visitors/track").then(r => {
        setVisitors(r.data.count);
        sessionStorage.setItem("ssc_visited", "1");
      }).catch(() => {});
    }
  }, []);

  return (
    <footer style={{ background: "#1a1f2e", color: "#cbd5e1" }}>

      {/* orange top rule */}
      <div style={{ height: 3, background: "linear-gradient(90deg,transparent,#F77F00 25%,#fbbf24 60%,#F77F00 80%,transparent)" }} />


      {/* ── MAIN GRID ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] items-start">

        {/* BRAND */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SSC Pathnirman" className="w-10 h-10 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            <div>
              <p className="text-[16px] font-extrabold leading-tight text-white">SSC Pathnirman</p>
              <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "#F77F00" }}>India's SSC Exam Prep</p>
            </div>
          </div>

          <p className="text-[13px] leading-[1.85]" style={{ color: "#94a3b8" }}>
            Adaptive mock tests, mentor-led doubt rooms, and real-time analytics — all engineered to get your name on the merit list.
          </p>

          {/* contact info */}
          <div className="flex flex-col gap-2.5">
            <a href="mailto:sscinstitutepathnirman@gmail.com"
              className="flex items-center gap-2.5 text-[13px] transition-colors hover:text-white"
              style={{ color: "#94a3b8" }}>
              <HiOutlineMail size={15} style={{ color: "#F77F00", flexShrink: 0 }} />
              sscinstitutepathnirman@gmail.com
            </a>
            <a href="tel:+919799500688"
              className="flex items-center gap-2.5 text-[13px] transition-colors hover:text-white"
              style={{ color: "#94a3b8" }}>
              <FaPhoneAlt size={12} style={{ color: "#F77F00", flexShrink: 0 }} />
              +91 97995 00688
            </a>
          </div>

          {/* socials */}
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ label, href, Icon, color }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8" }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "22"; e.currentTarget.style.color = color; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* LINK COLUMNS */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <p className="text-[11px] font-bold uppercase tracking-[2.5px] mb-5" style={{ color: "#F77F00" }}>
              {title}
            </p>
            <ul className="flex flex-col gap-3">
              {links.map(({ l, h }) => (
                <li key={l}>
                  <a href={h}
                    className="text-[13px] transition-colors hover:text-white"
                    style={{ color: "#94a3b8" }}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>

      {/* ── VISITOR COUNTER ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-8 flex justify-center">
        <div className="flex items-center gap-3 px-6 py-3 rounded-lg" style={{ background: "rgba(247,127,0,0.12)", border: "1px solid rgba(247,127,0,0.3)" }}>
          <FaEye size={18} style={{ color: "#F77F00" }} />
          <span className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
            {visitors !== null ? visitors.toLocaleString() : "..."}
          </span>
          <span className="text-[13px]" style={{ color: "#94a3b8" }}>total visitors</span>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
          {/* left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifySelf: "start", textAlign: "left" }}>
            <p className="text-[12px]" style={{ color: "#475569", margin: 0 }}>
              © {new Date().getFullYear()} SSC Pathnirman. All rights reserved.
            </p>
            <p className="text-[11px]" style={{ color: "#334155", margin: 0 }}>
              Build v1.0.0
            </p>
          </div>
          {/* center */}
          <p className="text-[11px]" style={{ color: "#334155", margin: 0, textAlign: "center", whiteSpace: "nowrap" }}>
            Developed by{" "}
            <a href="https://www.nexaviseconsulting.in/#" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: "#475569", fontWeight: 600 }}>
              Nexavise Consultancy Pvt. Ltd.
            </a>
          </p>
          {/* right */}
          <div style={{ textAlign: "right" }}>
            <a href="/policy" className="text-[12px] transition-colors hover:text-white" style={{ color: "#475569" }}>
              Site Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
