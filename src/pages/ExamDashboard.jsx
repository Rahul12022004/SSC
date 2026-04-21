import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ExamDashboard() {
  const navigate = useNavigate();

  const [sectionStatus, setSectionStatus] = useState({
    gk: "not-started",
    english: "not-started",
    math: "not-started",
    science: "not-started"
  });

  const globalTime = 10800; // 3 hours

  const handleClick = (id) => {
    if (sectionStatus[id] === "submitted") return;

    setSectionStatus((prev) => ({
      ...prev,
      [id]: prev[id] === "not-started" ? "in-progress" : prev[id]
    }));

    navigate(`/exam/${id}`);
  };

  return (
    <div className="dashboard">
      <h1>Exam Sections</h1>

      <div className="globalTimer">Total Time: 3 Hours</div>

      <div className="sectionGrid">
        {Object.keys(sectionStatus).map((sec) => {
          const status = sectionStatus[sec];

          return (
            <div key={sec} className="sectionCard">
              <h2>{sec.toUpperCase()}</h2>

              <button
                disabled={status === "submitted"}
                onClick={() => handleClick(sec)}
              >
                {status === "not-started" && "Start"}
                {status === "in-progress" && "Continue"}
                {status === "submitted" && "Submitted"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExamDashboard;