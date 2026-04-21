import { useParams } from "react-router-dom";
import { useState } from "react";

function SectionQuiz() {
  const { id } = useParams();

  const section = sectionsData.find((s) => s.id === id);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState([]);
  const [flagged, setFlagged] = useState([]);

  const q = section.questions[current];

  const handleAnswer = (i) => {
    const updated = [...answers];
    updated[current] = i;
    setAnswers(updated);

    const stat = [...status];
    stat[current] = "answered";
    setStatus(stat);
  };

  const toggleFlag = () => {
    const updated = [...flagged];
    updated[current] = !updated[current];
    setFlagged(updated);
  };

  return (
    <div className="quizLayout">

      {/* LEFT SIDEBAR */}
      <div className="sidePanel">
        {section.questions.map((_, i) => (
          <div
            key={i}
            className={`qBox
              ${status[i] === "answered" ? "green" : ""}
              ${status[i] === "skipped" ? "yellow" : ""}
              ${flagged[i] ? "red" : ""}
              ${i === current ? "active" : ""}
            `}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* RIGHT CONTENT */}
      <div className="quizContent">
        <h2>
          Q{current + 1}. {q.question}
        </h2>

        <div className="options">
          {q.options.map((opt, i) => (
            <label key={i}>
              <input
                type="radio"
                checked={answers[current] === i}
                onChange={() => handleAnswer(i)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="actions">
          <button onClick={toggleFlag}>
            {flagged[current] ? "Unflag" : "Flag"}
          </button>

          <button onClick={() => setCurrent((c) => c - 1)}>Prev</button>
          <button onClick={() => setCurrent((c) => c + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default SectionQuiz;