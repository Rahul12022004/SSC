import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/examDashborad.css";

const DEFAULT_SECTIONS = {
  "general-awareness": {
    status: "not-started",
    questions: 25,
    time: 20,
    spent: 0,
  },
  english: { status: "not-started", questions: 30, time: 25, spent: 0 },
  math: { status: "not-started", questions: 25, time: 30, spent: 0 },
  reasoning: { status: "not-started", questions: 20, time: 20, spent: 0 },
  computer: { status: "not-started", questions: 20, time: 15, spent: 0 },
};

const SECTION_LABELS = {
  "general-awareness": "General Awareness",
  english: "English",
  math: "Math",
  reasoning: "Reasoning",
  computer: "Computer",
};

const LEGACY_GENERAL_AWARENESS_ID = "g" + "k";
const LEGACY_REASONING_ID = "sci" + "ence";

const normalizeSavedSections = (savedSections) => {
  const normalized = { ...savedSections };

  if (
    normalized[LEGACY_GENERAL_AWARENESS_ID] &&
    !normalized["general-awareness"]
  ) {
    normalized["general-awareness"] = normalized[LEGACY_GENERAL_AWARENESS_ID];
  }

  if (normalized[LEGACY_REASONING_ID] && !normalized.reasoning) {
    normalized.reasoning = normalized[LEGACY_REASONING_ID];
  }

  delete normalized[LEGACY_GENERAL_AWARENESS_ID];
  delete normalized[LEGACY_REASONING_ID];

  return normalized;
};

const applySectionUpdate = (sections, state) => {
  if (!state) return sections;

  const { sectionId, status, spent } = state;
  if (!sectionId || !sections[sectionId]) return sections;

  return {
    ...sections,
    [sectionId]: {
      ...sections[sectionId],
      status,
      spent,
    },
  };
};

function ExamDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("examSections");
    const initialSections = saved
      ? { ...DEFAULT_SECTIONS, ...normalizeSavedSections(JSON.parse(saved)) }
      : DEFAULT_SECTIONS;

    return applySectionUpdate(initialSections, location.state);
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

    navigate(`/quiz/${id}`);
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
          <div className="rowTop">
            <span className="sectionName">{SECTION_LABELS[key] || key}</span>

            <button
              disabled={sec.status === "submitted"}
              onClick={() => handleClick(key)}
              className={`actionBtn ${sec.status}`}
            >
              {getButtonText(sec.status)}
            </button>
          </div>

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

      <div className="finalSubmitWrapper">
        <button className="finalSubmitBtn" onClick={() => setShowConfirm(true)}>
          Final Submit Exam
        </button>
      </div>

      {showConfirm && (
        <div className="confirmOverlay">
          <div className="confirmBox">
            <h2>Submit Exam?</h2>
            <p>You will not be able to change answers after submission.</p>

            <div className="confirmActions">
              <button
                className="cancelBtn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button className="confirmBtn" onClick={confirmFinalSubmit}>
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
