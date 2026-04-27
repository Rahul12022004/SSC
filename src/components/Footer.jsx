import {
  FaInstagram, FaYoutube, FaTelegram,
  FaHome, FaBook, FaUsers, FaClipboardList, FaNewspaper,
  FaCheckCircle,
} from "react-icons/fa";
import "../styles/footer.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/cut_transperent logo.png";

const navLinks = [
  { icon: <FaHome />, label: "Home", href: "/" },
  { icon: <FaBook />, label: "Courses", href: "/courses" },
  { icon: <FaUsers />, label: "Batches", href: "/batches" },
  { icon: <FaClipboardList />, label: "Mock Tests", href: "/tests" },
  { icon: <FaNewspaper />, label: "Current Affairs", href: "/current-affairs" },
];

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footerInner">

        {/* COL 1 — BRAND */}
        <div className="footerCol brandCol">
          <div className="footerLogo">
            <img src={logo} alt="SSC Pathnirman" />
            <span>SSC Pathnirman</span>
          </div>
          <p className="footerTagline">
            Smart prep, expert mentors, daily mock tests.
          </p>
          <button className="footerBtn" onClick={() => navigate("/tests")}>
            Start Free Mock Test →
          </button>
        </div>

        {/* COL 2 — LINKS */}
        <div className="footerCol">
          <h4 className="colHeading">Quick Links</h4>
          <ul className="footerLinks">
            {navLinks.map(({ icon, label, href }) => (
              <li key={label}>
                <a href={href}>
                  <span className="navIcon">{icon}</span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* COL 3 — SOCIAL */}
        <div className="footerCol">
          <h4 className="colHeading">Stay Connected</h4>
          <div className="socialRow">
            <a href="https://www.instagram.com/ssc_pathnirman?igsh=YW5jMW1rbW82d252"
               className="socialIcon insta" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com/@sscinstitutepathnirman?si=DMH9hvXPF4L4vReZ"
               className="socialIcon yt" target="_blank" rel="noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="https://t.me/SSC_Pathnirman"
               className="socialIcon tg" target="_blank" rel="noreferrer" aria-label="Telegram">
              <FaTelegram />
            </a>
          </div>
          <p className="dailyText">
            <FaCheckCircle className="checkIcon" /> Daily Practice Updates
          </p>
          <p className="dailyText">
            <FaCheckCircle className="checkIcon" /> Exam Alerts &amp; Results
          </p>
          <p className="dailyText">
            <FaCheckCircle className="checkIcon" /> Motivation &amp; Tips
          </p>
        </div>
      </div>

      <div className="footerRule" />

      <div className="footerBottom">
        <span>© {new Date().getFullYear()} SSC Pathnirman. All rights reserved.</span>
        <div className="footerPolicy">
          <a href="/privacy">Privacy</a>
          <span>·</span>
          <a href="/terms">Terms</a>
          <span>·</span>
          <a href="/refund">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
