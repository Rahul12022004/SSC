import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import { useAuth, BASE_URL } from "@/context/AuthContext";

const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fpStep, setFpStep] = useState(null); // null | "email" | "otp" | "reset"
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPass, setFpPass] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState({ text: "", ok: true });
  const [showFpPass, setShowFpPass] = useState(false);
  const [showFpConfirm, setShowFpConfirm] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const captchaRef = useRef(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
  const location = useLocation();

  const redirectTo = location.state?.redirectTo;

  const emailRef = useRef();
  const passwordRef = useRef();

  const refs = {
    email: emailRef,
    password: passwordRef,
  };

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const timer = setTimeout(() => {
      setErrors({});
    }, 3000);

    return () => clearTimeout(timer);
  }, [errors]);

  const locationMessage = location.state?.message;
  useEffect(() => {
    if (!locationMessage) return;
    setSuccessMsg(locationMessage);
    const timer = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(timer);
  }, [locationMessage]);

  const validate = () => {
    let newErrors = {};

    // EMAIL
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // PASSWORD
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{6,15}$/;

      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "6-15 chars, 1 capital, 1 number, 1 special (@ # $ % & * !)";
      }
    }

    // CAPTCHA — only enforce if site key is configured
    if (!isLocalhost && recaptchaSiteKey && !recaptchaToken) {
      newErrors.captcha = "Please complete the reCAPTCHA";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // EMAIL (limit + allowed chars)
    if (name === "email") {
      if (!/^[a-zA-Z0-9@._-]*$/.test(value)) return;
      newValue = value.slice(0, 100);
    }

    if (name === "password") {
      if (!/^[A-Za-z\d@#$%&*!]*$/.test(value)) return;
      newValue = value.slice(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.keys(validationErrors)[0];
      refs[firstError]?.current?.focus();
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser({ ...formData, recaptchaToken });

      if (res?.success) {
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate("/");
        }
      } else if (res?.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-otp", {
          state: {
            email: res.email || formData.email,
            info: "Please verify your email to continue. Enter the OTP we sent you, or click 'Resend OTP'.",
          },
        });
      } else {
        setErrors({ password: res?.message || "Invalid email or password" });
        captchaRef.current?.reset();
        setRecaptchaToken("");
      }
    } catch {
      setErrors({ password: "Something went wrong" });
      captchaRef.current?.reset();
      setRecaptchaToken("");
    } finally {
      setLoading(false);
    }
  };

  const handleFpSendOtp = async () => {
    if (!fpEmail.trim()) return setFpMsg({ text: "Email is required", ok: false });
    setFpLoading(true); setFpMsg({ text: "", ok: true });
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) { setFpStep("otp"); setFpMsg({ text: "OTP sent to your email.", ok: true }); }
      else setFpMsg({ text: data.message || "Failed to send OTP", ok: false });
    } catch { setFpMsg({ text: "Something went wrong", ok: false }); }
    setFpLoading(false);
  };

  const handleFpReset = async () => {
    if (fpPass !== fpConfirm) return setFpMsg({ text: "Passwords do not match", ok: false });
    const rex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{6,15}$/;
    if (!rex.test(fpPass)) return setFpMsg({ text: "6-15 chars, 1 capital, 1 number, 1 special (@ # $ % & * !)", ok: false });
    setFpLoading(true); setFpMsg({ text: "", ok: true });
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim(), otp: fpOtp.trim(), newPassword: fpPass }),
      });
      const data = await res.json();
      if (data.success) {
        setFpStep(null); setFpEmail(""); setFpOtp(""); setFpPass(""); setFpConfirm("");
        setSuccessMsg("Password reset successfully! Please log in.");
      } else {
        setFpMsg({ text: data.message || "Reset failed", ok: false });
        if (data.message?.toLowerCase().includes("otp")) setFpStep("otp");
      }
    } catch { setFpMsg({ text: "Something went wrong", ok: false }); }
    setFpLoading(false);
  };

  // Shared input classes
  const inputCls = "w-full px-3 py-3 rounded-[10px] border border-[#e0e0e0] bg-[#f9fafb] text-sm text-[#0b2545] font-medium transition-all duration-[250ms] ease-in-out placeholder:text-[#9ca3af] focus:border-[#F77F00] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#F77F00]/20 box-border";

  // Shared button classes
  const btnCls = "w-full py-[13px] mt-[15px] bg-gradient-to-br from-[#F77F00] to-[#ff8c00] text-white rounded-[10px] font-semibold border-none transition-all duration-[250ms] ease-in-out hover:from-[#e76f00] hover:to-[#d96c00] disabled:bg-[#ccc] disabled:cursor-not-allowed cursor-pointer";

  // Ghost link button (fpLink / fpResend / fpBack)
  const ghostBtnCls = "bg-transparent border-none text-[#F77F00] text-[13px] font-medium p-0 mt-0 w-auto cursor-pointer underline shadow-none hover:text-[#d96c00] hover:bg-transparent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#eef2f7] flex justify-center items-center p-5 pt-20">
      <div className="bg-white p-10 rounded-2xl w-full max-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-t-[5px] border-[#F77F00]">
        {fpStep !== null ? (
          <>
            <h2 className="text-center mb-6 text-[#0b2545] font-semibold text-xl">Reset Password</h2>

            {fpMsg.text && (
              <p className={`text-center mb-[10px] text-[13px] ${fpMsg.ok ? "text-[#2ecc71]" : "text-[#e63946]"}`}>
                {fpMsg.text}
              </p>
            )}

            {fpStep === "email" && (
              <>
                <p className="text-[#475569] mb-3 text-sm">
                  Enter your registered email. We'll send you an OTP.
                </p>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="Your email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value.slice(0, 100))}
                  autoFocus
                />
                <button className={btnCls} onClick={handleFpSendOtp} disabled={fpLoading}>
                  {fpLoading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {fpStep === "otp" && (
              <>
                <p className="text-[#475569] mb-3 text-sm">
                  Enter the OTP sent to <strong>{fpEmail}</strong>.
                </p>
                <input
                  className={inputCls}
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit OTP"
                  value={fpOtp}
                  maxLength={6}
                  onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoFocus
                />
                <button
                  className={btnCls}
                  onClick={() => {
                    if (fpOtp.length < 6) return setFpMsg({ text: "Enter the 6-digit OTP", ok: false });
                    setFpStep("reset"); setFpMsg({ text: "", ok: true });
                  }}
                >
                  Verify OTP
                </button>
                <button type="button" className={`${ghostBtnCls} block mt-2 w-full text-center`} onClick={handleFpSendOtp} disabled={fpLoading}>
                  {fpLoading ? "Sending..." : "Resend OTP"}
                </button>
              </>
            )}

            {fpStep === "reset" && (
              <>
                <p className="text-[#475569] mb-3 text-sm">
                  Create your new password.
                </p>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10`}
                    type={showFpPass ? "text" : "password"}
                    placeholder="New Password"
                    value={fpPass}
                    onChange={(e) => {
                      if (!/^[A-Za-z\d@#$%&*!]*$/.test(e.target.value)) return;
                      setFpPass(e.target.value.slice(0, 15));
                    }}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#555]" onClick={() => setShowFpPass(!showFpPass)}>
                    {showFpPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="relative mt-[10px]">
                  <input
                    className={`${inputCls} pr-10`}
                    type={showFpConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={fpConfirm}
                    onChange={(e) => {
                      if (!/^[A-Za-z\d@#$%&*!]*$/.test(e.target.value)) return;
                      setFpConfirm(e.target.value.slice(0, 15));
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#555]" onClick={() => setShowFpConfirm(!showFpConfirm)}>
                    {showFpConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button className={`${btnCls} mt-3`} onClick={handleFpReset} disabled={fpLoading}>
                  {fpLoading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

            <button
              type="button"
              className={`${ghostBtnCls} block mt-4 w-full text-center no-underline text-[#64748b]`}
              onClick={() => { setFpStep(null); setFpMsg({ text: "", ok: true }); }}
            >
              ← Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-center mb-6 text-[#0b2545] font-semibold text-xl">Welcome Back</h2>

            {successMsg && (
              <p className="text-[#2ecc71] text-center mb-[10px]">
                {successMsg}
              </p>
            )}

            <form className="flex flex-col gap-[10px]" onSubmit={handleSubmit}>
              {/* EMAIL */}
              <input
                ref={refs.email}
                className={inputCls}
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.email}</p>}

              {/* PASSWORD */}
              <div className="relative">
                <input
                  ref={refs.password}
                  className={`${inputCls} pr-10`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#555]" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.password}</p>}

              <div className="text-right -mt-1 mb-[6px]">
                <button
                  type="button"
                  className={ghostBtnCls}
                  onClick={() => { setFpStep("email"); setFpMsg({ text: "", ok: true }); }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* CAPTCHA */}
              {!isLocalhost && (
                <div className="flex flex-col gap-[6px]">
                  {recaptchaSiteKey ? (
                    <ReCAPTCHA
                      ref={captchaRef}
                      sitekey={recaptchaSiteKey}
                      onChange={(token) => {
                        setRecaptchaToken(token || "");
                        setErrors((prev) => ({ ...prev, captcha: "" }));
                      }}
                      onExpired={() => setRecaptchaToken("")}
                    />
                  ) : (
                    <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">reCAPTCHA not configured</p>
                  )}
                </div>
              )}
              {errors.captcha && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.captcha}</p>}

              {/* BUTTON */}
              <button type="submit" className={btnCls} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center mt-[15px] text-sm">
              Don't have an account? <Link className="text-[#0b2545] font-medium" to="/register">Register</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
