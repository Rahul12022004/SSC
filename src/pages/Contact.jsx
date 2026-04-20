import { useState, useRef, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  /* 🔥 AUTO CLEAR ERRORS AFTER 3s */
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const timer = setTimeout(() => {
      setErrors({});
    }, 3000);

    return () => clearTimeout(timer);
  }, [errors]);

  /* 🔥 INPUT REFS */
  const refs = {
    name: useRef(),
    email: useRef(),
    subject: useRef(),
    message: useRef(),
  };

  const handleKeyDown = (e) => {
    const name = e.target.name;

    if (["name", "subject"].includes(name)) {
      if (!/[A-Za-z .-]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    }
  };

  /* 🔥 VALIDATION */
  const validate = () => {
    let newErrors = {};

    const nameRegex = /^[A-Za-z .-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // NAME
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Only letters allowed";
    }

    // EMAIL
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // SUBJECT
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length > 100) {
      newErrors.subject = "Max 100 characters";
    }

    // MESSAGE
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Minimum 10 characters required";
    }

    setErrors(newErrors);
    return newErrors;
  };

  /* 🔥 HANDLE CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "name") {
      if (!/^[A-Za-z .-]*$/.test(value)) return; // ✅ updated
      newValue = value.slice(0, 50);
    }

    if (name === "email") {
      if (!/^[a-zA-Z0-9@._-]*$/.test(value)) return;
      newValue = value.slice(0, 100);
    }

    if (name === "subject") {
      if (!/^[A-Za-z .-]*$/.test(value)) return; // ✅ updated
      newValue = value.slice(0, 100);
    }

    if (name === "message") {
      newValue = value.slice(0, 500);
    }

    setFormData({ ...formData, [name]: newValue });

    // remove error while typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* 🔥 SUBMIT */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.keys(validationErrors)[0];

      if (refs[firstError]?.current) {
        refs[firstError].current.focus();
      }

      return;
    }

    alert("Message sent successfully!");

    // optional: reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contactPage">
      <div className="bgAnimation">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="contactContainer">
        {/* LEFT SIDE */}
        <div className="contactInfo">
          <h2>Contact Us</h2>
          <p>We'd love to hear from you. Reach out anytime.</p>

          <div className="infoItem">
            <FaPhoneAlt />
            <span>+91 97995 00688</span>
          </div>

          <div className="infoItem">
            <FaEnvelope />
            <span>sscinstitutepathnirman@gmail.com</span>
          </div>

          {/* <div className="infoItem">
            <FaMapMarkerAlt />
            <span>Surat, Gujarat, India</span>
          </div> */}
        </div>

        {/* RIGHT SIDE */}
        <div className="contactForm">
          <h2>Send Message</h2>

          <form onSubmit={handleSubmit}>
            <input
              ref={refs.name}
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={50}
            />

            {errors.name && <p className="error">{errors.name}</p>}

            <input
              ref={refs.email}
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}

            />
            {errors.email && <p className="error">{errors.email}</p>}

            <input
              ref={refs.subject}
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={100}

            />

            {errors.subject && <p className="error">{errors.subject}</p>}

            <textarea
              ref={refs.message}
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              maxLength={200}

            />
            {errors.message && <p className="error">{errors.message}</p>}

            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
