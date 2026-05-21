import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { BsCircle } from "react-icons/bs";
import ReCAPTCHA from "react-google-recaptcha";

const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const timer = setTimeout(() => {
      setErrors({});
    }, 3000);

    return () => clearTimeout(timer);
  }, [errors]);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    captchaTrap: "",
  });
  const formStartedAtRef = useRef(Date.now());
  const captchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const [loading, setLoading] = useState(false);

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  /* INPUT REFS */
  const refs = {
    firstName: useRef(),
    middleName: useRef(),
    lastName: useRef(),
    email: useRef(),
    phone: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
  };

  /* VALIDATION (returns errors) */
  const validate = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z ]+$/;

    // FIRST NAME
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = "Only letters allowed";
    }

    // MIDDLE NAME (optional)
    if (formData.middleName && !nameRegex.test(formData.middleName)) {
      newErrors.middleName = "Only letters allowed";
    }

    // LAST NAME
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Only letters allowed";
    }

    // PHONE
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian mobile number";
    }

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

    // CONFIRM PASSWORD
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isLocalhost) {
      if (!recaptchaSiteKey) {
        newErrors.recaptcha = "reCAPTCHA is not configured yet";
      } else if (!recaptchaToken) {
        newErrors.recaptcha = "Please complete the reCAPTCHA";
      }
    }

    setErrors(newErrors);

    return newErrors;
  };

  /* KEY FILTER */
  const handleKeyDown = (e) => {
    const name = e.target.name;

    if (["firstName", "middleName", "lastName"].includes(name)) {
      if (!/[A-Za-z ]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }

    if (name === "password" || name === "confirmPassword") {
      if (!/[A-Za-z\d@#$%&*!]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  };

  /* CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    /* NAME (50 chars) */
    if (["firstName", "middleName", "lastName"].includes(name)) {
      if (!/^[A-Za-z ]*$/.test(value)) return;
      newValue = value.slice(0, 50);
    }

    /* PHONE (10 digits) */
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      newValue = value.slice(0, 10);
    }

    /* EMAIL (100 chars) */
    if (name === "email") {
      if (!/^[a-zA-Z0-9@._-]*$/.test(value)) return;
      newValue = value.slice(0, 100);
    }

    /* PASSWORD (15 chars) */
    if (name === "password") {
      if (!/^[A-Za-z\d@#$%&*!]*$/.test(value)) return;

      const cleaned = value.slice(0, 15);

      setFormData(prev => ({ ...prev, password: cleaned }));

      setPasswordRules({
        length: cleaned.length >= 6 && cleaned.length <= 15,
        uppercase: /[A-Z]/.test(cleaned),
        number: /\d/.test(cleaned),
        special: /[@#$%&*!]/.test(cleaned),
      });

      return;
    }

    /* CONFIRM PASSWORD (15 chars) */
    if (name === "confirmPassword") {
      if (!/^[A-Za-z\d@#$%&*!]*$/.test(value)) return;
      newValue = value.slice(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    /* remove error on typing */
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];

      if (refs[firstErrorField]?.current) {
        refs[firstErrorField].current.focus();
      }

      return;
    }

    try {
      setLoading(true);

      const res = await registerUser({
        ...formData,
        recaptchaToken,
        formStartedAt: formStartedAtRef.current,
      });
      if (res?.success) {
        captchaRef.current?.reset();
        setRecaptchaToken("");
        const info =
          res.emailSent === false
            ? "Account created, but we couldn't send the verification email. Please use 'Resend OTP'."
            : "We've sent a 6-digit verification code to your email.";

        navigate("/verify-otp", {
          state: { email: formData.email, info },
        });
      } else {
        captchaRef.current?.reset();
        setRecaptchaToken("");
        setErrors({
          confirmPassword: res?.message || "Registration failed",
        });
      }
    } catch {
      captchaRef.current?.reset();
      setRecaptchaToken("");
      setErrors({
        confirmPassword: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  // Shared input classes
  const inputCls = "w-full px-3 py-3 rounded-[10px] border border-[#e0e0e0] bg-[#f9fafb] text-sm text-[#0b2545] font-medium tracking-[0.3px] transition-all duration-[250ms] ease-in-out placeholder:text-[#9ca3af] placeholder:font-normal focus:border-[#F77F00] focus:bg-white focus:text-[#0b2545] focus:outline-none focus:ring-[3px] focus:ring-[#F77F00]/20 box-border";

  const btnCls = "w-full py-[13px] mt-[15px] bg-gradient-to-br from-[#F77F00] to-[#ff8c00] text-white rounded-[10px] font-semibold border-none transition-all duration-[250ms] ease-in-out hover:from-[#e76f00] hover:to-[#d96c00] disabled:bg-[#ccc] disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#eef2f7] flex justify-center items-center p-5 pt-20">
      <div className="bg-white p-10 rounded-2xl w-full max-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-t-[5px] border-[#F77F00]">
        <h2 className="text-center mb-6 text-[#0b2545] font-semibold text-xl">Create Account</h2>

        <form className="flex flex-col gap-[10px]" onSubmit={handleSubmit}>
          <input
            ref={refs.firstName}
            className={inputCls}
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.firstName && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.firstName}</p>}

          <input
            ref={refs.middleName}
            className={inputCls}
            name="middleName"
            placeholder="Middle Name (optional)"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.middleName && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.middleName}</p>}

          <input
            ref={refs.lastName}
            className={inputCls}
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.lastName && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.lastName}</p>}

          <input
            ref={refs.email}
            className={inputCls}
            name="email"
            placeholder="Email"
            onChange={handleChange}
            maxLength={100}
          />
          {errors.email && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.email}</p>}

          <input
            ref={refs.phone}
            className={inputCls}
            name="phone"
            placeholder="Phone Number"
            inputMode="numeric"
            onChange={handleChange}
            maxLength={10}
          />
          {errors.phone && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.phone}</p>}

          <div className="relative w-full">
            <input
              ref={refs.password}
              className={`${inputCls} pr-10`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={15}
            />

            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-full cursor-pointer text-[#555]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.password}</p>}

          <div className="bg-[#f4f6f8] rounded-[10px] p-3 border border-[#e5e7eb] mt-[5px]">
            <div className="flex items-center gap-2 text-[13px] my-[6px]">
              {passwordRules.length ? (
                <FaCheckCircle className="text-[#2ecc71]" />
              ) : (
                <BsCircle className="text-[#b0b0b0]" />
              )}
              <span>6-15 characters</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] my-[6px]">
              {passwordRules.uppercase ? (
                <FaCheckCircle className="text-[#2ecc71]" />
              ) : (
                <BsCircle className="text-[#b0b0b0]" />
              )}
              <span>One uppercase letter</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] my-[6px]">
              {passwordRules.number ? (
                <FaCheckCircle className="text-[#2ecc71]" />
              ) : (
                <BsCircle className="text-[#b0b0b0]" />
              )}
              <span>One number</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] my-[6px]">
              {passwordRules.special ? (
                <FaCheckCircle className="text-[#2ecc71]" />
              ) : (
                <BsCircle className="text-[#b0b0b0]" />
              )}
              <span>One special (@ # $ % & * !)</span>
            </div>
          </div>

          <div className="relative w-full">
            <input
              ref={refs.confirmPassword}
              className={`${inputCls} pr-10`}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={15}
            />

            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-full cursor-pointer text-[#555]"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.confirmPassword && (
            <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.confirmPassword}</p>
          )}

          {!isLocalhost && (
            <div className="mt-[6px] px-4 py-[14px] border border-[#e5e7eb] rounded-xl bg-[#f8fafc] flex flex-col items-start gap-[10px]">
              {recaptchaSiteKey ? (
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={(token) => {
                    setRecaptchaToken(token || "");
                    setErrors((prev) => ({ ...prev, recaptcha: "" }));
                  }}
                  onExpired={() => setRecaptchaToken("")}
                />
              ) : (
                <div className="w-full px-[14px] py-3 rounded-[10px] bg-[#fff7ed] border border-[#fed7aa] text-[#9a3412] text-[13px] font-semibold">
                  Google reCAPTCHA site key is missing.
                </div>
              )}
              <input
                className="absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none"
                type="text"
                name="captchaTrap"
                value={formData.captchaTrap}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <p className="m-0 text-[#64748b] text-xs leading-relaxed">
                Please complete the "I'm not a robot" check before registering.
              </p>
            </div>
          )}

          {errors.recaptcha && (
            <p className="text-[#e63946] text-xs -mt-[5px] mb-[5px]">{errors.recaptcha}</p>
          )}

          <button type="submit" className={btnCls} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-[15px] text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium underline hover:text-blue-700 transition-colors duration-200">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
