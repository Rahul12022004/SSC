import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FiX, FiSave } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

/* ── Animated Avatar ── */
function AnimatedAvatar() {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 400;
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      
      const eyeX = (dx / distance) * normalizedDistance * 3.5;
      const eyeY = (dy / distance) * normalizedDistance * 3.5;
      setEyePosition({ x: eyeX || 0, y: eyeY || 0 });
    };
    
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{ display: "inline-block" }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 200 240" width="120" height="144">
        <defs>
          <radialGradient id="pm-bg-grad" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF9A56" />
            <stop offset="100%" stopColor="#F77F00" />
          </radialGradient>
          <linearGradient id="pm-skin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDAB9" />
            <stop offset="100%" stopColor="#F4C2A0" />
          </linearGradient>
          <linearGradient id="pm-shirt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B7C8F" />
            <stop offset="100%" stopColor="#4A5A6D" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="98" fill="url(#pm-bg-grad)" />
        <ellipse cx="100" cy="210" rx="70" ry="35" fill="url(#pm-shirt-grad)" />
        <rect x="30" y="180" width="140" height="60" fill="url(#pm-shirt-grad)" />
        <rect x="85" y="155" width="30" height="35" rx="6" fill="#E8A97A" />
        <ellipse cx="100" cy="75" rx="58" ry="50" fill="#1A2332" />
        <ellipse cx="42" cy="115" rx="12" ry="18" fill="url(#pm-skin-grad)" />
        <ellipse cx="158" cy="115" rx="12" ry="18" fill="url(#pm-skin-grad)" />
        <ellipse cx="100" cy="115" rx="54" ry="62" fill="url(#pm-skin-grad)" />
        <ellipse cx="100" cy="72" rx="56" ry="42" fill="#1A2332" />
        <path d="M 45 90 Q 50 65 58 88 Q 65 60 72 85 Q 78 58 85 82 Q 92 55 100 80 Q 108 55 115 82 Q 122 58 128 85 Q 135 60 142 88 Q 150 65 155 90" fill="#1A2332" />
        <path d="M 62 95 Q 72 90 82 92" stroke="#2C3544" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 118 92 Q 128 90 138 95" stroke="#2C3544" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        
        <circle cx="75" cy="110" r="20" fill="rgba(255,255,255,0.15)" />
        <circle cx="75" cy="110" r="20" fill="none" stroke="#2C3544" strokeWidth="3.5" />
        <circle cx="125" cy="110" r="20" fill="rgba(255,255,255,0.15)" />
        <circle cx="125" cy="110" r="20" fill="none" stroke="#2C3544" strokeWidth="3.5" />
        <line x1="95" y1="110" x2="105" y2="110" stroke="#2C3544" strokeWidth="3.5" strokeLinecap="round" />
        
        <ellipse cx="75" cy="110" rx="13" ry="14" fill="white" />
        <motion.g animate={{ x: eyePosition.x, y: eyePosition.y }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <circle cx="75" cy="110" r="8" fill="#6B4423" />
          <circle cx="75" cy="110" r="5.5" fill="#1e293b" />
          <circle cx="77" cy="108" r="2.5" fill="white" opacity="0.9" />
        </motion.g>

        <ellipse cx="125" cy="110" rx="13" ry="14" fill="white" />
        <motion.g animate={{ x: eyePosition.x, y: eyePosition.y }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <circle cx="125" cy="110" r="8" fill="#6B4423" />
          <circle cx="125" cy="110" r="5.5" fill="#1e293b" />
          <circle cx="127" cy="108" r="2.5" fill="white" opacity="0.9" />
        </motion.g>

        <path d="M 96 130 L 96 135 Q 96 137 98 137 L 102 137 Q 104 137 104 135 L 104 130" fill="none" stroke="#D4915A" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 80 145 Q 100 157 120 145" stroke="#B85A4A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="58" cy="130" rx="14" ry="10" fill="#FFB3A0" opacity="0.5" />
        <ellipse cx="142" cy="130" rx="14" ry="10" fill="#FFB3A0" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

/* ── Input Field ── */
function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#0B2545" }}>{label}</label>
      <input
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-[inherit]"
        style={{ borderColor: error ? "#ef4444" : "#e5e7eb", background: "#f9fafb", color: "#0B2545" }}
        onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.12)"; e.target.style.background = "#fff"; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#f9fafb"; }}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Modal ── */
export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();

  const [form, setForm]     = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    phone:     user?.phone     || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "firstName" || name === "lastName") { if (!/^[A-Za-z ]*$/.test(v)) return; v = v.slice(0, 50); }
    if (name === "phone") { if (!/^\d*$/.test(v)) return; v = v.slice(0, 10); }
    setForm(f => ({ ...f, [name]: v }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    const nameRe = /^[A-Za-z ]+$/;
    if (!form.firstName.trim())              e.firstName = "Required";
    else if (!nameRe.test(form.firstName))   e.firstName = "Letters only";
    if (!form.lastName.trim())               e.lastName  = "Required";
    else if (!nameRe.test(form.lastName))    e.lastName  = "Letters only";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Invalid Indian mobile number";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    if (result.success) {
      setToast({ type: "success", msg: "Profile updated!" });
      setTimeout(onClose, 1200);
    } else {
      setToast({ type: "error", msg: result.message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(11,37,69,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ borderTop: "3px solid #F77F00" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] font-mono mb-0.5" style={{ color: "#F77F00" }}>Account</span>
            <h2 className="text-lg font-black" style={{ color: "#0B2545" }}>Edit Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ color: "#6b7280" }}>
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Toast */}
          {toast && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                color:  toast.type === "success" ? "#16a34a" : "#dc2626",
              }}
            >
              <span>{toast.type === "success" ? "✓" : "✕"}</span>
              {toast.msg}
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-1">
            <AnimatedAvatar />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" name="firstName" placeholder="Rahul" value={form.firstName} onChange={handleChange} error={errors.firstName} />
            <Field label="Last Name"  name="lastName"  placeholder="Kumar"  value={form.lastName}  onChange={handleChange} error={errors.lastName}  />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#0B2545" }}>Email</label>
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#f3f4f6", color: "#9ca3af", border: "1px solid #e5e7eb" }}>
              {user?.email}
            </div>
            <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>Email cannot be changed</p>
          </div>

          <Field label="Phone (optional)" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} error={errors.phone} maxLength={10} />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "#F77F00", boxShadow: "0 6px 20px rgba(247,127,0,0.35)" }}
          >
            {saving
              ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <FiSave size={15} />
            }
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
