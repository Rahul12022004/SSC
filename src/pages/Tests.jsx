import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiPlay } from "react-icons/fi";
import { BASE_URL } from "../context/AuthContext.jsx";
import "../styles/tests.css";

function Tests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  // 🔥 FETCH QUIZZES
  const fetchTests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/quiz/all`);
      const data = await res.json();

      if (data.success) {
        if (data.quizzes && data.quizzes.length > 0) {
          setTests(data.quizzes);
        } else {
          setTests([]);
          setMessage(data.message || "No quiz data found");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 countdown refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 STATUS
  const getStatus = (quiz) => {
    if (!quiz.scheduledAt) return "draft";

    const now = new Date();
    const start = new Date(quiz.scheduledAt);

    if (now < start) return "upcoming";

    return "live"; // 🔥 always live after start
  };

  const getRemainingTime = (date) => {
    const now = new Date();
    const target = new Date(date);

    const diff = target - now;
    if (diff <= 0) return null;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  const openExam = (quizId = null) => {
    localStorage.removeItem("examSections");

    const url = quizId ? `/testQuiz/${quizId}` : `/exam`;

    const newWindow = window.open(
      url,
      "_blank",
      `width=${window.screen.availWidth},height=${window.screen.availHeight}`,
    );

    if (newWindow) newWindow.focus();
  };

  const handleStartQuiz = (quizId = null) => {
    const redirectUrl = quizId ? `/testQuiz/${quizId}` : `/exam`;

    if (!user) {
      navigate("/login", {
        state: { redirectTo: redirectUrl },
      });
    } else {
      openExam(quizId);
    }
  };

  return (
    <div className="testsPage">
      <div className="header">
        <h1>Tests</h1>

        {user?.roleLevel >= 3 && (
          <div className="adminActions">
            <button className="addBtn" onClick={() => navigate("/create-quiz")}>
              <FiPlus /> Create Quiz
            </button>
          </div>
        )}
      </div>

      <div className="testList">
        {/* 🔥 MOCK TEST */}
        <div className="testCard mockCard">
          <h3>Mock Test 1</h3>
          <button className="startBtn" onClick={() => handleStartQuiz()}>
            <FiPlay /> Start Exam
          </button>
        </div>

        {loading && <p>Loading quizzes...</p>}

        {!loading &&
          tests.map((t) => {
            const status = getStatus(t);

            return (
              <div key={t._id} className="testCard">
                <h3>{t.title || "Untitled Quiz"}</h3>

                {/* ⏳ UPCOMING */}
                {status === "upcoming" && (
                  <p className="countdown">
                    Live in {getRemainingTime(t.scheduledAt)}
                  </p>
                )}

                {/* ▶️ LIVE */}
                {status === "live" && (
                  <button
                    className="startBtn"
                    onClick={() => handleStartQuiz(t._id)}
                  >
                    <FiPlay /> Start Quiz
                  </button>
                )}

                {/* ❌ expired & draft → show nothing */}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Tests;
