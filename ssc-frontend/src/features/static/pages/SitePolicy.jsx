import { useState } from "react";
import { motion } from "motion/react";

const SECTIONS = [
  { id: "terms",   label: "Terms & Conditions" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "refund",  label: "Refund Policy" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function SitePolicy() {
  const [active, setActive] = useState("terms");

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* HERO */}
      <div className="relative overflow-hidden pt-[140px] pb-20 px-6" style={{ background: "#0B2545" }}>
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(247,127,0,0.18) 0%, transparent 70%)"
        }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(#F77F00 1px, transparent 1px), linear-gradient(90deg, #F77F00 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg,#F77F00,#fbbf24,#d96c00)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: "rgba(247,127,0,0.15)", border: "1px solid rgba(247,127,0,0.35)" }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#F77F00" }} />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#fbbf24" }}>
              India Compliant · DPDP Act 2023
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-black mb-4" style={{ color: "#ffffff" }}>
            Site{" "}
            <span style={{ background: "linear-gradient(90deg,#F77F00,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Policy
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm" style={{ color: "#94a3b8" }}>
            Last Updated: 14 May 2026 &nbsp;·&nbsp; SSC Pathnirman, New Delhi, India
          </motion.p>
        </div>
      </div>

      {/* TABS */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "#ffffff", borderColor: "#e5e7eb" }}>
        <div className="max-w-4xl mx-auto px-6 flex gap-1">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className="px-5 py-4 text-sm font-semibold transition-all relative"
              style={{ color: active === s.id ? "#F77F00" : "#6b7280", background: "none", border: "none", cursor: "pointer" }}>
              {s.label}
              {active === s.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                  style={{ background: "#F77F00" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* ── TERMS & CONDITIONS ── */}
        {active === "terms" && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">
            <motion.p variants={fadeUp} className="text-sm px-4 py-3 rounded-lg"
              style={{ background: "#fff7ed", color: "#92400e", border: "1px solid #fed7aa" }}>
              By accessing or using SSC Pathnirman, you agree to comply with these Terms and Conditions. If you do not agree, please discontinue use immediately.
            </motion.p>

            <PolicyCard variants={fadeUp} number="01" title="Acceptance of Terms">
              <p>By using SSC Pathnirman, users acknowledge that they have read, understood, and agreed to these Terms. Continued use of the platform constitutes acceptance of any revised Terms.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="02" title="User Responsibilities">
              <p className="mb-3">Users agree NOT to:</p>
              <BulletList items={[
                "Violate any applicable laws or regulations",
                "Attempt unauthorized access to the platform or its systems",
                "Upload malicious software or harmful code",
                "Spread spam, phishing, or misleading content",
                "Create fake accounts or impersonate others",
                "Abuse or exploit platform services",
                "Copy or misuse any platform content",
              ]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="03" title="Account Security">
              <p>Users are responsible for maintaining the confidentiality of their login credentials. SSC Pathnirman is not responsible for unauthorized access caused by user negligence.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="04" title="Intellectual Property">
              <p className="mb-3">All platform content including the following is the property of SSC Pathnirman unless otherwise stated. Unauthorized reproduction is strictly prohibited.</p>
              <BulletList items={["Logos & Branding", "Source Code", "UI Design", "Text Content", "Graphics & Media"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="05" title="User Content">
              <p>Users retain ownership of content they upload. However, SSC Pathnirman may use, display, or process such content for platform functionality and legal compliance. Users are solely responsible for content uploaded by them.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="06" title="Termination of Access">
              <p>SSC Pathnirman reserves the right to suspend or terminate accounts that violate these Terms or applicable laws without prior notice.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="07" title="Third-Party Services">
              <p className="mb-3">SSC Pathnirman may integrate third-party services. We are not responsible for third-party service failures or their policies.</p>
              <BulletList items={["Google Login", "Firebase", "Razorpay", "Analytics Providers"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="08" title="Limitation of Liability">
              <p className="mb-3">SSC Pathnirman shall not be liable for:</p>
              <BulletList items={["Indirect damages", "Data loss", "Business interruption", "Financial losses", "Service downtime"]} />
              <p className="mt-3">Use of the platform is at the user's own risk.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="09" title="Disclaimer">
              <p>SSC Pathnirman provides services on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee uninterrupted or error-free operation, nor do we guarantee exam results or selections.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="10" title="Governing Law">
              <p>These Terms shall be governed by the laws of India. Any disputes shall fall under the jurisdiction of courts located in <strong>New Delhi, India</strong>.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="11" title="Modifications to Terms">
              <p>SSC Pathnirman reserves the right to update these Terms at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="12" title="Contact Information">
              <div className="flex flex-col gap-1">
                <p>Email: <a href="mailto:sscinstitutepathnirman@gmail.com" style={{ color: "#F77F00" }}>sscinstitutepathnirman@gmail.com</a></p>
                <p>Phone: <a href="tel:+919799500688" style={{ color: "#F77F00" }}>+91 97995 00688</a></p>
              </div>
            </PolicyCard>
          </motion.div>
        )}

        {/* ── PRIVACY POLICY ── */}
        {active === "privacy" && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">
            <motion.p variants={fadeUp} className="text-sm px-4 py-3 rounded-lg"
              style={{ background: "#fff7ed", color: "#92400e", border: "1px solid #fed7aa" }}>
              This Privacy Policy is designed in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong>, Information Technology Act, 2000, and applicable IT Rules.
            </motion.p>

            <PolicyCard variants={fadeUp} number="01" title="Information We Collect">
              <BulletList items={["Full Name", "Email Address", "Mobile Number", "Login Credentials", "IP Address", "Browser & Device Information", "Usage Analytics", "Uploaded Content", "Cookies and Session Data"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="02" title="Purpose of Data Collection">
              <BulletList items={["User Registration & Authentication", "Account Management", "Customer Support", "Security and Fraud Prevention", "Improving User Experience", "Website Analytics", "Legal Compliance"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="03" title="User Consent">
              <p>By accessing SSC Pathnirman, users consent to the collection, storage, and processing of personal data for the lawful purposes mentioned in this policy. Users may withdraw consent at any time by contacting us.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="04" title="Cookies Policy">
              <p>We use cookies to maintain user sessions, improve website performance, analyze traffic, and store user preferences. You can disable cookies through your browser settings.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="05" title="Data Sharing">
              <p className="mb-3">We do not sell personal information. We may share data with:</p>
              <BulletList items={["Trusted service providers", "Payment gateways", "Hosting providers", "Analytics providers", "Government authorities when legally required"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="06" title="Data Security">
              <p>We implement reasonable technical and organizational security measures to protect user data against unauthorized access, data theft, misuse, disclosure, alteration, and destruction. However, no internet transmission is completely secure.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="07" title="Your Rights">
              <p className="mb-3">Under applicable Indian laws, you have the right to:</p>
              <BulletList items={["Access your personal data", "Correct inaccurate data", "Request deletion of your data", "Withdraw consent", "Raise grievances with the Grievance Officer"]} />
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="08" title="Data Retention">
              <p>We retain personal data only for as long as necessary for lawful business purposes or legal obligations. Upon account deletion, data is removed within 30 days.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="09" title="Children's Privacy">
              <p>SSC Pathnirman does not knowingly collect personal information from children without lawful guardian consent. If such data is identified, it will be removed promptly.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="10" title="Third-Party Services">
              <p>We may use third-party services including Google Services, Firebase, Analytics Providers, and Payment Gateways. These services have their own separate privacy policies.</p>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="11" title="Grievance Officer">
              <div className="flex flex-col gap-1">
                <p><strong style={{ color: "#0B2545" }}>Name:</strong> SSC Pathnirman Support Team</p>
                <p><strong style={{ color: "#0B2545" }}>Email:</strong> <a href="mailto:sscinstitutepathnirman@gmail.com" style={{ color: "#F77F00" }}>sscinstitutepathnirman@gmail.com</a></p>
                <p><strong style={{ color: "#0B2545" }}>Response Time:</strong> Within 15 business days</p>
              </div>
            </PolicyCard>

            <PolicyCard variants={fadeUp} number="12" title="Policy Changes">
              <p>SSC Pathnirman reserves the right to modify this Privacy Policy at any time. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
            </PolicyCard>
          </motion.div>
        )}

        {/* ── REFUND POLICY ── */}
        {active === "refund" && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">
            <PolicyCard variants={fadeUp} number="01" title="Refund Eligibility">
              <p>Refund requests must be raised within <strong>7 days of purchase</strong> by emailing us with your order details and reason for the request.</p>
            </PolicyCard>
            <PolicyCard variants={fadeUp} number="02" title="Non-Refundable Cases">
              <p>Refunds are not applicable once course or test content has been accessed, downloaded, or consumed in any form.</p>
            </PolicyCard>
            <PolicyCard variants={fadeUp} number="03" title="Processing Time">
              <p>Approved refunds will be processed within <strong>7–10 business days</strong> to the original payment method used at the time of purchase.</p>
            </PolicyCard>
            <PolicyCard variants={fadeUp} number="04" title="Contact for Disputes">
              <div className="flex flex-col gap-1">
                <p>Email: <a href="mailto:sscinstitutepathnirman@gmail.com" style={{ color: "#F77F00" }}>sscinstitutepathnirman@gmail.com</a></p>
                <p>Phone: <a href="tel:+919799500688" style={{ color: "#F77F00" }}>+91 97995 00688</a></p>
              </div>
            </PolicyCard>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#0B2545" }}>
          <p className="text-lg font-bold mb-1" style={{ color: "#ffffff" }}>Have questions about our policies?</p>
          <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>Our support team is happy to help.</p>
          <a href="mailto:sscinstitutepathnirman@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#F77F00,#d96c00)" }}>
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function PolicyCard({ number, title, children, variants }) {
  return (
    <motion.div variants={variants} className="rounded-2xl p-6 border"
      style={{ background: "#f8fafc", borderColor: "#e5e7eb" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white flex-shrink-0"
          style={{ background: "#F77F00" }}>{number}</span>
        <h3 className="text-lg font-bold" style={{ color: "#0B2545" }}>{title}</h3>
      </div>
      <div className="text-[15px] leading-relaxed" style={{ color: "#4b5563" }}>
        {children}
      </div>
    </motion.div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map(i => (
        <li key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "#F77F00" }} />
          {i}
        </li>
      ))}
    </ul>
  );
}
