import { useState, useEffect } from "react";
import { FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

function PasswordField({ label, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#0B2545" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all font-[inherit]"
          style={{ borderColor: error ? "#ef4444" : "#e5e7eb", background: "#f9fafb", color: "#0B2545" }}
          onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.12)"; e.target.style.background = "#fff"; }}
          onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#f9fafb"; }}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "#9ca3af" }}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();

  const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value.slice(0, 15) }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{6,15}$/;
    if (!form.currentPassword)               e.currentPassword = "Required";
    if (!form.newPassword)                   e.newPassword     = "Required";
    else if (!passwordRegex.test(form.newPassword))
      e.newPassword = "6-15 chars, 1 capital, 1 number, 1 special (@#$%&*!)";
    if (!form.confirmPassword)               e.confirmPassword = "Required";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (form.currentPassword && form.currentPassword === form.newPassword)
      e.newPassword = "New password must differ from current";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword:     form.newPassword,
    });
    setSaving(false);
    if (result.success) {
      setToast({ type: "success", msg: "Password changed successfully!" });
      setTimeout(onClose, 1400);
    } else {
      setToast({ type: "error", msg: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(11,37,69,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ borderTop: "3px solid #F77F00" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] font-mono mb-0.5" style={{ color: "#F77F00" }}>Security</span>
            <h2 className="text-lg font-black" style={{ color: "#0B2545" }}>Change Password</h2>
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
                color: toast.type === "success" ? "#16a34a" : "#dc2626",
              }}
            >
              <span>{toast.type === "success" ? "✓" : "✕"}</span>
              {toast.msg}
            </div>
          )}

          <PasswordField label="Current Password"  name="currentPassword"  placeholder="Enter current password" value={form.currentPassword}  onChange={handleChange} error={errors.currentPassword}  />
          <PasswordField label="New Password"       name="newPassword"       placeholder="Min 6 chars, 1 cap, 1 number, 1 special" value={form.newPassword}       onChange={handleChange} error={errors.newPassword}       />
          <PasswordField label="Confirm New Password" name="confirmPassword" placeholder="Repeat new password"     value={form.confirmPassword}   onChange={handleChange} error={errors.confirmPassword}   />

          <p className="text-xs" style={{ color: "#9ca3af" }}>
            Requirements: 6–15 characters · 1 uppercase · 1 number · 1 special character (@#$%&*!)
          </p>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "#F77F00", boxShadow: "0 6px 20px rgba(247,127,0,0.35)" }}
          >
            {saving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FiLock size={15} />}
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
