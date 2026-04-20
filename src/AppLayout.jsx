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
import OurTeam from "./pages/OurTeam";

import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ScheduleQuiz from "./pages/ScheduleQuiz";
import RecordingPage from "./pages/RecordingPage";

function AppLayout() {
  const location = useLocation();

  // ✅ Hide Navbar/Footer on quiz page
  const hideLayout = location.pathname.startsWith("/quiz");

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
          <Route path="/our-team" element={<OurTeam />} />

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
              <ProtectedRoute minRole={3}>
                <CreateQuiz />{" "}
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule/:id"
            element={
              <ProtectedRoute minRole={3}>
                <ScheduleQuiz />{" "}
              </ProtectedRoute>
            }
          />

           <Route
            path="/recordings"
            element={
              <ProtectedRoute minRole={3}>
                <RecordingPage />{" "}
              </ProtectedRoute>
            }
          />

          <Route path="/quiz/:id" element={<QuizPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default AppLayout;
