import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from "react-icons/fa";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footerPage">
      <div className="footerContainer">
        {/* BRAND */}
        <div className="footerSection brand">
          <h2>SSC Pathnirman</h2>
          <p>
            Building your pathway to success. Join us for SSC preparation with
            expert guidance and smart learning.
          </p>
        </div>

        {/* LINKS */}

        {/*  Add like of Our mantors and devide this into two sections  */}
        <div className="footerSection">
          <h3>Quick Links</h3>
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
              <a href="/tests">Mock Test</a>
            </li>
          </ul>
        </div>

        {/* ADDRESS */}
        {/* <div className="footerSection">
          <h3>Address</h3>
          <p>
            SSC Institute Pathnirman <br />
            Surat, Gujarat <br />
            India
          </p>
        </div> */}

        {/* SOCIAL */}
        <div className="footerSection">
          <h3>Follow Us</h3>
          <div className="socialIcons">
            {/* <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a> */}
            <a
              href="https://www.instagram.com/ssc_pathnirman?igsh=YW5jMW1rbW82d252"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://youtube.com/@sscinstitutepathnirman?si=DMH9hvXPF4L4vReZ"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
            <a href="https://t.me/SSC_Pathnirman" target="_blank" rel="noopener noreferrer">
              <FaTelegram />
            </a>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="footerDivider"></div>

      {/* BOTTOM */}
      <div className="footerBottom">
        © {new Date().getFullYear()} SSC Institute Pathnirman. All rights
        reserved.
      </div>
    </footer>
  );
}

export default Footer;
