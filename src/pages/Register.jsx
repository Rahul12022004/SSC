import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsCircle } from "react-icons/bs";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [otpStep, setOtpStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
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
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  /* 🔥 INPUT REFS */
  const refs = {
    firstName: useRef(),
    middleName: useRef(),
    lastName: useRef(),
    email: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
  };

  /* 🔥 VALIDATION (returns errors) */
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

    /* EMAIL (100 chars) */
    if (name === "email") {
      if (!/^[a-zA-Z0-9@._-]*$/.test(value)) return;
      newValue = value.slice(0, 100);
    }

    /* PASSWORD (15 chars) */
    if (name === "password") {
      if (!/^[A-Za-z\d@#$%&*!]*$/.test(value)) return;

      const cleaned = value.slice(0, 15);

      setFormData({ ...formData, password: cleaned });

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

    setFormData({ ...formData, [name]: newValue });

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

      const res = await registerUser(formData);
      if (res?.success) {
        // Email verification disabled - go directly to login
        navigate("/login", { state: { message: "Registration successful! Please log in." } });
      } else {
        setErrors({
          confirmPassword: res?.message || "Registration failed",
        });
      }
    } catch (err) {
      setErrors({
        confirmPassword: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (otpStep) {
    return (
      <OtpStep
        email={registeredEmail}
        onSuccess={() =>
          navigate("/login", { state: { message: "Email verified! You can now log in." } })
        }
      />
    );
  }

  return (
    <div className="registerPage">
      <div className="registerContainer">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            ref={refs.firstName}
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <input
            ref={refs.middleName}
            name="middleName"
            placeholder="Middle Name (optional)"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.middleName && <p className="error">{errors.middleName}</p>}

          <input
            ref={refs.lastName}
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}

          <input
            ref={refs.email}
            name="email"
            placeholder="Email"
            onChange={handleChange}
            maxLength={100}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <div className="passwordWrapper">
            <input
              ref={refs.password}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={15}
            />

            <span
              className="eyeIcon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && <p className="error">{errors.password}</p>}

          <div className="passwordRules">
            <div className="rule">
              {passwordRules.length ? (
                <FaCheckCircle className="validIcon" />
              ) : (
                <BsCircle className="defaultIcon" />
              )}
              <span>6-15 characters</span>
            </div>
            <div className="rule">
              {passwordRules.uppercase ? (
                <FaCheckCircle className="validIcon" />
              ) : (
                <BsCircle className="defaultIcon" />
              )}
              <span>One uppercase letter</span>
            </div>
            <div className="rule">
              {passwordRules.number ? (
                <FaCheckCircle className="validIcon" />
              ) : (
                <BsCircle className="defaultIcon" />
              )}
              <span>One number</span>
            </div>
            <div className="rule">
              {passwordRules.special ? (
                <FaCheckCircle className="validIcon" />
              ) : (
                <BsCircle className="defaultIcon" />
              )}
              <span>One special (@ # $ % & * !)</span>
            </div>
          </div>

          <div className="passwordWrapper">
            <input
              ref={refs.confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={15}
            />

            <span
              className="eyeIcon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="extraText">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
