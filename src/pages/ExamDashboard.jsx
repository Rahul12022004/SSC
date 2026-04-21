import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/examDashborad.css";

function ExamDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("examSections");
    return saved
      ? JSON.parse(saved)
      : {
          gk: { status: "not-started", questions: 25, time: 20, spent: 0 },
          english: { status: "not-started", questions: 30, time: 25, spent: 0 },
          math: { status: "not-started", questions: 25, time: 30, spent: 0 },
          science: { status: "not-started", questions: 20, time: 20, spent: 0 },
        };
  });

  useEffect(() => {
    const el = document.documentElement;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("examSections", JSON.stringify(sections));
  }, [sections]);

  /* ✅ UPDATE FROM QUIZ PAGE */
  useEffect(() => {
    if (!location.state) return;

    const { sectionId, status, spent } = location.state;

    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        status,
        spent,
      },
    }));
  }, [location.state]);

  /* ✅ HANDLE CLICK */
  const handleClick = (id) => {
    const sec = sections[id];

    if (sec.status === "submitted") return;

    setSections((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status:
          prev[id].status === "not-started" ? "in-progress" : prev[id].status,
      },
    }));

    navigate(`/exam/${id}`);
  };

  const getButtonText = (status) => {
    if (status === "not-started") return "Start";
    if (status === "in-progress") return "Continue";
    return "Submitted";
  };

  const confirmFinalSubmit = () => {
  const updated = {};
  Object.keys(sections).forEach((key) => {
    updated[key] = {
      ...sections[key],
      status: "submitted",
    };
  });

  setSections(updated);
  localStorage.removeItem("examSections");

  // try closing tab
  window.open("", "_self");
  window.close();

  // fallback
  setTimeout(() => {
    navigate("/");
  }, 1000);
};

  /* ✅ FINAL SUBMIT */
  const handleFinalSubmit = () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit the exam?",
    );

    if (!confirmSubmit) return;

    setSections((prev) => {
      const updated = {};
      Object.keys(prev).forEach((key) => {
        updated[key] = {
          ...prev[key],
          status: "submitted",
        };
      });
      return updated;
    });

    alert("Exam Submitted Successfully!");

    // ✅ REDIRECT (NO TAB CLOSE)
    navigate("/");
  };

  return (
    <div className="examDash">
      <h1>Exam Dashboard</h1>

      <div className="tableHeader">
        <span>Section</span>
        <span>Action</span>
      </div>

      {Object.entries(sections).map(([key, sec]) => (
        <div key={key} className="sectionRow">
          {/* TOP */}
          <div className="rowTop">
            <span className="sectionName">{key.toUpperCase()}</span>

            <button
              disabled={sec.status === "submitted"}
              onClick={() => handleClick(key)}
              className={`actionBtn ${sec.status}`}
            >
              {getButtonText(sec.status)}
            </button>
          </div>

          {/* DETAILS */}
          <div className="rowDetails">
            <span>Questions: {sec.questions}</span>
            <span>Time: {sec.time} min</span>

            {sec.status === "submitted" && (
              <>
                <span className="status submitted">Status: Submitted</span>
                <span>Time Spent: {sec.spent} min</span>
              </>
            )}

            {sec.status === "in-progress" && (
              <span className="status progress">Status: In Progress</span>
            )}
          </div>
        </div>
      ))}

      {/* FINAL SUBMIT */}
      <div className="finalSubmitWrapper">
        <button className="finalSubmitBtn" onClick={() => setShowConfirm(true)}>
          Final Submit Exam
        </button>
      </div>


      {showConfirm && (
  <div className="confirmOverlay">
    <div className="confirmBox">
      <h2>Submit Exam?</h2>
      <p>You won’t be able to change answers after submission.</p>

      <div className="confirmActions">
        <button
          className="cancelBtn"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="confirmBtn"
          onClick={confirmFinalSubmit}
        >
          Yes, Submit
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ExamDashboard;
