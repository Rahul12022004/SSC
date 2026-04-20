import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiPlay, FiVideo } from "react-icons/fi";
import "../styles/tests.css";

function Tests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([
    { id: 1, title: "Mock Test 1" },
  ]);

  const openQuiz = (id) => {
    const newWindow = window.open(
      `/quiz/${id}`,
      "_blank",
      `toolbar=no,menubar=no,scrollbars=yes,resizable=yes,width=${window.screen.availWidth},height=${window.screen.availHeight}`
    );

    if (newWindow) newWindow.focus();
  };

  return (
    <div className="testsPage">
      <div className="header">
        <h1>Tests</h1>

        {/* ✅ ADMIN BUTTONS */}
        {user?.roleLevel >= 3 && (
          <div className="adminActions">
            {/* CREATE QUIZ */}
            <button
              className="addBtn"
              onClick={() => navigate("/create-quiz")}
            >
              <FiPlus /> Create Quiz
            </button>

            {/* 🎥 RECORDINGS */}
            <button
              className="recordBtn"
              onClick={() => navigate("/recordings")}
            >
              <FiVideo /> Recordings
            </button>
          </div>
        )}
      </div>

      {/* TEST LIST */}
      <div className="testList">
        {tests.map((t) => (
          <div key={t.id} className="testCard">
            <h3>{t.title}</h3>

            <button
              className="startBtn"
              onClick={() => openQuiz(t.id)}
            >
              <FiPlay /> Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tests;