import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";
import NotFound from "./NotFound";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import ProtectedRoute from "@/common/components/ProtectedRoute";

const Home = lazy(() => import("@/components/homepage/Homepage"));
const About = lazy(() => import("@/features/static/pages/About"));
const Contact = lazy(() => import("@/features/static/pages/Contact"));
const OurMentors = lazy(() => import("@/features/static/pages/OurMentors"));
const OurStudent = lazy(() => import("@/features/static/pages/OurStudent"));
const SitePolicy = lazy(() => import("@/features/static/pages/SitePolicy"));

const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const OtpVerify = lazy(() => import("@/features/auth/pages/OtpVerify"));
const LoginCharacterDemo = lazy(() => import("@/features/auth/pages/LoginCharacterDemo"));

const Courses = lazy(() => import("@/features/courses/pages/Courses"));
const CourseDetail = lazy(() => import("@/features/courses/pages/CourseDetail"));
const SubjectDetail = lazy(() => import("@/features/courses/pages/SubjectDetail"));

const Batches = lazy(() => import("@/features/batches/pages/Batches"));

const Tests = lazy(() => import("@/features/quiz/pages/Tests"));
const QuizPage = lazy(() => import("@/features/quiz/pages/QuizPage"));
const TestQuiz = lazy(() => import("@/features/quiz/pages/TestQuiz"));
const SectionQuiz = lazy(() => import("@/features/quiz/pages/SectionQuiz"));
const MockTest = lazy(() => import("@/features/quiz/pages/MockTest"));
const Result = lazy(() => import("@/features/quiz/pages/Result"));
const ExamDashboard = lazy(() => import("@/features/quiz/pages/ExamDashboard"));

const CreateQuiz = lazy(() => import("@/features/admin/pages/CreateQuiz"));
const ScheduleQuiz = lazy(() => import("@/features/admin/pages/ScheduleQuiz"));
const ManageSubjectCards = lazy(() => import("@/features/admin/pages/ManageSubjectCards"));
const ManageUsers = lazy(() => import("@/features/admin/pages/ManageUsers"));
const Feedback = lazy(() => import("@/features/admin/pages/Feedback"));
const AdminResults = lazy(() => import("@/features/admin/pages/AdminResults"));

export default function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/our-mentors" element={<OurMentors />} />
          <Route path="/our-students" element={<OurStudent />} />
          <Route path="/policy" element={<SitePolicy />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/subject/:id" element={<SubjectDetail />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-demo" element={<LoginCharacterDemo />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerify />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/tests" element={<Tests />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/test-quiz/:id" element={<TestQuiz />} />
            <Route path="/section-quiz/:id" element={<SectionQuiz />} />
            <Route path="/mock-test/:id" element={<MockTest />} />
            <Route path="/result" element={<Result />} />
            <Route path="/exam-dashboard" element={<ExamDashboard />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/create-quiz" element={<CreateQuiz />} />
            <Route path="/admin/schedule-quiz/:id" element={<ScheduleQuiz />} />
            <Route path="/admin/subject-cards" element={<ManageSubjectCards />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/feedback" element={<Feedback />} />
            <Route path="/admin/results" element={<AdminResults />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
