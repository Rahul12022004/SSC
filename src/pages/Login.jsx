import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

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

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);

      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

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

    setFormData({ ...formData, [name]: newValue });

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

      const res = await loginUser(formData);

      if (res?.success) {
        if (redirectTo) {
          window.open(
            redirectTo,
            "_blank",
            `toolbar=no,menubar=no,scrollbars=yes,resizable=yes,width=${window.screen.availWidth},height=${window.screen.availHeight}`,
          );
          navigate("/tests"); // optional fallback page
        } else {
          navigate("/");
        }
      } else {
        setErrors({ password: "Invalid email or password" });
      }
    } catch {
      setErrors({ password: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginContainer">
        <h2>Welcome Back</h2>

        {successMsg && (
          <p
            style={{
              color: "#2ecc71",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <input
            ref={refs.email}
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          {/* PASSWORD */}
          {/* PASSWORD */}
          <div className="passwordWrapper">
            <input
              ref={refs.password}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            <span
              className="eyeIcon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && <p className="error">{errors.password}</p>}

          {/* BUTTON */}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="extraText">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
