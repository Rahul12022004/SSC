import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";
import logo from "../assets/img/cut_transperent logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, validateUser, logoutUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔐 Validate session ONCE
  useEffect(() => {
    validateUser();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbarPage ${scrolled ? "scrolled" : ""}`}>
      <div className="navContainer">
        {/* LOGO */}
        <div className="logo">
          <NavLink to="/" onClick={closeMenu}>
            <img src={logo} alt="logo" />
          </NavLink>
        </div>

        {/* NAV LINKS */}
        <div className={`navLinks ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/courses" onClick={closeMenu}>
            Courses
          </NavLink>
          <NavLink to="/batches" onClick={closeMenu}>
            Batches
          </NavLink>
          <NavLink to="/tests" onClick={closeMenu}>
            Mock Test
          </NavLink>
          <NavLink to="/our-mentors" onClick={closeMenu}>
            Our Mentors
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About Us
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            Contact Us
          </NavLink>

          {/* ✅ SHOW ONLY IF LOGGED IN */}
          {/* {user && (
            <NavLink to="/students" onClick={closeMenu}>
              Our Student
            </NavLink>
          )} */}
        </div>

        {/* RIGHT SIDE */}
        <div className="rightSection">
          <div className="authButtons">
            {!user ? (
              <>
                <NavLink to="/login" className="loginBtn">
                  Login
                </NavLink>
                <NavLink to="/register" className="registerBtn">
                  Register
                </NavLink>
              </>
            ) : (
              <button onClick={logoutUser} className="logoutBtn">
                Logout
              </button>
            )}
          </div>

          {/* MOBILE MENU */}
          <div className="menuIcon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
