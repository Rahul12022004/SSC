import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import Batches from "./pages/Batches";
import Tests from "./pages/Tests";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import Student from "./pages/OurStudent";
import CreateQuiz from "./pages/CreateQuiz";
import QuizPage from "./pages/QuizPage";
import OurMentors from "./pages/OurMentors";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ScheduleQuiz from "./pages/ScheduleQuiz";

// ✅ NEW
import ExamDashboard from "./pages/ExamDashboard";
import TestQuiz from "./pages/TestQuiz";

function AppLayout() {
  const location = useLocation();

  // ✅ hide layout on ALL exam pages
  const hideLayout =
    location.pathname.startsWith("/quiz") ||
    location.pathname.startsWith("/exam") ||
    location.pathname.startsWith("/testQuiz");
  const hideFooter = hideLayout || location.pathname === "/tests";

  return (
    <div className="appLayout">
      <ScrollToTop />

      {!hideLayout && <Navbar />}

      <main className="mainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/our-mentors" element={<OurMentors />} />

          <Route
            path="/students"
            element={
              <ProtectedRoute minRole={4}>
                <Student />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute minRole={1}>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule/:id"
            element={
              <ProtectedRoute minRole={1}>
                <ScheduleQuiz />
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW: EXAM DASHBOARD */}
          <Route
            path="/exam"
            element={
              <ProtectedRoute minRole={1}>
                <ExamDashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ SECTION QUIZ */}
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute minRole={1}>
                <TestQuiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/testQuiz/:id"
            element={
              <ProtectedRoute minRole={1}>
                <TestQuiz />
              </ProtectedRoute>
            }
          />

          {/* ❗ OPTIONAL: keep old route (if needed) */}
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute minRole={1}>
                <QuizPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default AppLayout;
