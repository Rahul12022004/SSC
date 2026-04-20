import {
  FaInstagram,
  FaYoutube,
  FaTelegram,
  FaCopyright,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import "../styles/footer.css";
import { useNavigate } from "react-router-dom";

import logo from "../assets/img/cut_transperent logo.png";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footerPage">
      <div className="footerBg">
        <span></span>
        <span></span>
      </div>

      <div className="footerContainer">
        <div className="footerSection brandCard">
          <div className="logoBox">
            <img src={logo} alt="logo" />
            <h2>SSC Pathnirman</h2>
          </div>

          <p>
            Smart preparation, expert guidance, and consistent practice — your
            complete SSC success system.
          </p>

          <button className="footerCTA" onClick={() => navigate("/tests")}>
            Start Free Mock Test <FaArrowRight />
          </button>
        </div>

        <div className="footerSection glassCard">
          <h3>Explore</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/courses">Courses</a>
            </li>
            <li>
              <a href="/batches">Batches</a>
            </li>
            <li>
              <a href="/tests">Mock Tests</a>
            </li>
          </ul>
        </div>

        <div className="footerSection glassCard">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/our-mentors">Mentors</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footerSection glassCard socialCard">
          <h3>Stay Connected</h3>

          <div className="socialIcons">
            <a href="https://www.instagram.com/ssc_pathnirman?igsh=YW5jMW1rbW82d252">
              <FaInstagram />
            </a>
            <a href="https://youtube.com/@sscinstitutepathnirman?si=DMH9hvXPF4L4vReZ">
              <FaYoutube />
            </a>
            <a href="https://t.me/SSC_Pathnirman">
              <FaTelegram />
            </a>
          </div>

          <p className="socialText">
            {" "}
            <p>
              <FaCheckCircle /> Daily Practice
            </p>
            <p>
              <FaCheckCircle /> Updates
            </p>
            <p>
              <FaCheckCircle /> Motivation
            </p>
          </p>
        </div>
      </div>

      <div className="footerDivider"></div>

      <div className="footerBottom">
        <FaCopyright /> {new Date().getFullYear()} SSC Pathnirman. All rights
        reserved.
      </div>
    </footer>
  );
}

export default Footer;
