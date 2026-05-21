import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function OtpVerify() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const initialInfo = location.state?.info || "";

  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(initialInfo);
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(initialInfo ? 0 : RESEND_COOLDOWN);

  const inputsRef = useRef([]);

  // Redirect away if email missing in state
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (email) {
      inputsRef.current[0]?.focus();
    }
  }, [email]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-clear error after 3s
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const otp = useMemo(() => digits.join(""), [digits]);

  const setDigitAt = useCallback((index, value) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const focusIndex = useCallback((index) => {
    if (index < 0 || index >= OTP_LENGTH) return;
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select?.();
  }, []);

  const handleChange = (e, index) => {
    const raw = e.target.value;
    // Keep only digits
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      setDigitAt(index, "");
      return;
    }

    // If multiple digits pasted into a single box, distribute
    if (onlyDigits.length > 1) {
      setDigits(prev => {
        const next = [...prev];
        let cursor = index;
        for (const ch of onlyDigits.split("")) {
          if (cursor >= OTP_LENGTH) break;
          next[cursor] = ch;
          cursor += 1;
        }
        focusIndex(Math.min(cursor, OTP_LENGTH - 1));
        return next;
      });
      return;
    }

    setDigitAt(index, onlyDigits);
    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
        return;
      }
      if (index > 0) {
        focusIndex(index - 1);
        setDigitAt(index - 1, "");
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < Math.min(pasted.length, OTP_LENGTH); i += 1) {
      next[i] = pasted[i];
    }
    setDigits(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({ email, otp });
      if (res?.success) {
        setSuccess(res.message || "Email verified successfully");
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { message: "Email verified! You can now log in." },
          });
        }, 800);
      } else {
        setError(res?.message || "Invalid or expired OTP");
        setDigits(Array(OTP_LENGTH).fill(""));
        focusIndex(0);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setSuccess("");
    setInfo("");

    try {
      setResending(true);
      const res = await resendOtp({ email });
      if (res?.success) {
        setInfo(res.message || "A new OTP has been sent to your email");
        setCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(""));
        focusIndex(0);
      } else {
        setError(res?.message || "Could not resend OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  // OTP input base classes — filled state applied conditionally
  const otpInputBase = "w-12 h-14 p-0 rounded-[10px] border border-[#e0e0e0] bg-[#f9fafb] text-[22px] font-semibold text-center text-[#0b2545] transition-all duration-[250ms] ease-in-out box-border focus:border-[#F77F00] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-[#F77F00]/20 sm:w-[42px] sm:h-[50px] sm:text-[20px]";
  const otpInputFilled = "bg-white border-[#F77F00]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#eef2f7] flex justify-center items-center p-5 pt-20">
      <div className="bg-white p-10 rounded-2xl w-full max-w-[440px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-t-[5px] border-[#F77F00]">
        <h2 className="text-center mb-2 text-[#0b2545] font-semibold text-xl">Verify Your Email</h2>
        <p className="text-center text-[13px] text-[#4b5563] mt-0 mb-[22px] leading-relaxed">
          Enter the 6-digit code we sent to{" "}
          <span className="text-[#0b2545] font-semibold break-all">{email}</span>
        </p>

        <form className="flex flex-col gap-[14px]" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-1" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className={`${otpInputBase}${digit ? ` ${otpInputFilled}` : ""}`}
                aria-label={`Digit ${index + 1}`}
                disabled={loading}
              />
            ))}
          </div>

          {error && <p className="text-[#e63946] text-[13px] text-center mt-1">{error}</p>}
          {success && <p className="text-[#2ecc71] text-[13px] text-center mt-1">{success}</p>}
          {info && !error && !success && (
            <p className="text-[#0b2545] bg-[#eef2f7] border border-[#d0d7e8] rounded-[10px] text-[13px] text-center px-3 py-[10px] mt-1">
              {info}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-[13px] mt-2 bg-gradient-to-br from-[#F77F00] to-[#ff8c00] text-white rounded-[10px] font-semibold border-none transition-all duration-[250ms] ease-in-out hover:from-[#e76f00] hover:to-[#d96c00] disabled:bg-[#ccc] disabled:cursor-not-allowed cursor-pointer"
            disabled={loading || otp.length !== OTP_LENGTH}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-[6px] text-[13px] text-[#4b5563] mt-[14px]">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            className="bg-transparent border-none p-0 m-0 text-[13px] font-semibold text-[#F77F00] cursor-pointer disabled:text-[#9ca3af] disabled:cursor-not-allowed hover:underline"
            onClick={handleResend}
            disabled={cooldown > 0 || resending || loading}
          >
            {resending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend OTP"}
          </button>
        </div>

        <div className="text-center mt-[18px] text-sm">
          Wrong email? <Link className="text-[#0b2545] font-medium" to="/register">Register again</Link>
        </div>
      </div>
    </div>
  );
}

export default OtpVerify;
