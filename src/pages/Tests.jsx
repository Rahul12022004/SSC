import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiPlay, FiVideo } from "react-icons/fi";
import "../styles/tests.css";

function Tests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests] = useState([{ id: 1, title: "Mock Test 1" }]);

  // ✅ open full exam (dashboard)
  const openExam = () => {
    // ✅ CLEAR OLD EXAM STATE
    localStorage.removeItem("examSections");

    const newWindow = window.open(
      `/exam`,
      "_blank",
      `toolbar=no,menubar=no,scrollbars=yes,resizable=yes,width=${window.screen.availWidth},height=${window.screen.availHeight}`,
    );

    if (newWindow) newWindow.focus();
  };

  const handleStartQuiz = () => {
    if (!user) {
      navigate("/login", {
        state: { redirectTo: "/exam" },
      });
    } else {
      openExam();
    }
  };

  return (
    <div className="testsPage">
      <div className="header">
        <h1>Tests</h1>

        {/* ADMIN ACTIONS */}
        {user?.roleLevel >= 3 && (
          <div className="adminActions">
            <button className="addBtn" onClick={() => navigate("/create-quiz")}>
              <FiPlus /> Create Quiz
            </button>
          </div>
        )}
      </div>

      {/* TEST LIST */}
      <div className="testList">
        {tests.map((t) => (
          <div key={t.id} className="testCard">
            <h3>{t.title}</h3>

            <button className="startBtn" onClick={handleStartQuiz}>
              <FiPlay /> Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tests;
