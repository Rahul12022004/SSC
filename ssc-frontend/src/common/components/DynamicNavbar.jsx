import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { FiMenu, FiX, FiChevronRight, FiHome, FiChevronDown, FiLogOut, FiUser, FiLock } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import logo from "@/assets/img/cut_transperent logo.png";
import { HomeIcon } from "@/components/ui/home";
import { GraduationCapIcon } from "@/components/ui/graduation-cap";
import { FileCheck2Icon } from "@/components/ui/file-check-2";
import { UserIcon } from "@/components/ui/user";
import { CircleHelpIcon } from "@/components/ui/circle-help";
import { PhoneCallIcon } from "@/components/ui/phone-call";
import { UsersIcon } from "@/components/ui/users";

// Route configuration for breadcrumb generation
const routeConfig = {
  "/": { label: "Home", icon: "🏠" },
  "/courses": { label: "Courses", icon: "📚" },
  "/tests": { label: "Tests", icon: "📝" },
  "/our-mentors": { label: "Our Mentors", icon: "👨‍🏫" },
  "/about": { label: "About Us", icon: "ℹ️" },
  "/contact": { label: "Contact Us", icon: "📞" },
  "/login": { label: "Login", icon: "🔐" },
  "/register": { label: "Register", icon: "📝" },
};

function DynamicNavbar() {
  const [menuOpen, setMenuOpen]         = useState(false);
  const [dropOpen, setDropOpen]         = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const dropRef = useRef(null);
  const { user, logoutUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const darkBgRoutes = ["/policy"];
  const isDarkBg = darkBgRoutes.includes(location.pathname);

  // Get initials for avatar
  const getInitials = (str) => {
    if (!str) return "U";
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  // Get user display name - prioritize actual name fields
  const getUserDisplayName = () => {
    const cn = (v) => (v && v !== "undefined" ? v : "");
    const first = cn(user?.firstName);
    const last = cn(user?.lastName);
    if (user?.name) return user.name;
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (user?.email) return user.email.split('@')[0];
    return "Student";
  };

  const userName = getUserDisplayName();
  const userEmail = user?.email || "student@email.com";
  const initials = getInitials(userName);

  // Generate dynamic breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs = [{ path: "/", label: "Home" }];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      if (segment === "admin") return;
      if (/^[a-f0-9]{24}$/i.test(segment)) return; // skip MongoDB ObjectId params
      const config = routeConfig[currentPath];
      crumbs.push({
        path: currentPath,
        label: config?.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      });
    });

    return crumbs;
  }, [location.pathname]);

  // Check if a route is active or parent of active route
  const isRouteActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#f9f8f6]/90 backdrop-blur-md border-gray-200 shadow-sm"
          : isDarkBg
          ? "bg-transparent border-transparent"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div className="flex-shrink-0">
          <NavLink to="/" onClick={closeMenu}>
            <img
              src={logo}
              alt="SSC Pathnirman"
              className="w-[130px] h-[100px] object-contain transition-transform hover:scale-105 sm:w-[120px] sm:h-[90px]"
            />
          </NavLink>
        </div>

        {/* NAVIGATION - Desktop */}
        <div className="hidden lg:flex items-center gap-1 flex-1 ml-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive ? "text-[#F77F00] bg-orange-50" : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><HomeIcon size={17} /> Home</span>
          </NavLink>
          <span className="text-gray-300 text-[15px] select-none px-1">/</span>
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive || isRouteActive("/courses")
                  ? "text-[#F77F00] bg-orange-50"
                  : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><GraduationCapIcon size={17} /> Courses</span>
          </NavLink>
          <span className="text-gray-300 text-[15px] select-none px-1">/</span>
          <NavLink
            to="/tests"
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive || isRouteActive("/tests")
                  ? "text-[#F77F00] bg-orange-50"
                  : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><FileCheck2Icon size={17} /> Tests</span>
          </NavLink>
          <span className="text-gray-300 text-[15px] select-none px-1">/</span>
          <NavLink
            to="/our-mentors"
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive ? "text-[#F77F00] bg-orange-50" : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><UserIcon size={17} /> Our Mentors</span>
          </NavLink>
          <span className="text-gray-300 text-[15px] select-none px-1">/</span>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive ? "text-[#F77F00] bg-orange-50" : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><CircleHelpIcon size={17} /> About Us</span>
          </NavLink>
          <span className="text-gray-300 text-[15px] select-none px-1">/</span>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                isActive ? "text-[#F77F00] bg-orange-50" : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2"><PhoneCallIcon size={17} /> Contact Us</span>
          </NavLink>
          {user?.roleLevel >= 10 && (
            <>
              <span className="text-gray-300 text-[15px] select-none px-1">/</span>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `text-[15px] no-underline font-semibold transition-all duration-200 px-3 py-2 rounded-md ${
                    isActive ? "text-[#F77F00] bg-orange-50" : (!scrolled && isDarkBg) ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="flex items-center gap-2"><UsersIcon size={17} /> Users</span>
              </NavLink>
            </>
          )}
        </div>

        {/* USER INFO - Desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {!user ? (
            <>
              <NavLink
                to="/login"
                className={`text-[13.5px] font-medium no-underline px-3 py-1.5 rounded-md transition-colors ${
                  !scrolled && isDarkBg ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="bg-[#F77F00] hover:bg-[#d96c00] text-white text-[13.5px] px-4 py-1.5 rounded-md font-medium transition-all no-underline shadow-sm hover:shadow-md"
              >
                Register
              </NavLink>
            </>
          ) : (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: user?.profileImage ? "transparent" : "linear-gradient(135deg,#F77F00,#d96c00)" }}
                >
                  {user?.profileImage
                    ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                <div className="flex flex-col min-w-0 pr-1 text-left">
                  <span className="text-[13px] font-semibold text-gray-900 truncate max-w-[160px] leading-tight" title={userName}>
                    {userName}
                  </span>
                  <span className="text-[11px] text-gray-500 truncate max-w-[160px] leading-tight">{userEmail}</span>
                </div>
                <FiChevronDown
                  className="text-gray-500 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  size={14}
                />
              </button>

              {dropOpen && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999, minWidth: "200px" }}
                  className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => { setDropOpen(false); setProfileOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F77F00] transition-colors"
                  >
                    <FiUser size={15} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => { setDropOpen(false); setPasswordOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F77F00] transition-colors border-b border-gray-100"
                  >
                    <FiLock size={15} />
                    Change Password
                  </button>
                  {user?.roleLevel >= 10 && (
                    <>
                      <button
                        onClick={() => { navigate("/admin/feedback"); setDropOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F77F00] transition-colors"
                      >
                        <span>💬</span>
                        Feedback
                      </button>
                      <button
                        onClick={() => { navigate("/admin/results"); setDropOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F77F00] transition-colors border-b border-gray-100"
                      >
                        <span>📊</span>
                        Results
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { logoutUser(); setDropOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <FiX className="text-[24px] text-gray-700" />
          ) : (
            <FiMenu className="text-[24px] text-gray-700" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[320px] bg-white shadow-2xl z-[1002] transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <img src={logo} alt="logo" className="w-[50px] h-[40px] object-contain" />
            <button
              onClick={closeMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <FiX className="text-[22px] text-gray-700" />
            </button>
          </div>

          {/* User Info - Mobile */}
          {user && (
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F77F00] via-[#FF8C38] to-[#d96c00] flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 truncate leading-tight">{userName}</p>
                  <p className="text-[12px] text-gray-500 truncate leading-tight mt-1">{userEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links - Mobile */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <nav className="flex flex-col gap-1.5">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">🏠</span>
                <span>Home</span>
              </NavLink>
              <NavLink
                to="/courses"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive || isRouteActive("/courses")
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">📚</span>
                <span>Courses</span>
              </NavLink>
              <NavLink
                to="/tests"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive || isRouteActive("/tests")
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">📝</span>
                <span>Tests</span>
              </NavLink>
              <NavLink
                to="/our-mentors"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">👨‍🏫</span>
                <span>Our Mentors</span>
              </NavLink>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">ℹ️</span>
                <span>About Us</span>
              </NavLink>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-lg">📞</span>
                <span>Contact Us</span>
              </NavLink>
              {user?.roleLevel >= 10 && (
                <>
                  <NavLink
                    to="/admin/users"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                        isActive ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <span className="text-lg">👥</span>
                    <span>Manage Users</span>
                  </NavLink>
                  <NavLink
                    to="/admin/feedback"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                        isActive ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <span className="text-lg">💬</span>
                    <span>Feedback</span>
                  </NavLink>
                  <NavLink
                    to="/admin/results"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all ${
                        isActive ? "bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <span className="text-lg">📊</span>
                    <span>Results</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Auth Buttons - Mobile */}
          <div className="px-5 py-4 border-t border-gray-200 bg-white">
            {!user ? (
              <div className="flex flex-col gap-2.5">
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="text-center py-3 border-2 border-[#F77F00] rounded-lg text-[#F77F00] font-semibold no-underline hover:bg-orange-50 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="text-center py-3 bg-gradient-to-r from-[#F77F00] to-[#d96c00] text-white rounded-lg font-semibold no-underline shadow-md hover:shadow-lg transition-all"
                >
                  Register
                </NavLink>
              </div>
            ) : (
              <button
                onClick={() => {
                  logoutUser();
                  closeMenu();
                }}
                className="w-full py-3 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001] lg:hidden"
          onClick={closeMenu}
        />
      )}

      {profileOpen  && <ProfileModal       onClose={() => setProfileOpen(false)}  />}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}
    </nav>
  );
}

export default DynamicNavbar;
