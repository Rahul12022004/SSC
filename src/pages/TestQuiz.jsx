import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiSkipBack,
  FiSkipForward,
  FiClock,
  FiFlag,
  FiCheckCircle,
  FiPlay,
  FiSend,
  FiSave,
  FiLoader,
} from "react-icons/fi";

import { BASE_URL } from "../context/AuthContext.jsx";
import "../styles/testquiz.css";
import { useParams, useNavigate } from "react-router-dom";
import useAntiCheat from "./hooks/useAntiCheat.js";
import { useAuth } from "../context/AuthContext";

function TestQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [started, setStarted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState([]);
  const [flagged, setFlagged] = useState([]);

  const [showSubmit, setShowSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { violationCount, showViolation } = useAntiCheat(
    started,
    setShowSubmit,
  );

  const quizStartTimeRef = useRef(null);

  // 🔥 FETCH QUIZ
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${BASE_URL}/quiz/${id}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.message);
          return;
        }

        setQuiz(data.quiz);
        setTimeLeft(data.quiz.duration * 60);
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // 🔥 TIMER
  useEffect(() => {
    if (!started) return;

    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          setShowSubmit(true); // 🔥 auto submit trigger
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [started]);

  const formatTime = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
      quizStartTimeRef.current = Date.now();
      setStarted(true);
    } catch {
      alert("Fullscreen failed");
    }
  };

  const handleAnswer = (value) => {
    const answerType = quiz.questions[current]?.answerType || "single";
    const updated = [...answers];

    if (answerType === "multiple") {
      const currentAnswers = Array.isArray(updated[current])
        ? updated[current]
        : [];
      updated[current] = currentAnswers.includes(value)
        ? currentAnswers.filter((answer) => answer !== value)
        : [...currentAnswers, value];
    } else {
      updated[current] = value;
    }

    setAnswers(updated);

    const stat = [...status];
    stat[current] = "answered";
    setStatus(stat);
  };

  const handleNext = () => {
    if (answers[current] === undefined) {
      const stat = [...status];
      stat[current] = "skipped";
      setStatus(stat);
    }
    setCurrent((c) => Math.min(c + 1, quiz.questions.length - 1));
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
  };

  const handleLast = () => {
    setCurrent(quiz.questions.length - 1);
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    if (!user?.email) {
      alert("User not logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: id,
          answers,
          email: user.email, // ✅ now works
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setIsSubmitting(false);
        return;
      }

      // optional: redirect instead of window.close
      navigate("/result", { state: { score: data.score } });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error)
    return (
      <div className="testQuiz centerScreen">
        <h2>{error}</h2>
      </div>
    );
  if (!quiz) return null;

  const q = quiz.questions[current];
  const total = quiz.questions.length;

  // 🔥 SUBMIT SCREEN
  if (showSubmit) {
    const attempted = answers.filter((a) =>
      Array.isArray(a) ? a.length > 0 : a !== undefined && a !== "",
    ).length;

    return (
      <div className="testQuiz centerScreen">
        <div className="submitCard">
          <h2>Submit Quiz?</h2>

          <div className="submitStats">
            <div>
              <span>Total</span>
              <strong>{total}</strong>
            </div>
            <div>
              <span>Attempted</span>
              <strong>{attempted}</strong>
            </div>
          </div>

          <div className="submitActions">
            <button onClick={() => setShowSubmit(false)}>Go Back</button>

            <button onClick={handleSubmitQuiz}>
              {isSubmitting ? (
                <>
                  <FiLoader /> Submitting...
                </>
              ) : (
                <>
                  <FiSend /> Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 INSTRUCTION PAGE
  if (!started) {
    return (
      <div className="testQuiz">
        <div className="instructionWrapper">
          <div className="instructionCard">
            <h2>{quiz.title} - Instructions</h2>

            {/* GENERAL RULES */}
            <div className="instructionSection">
              <h3>General Rules</h3>
              <ul>
                <li>This is a timed quiz. Timer will start once you begin.</li>
                <li>
                  Each question carries <strong>{quiz.eachMarks}</strong> marks.
                </li>
                <li>
                  Negative Marking:{" "}
                  <strong>
                    {quiz.negativeMarking ? quiz.negativeValue : "No"}
                  </strong>
                </li>
                <li>You can navigate between questions freely.</li>
                <li>Make sure to review your answers before submitting.</li>
              </ul>
            </div>

            {/* WARNING */}
            <div className="instructionSection warning">
              <h3>Important Guidelines</h3>
              <ul>
                <li>
                  Do not press <strong>ESC</strong> or exit fullscreen.
                </li>
                <li>Switching tabs or minimizing may count as violation.</li>
                <li>
                  After <strong>4 violations</strong>, quiz will auto-submit.
                </li>
                <li>Ensure stable internet and device before starting.</li>
              </ul>
            </div>

            {/* LEGEND */}
            <div className="instructionSection legend">
              <h3>Question Status</h3>

              <div className="legendRow">
                <div className="legendItem">
                  <span className="box gray"></span> Not Visited
                </div>

                <div className="legendItem">
                  <span className="box green"></span> Answered
                </div>

                <div className="legendItem">
                  <span className="box yellow"></span> Skipped
                </div>

                <div className="legendItem">
                  <span className="box red"></span> Flagged
                </div>
              </div>
            </div>

            {/* AGREEMENT */}
            <div className="agreeBox">
              <input
                type="checkbox"
                id="agree"
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree">
                I have read all instructions and agree to follow them.
              </label>
            </div>

            {/* START BUTTON */}
            <button
              className="startBtn"
              disabled={!agree}
              onClick={handleStart}
            >
              <FiPlay /> Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="testQuiz">
      {/* HEADER */}
      <div className="quizHeader">
        <h1>{quiz.title}</h1>
        <div className="timerBox">
          <div className="timer">
            <FiClock /> {formatTime()}
          </div>
          <div className="negativeMarking">
            Negative: {quiz.negativeMarking ? quiz.negativeValue : "0"}
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="examLayout">
        {/* SIDE PANEL */}
        <div className="sidePanel">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`qBox 
                ${status[i] === "answered" ? "green" : ""}
                ${status[i] === "skipped" ? "yellow" : ""}
                ${flagged[i] ? "red" : ""}
                ${i === current ? "active" : ""}
              `}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* MAIN */}
        <div className="quizContent">
          <div className="questionCard">
            {(q.type === "text" || q.type === "mixed") && (
              <h2>
                Q{current + 1}. {q.question}
              </h2>
            )}

            {(q.type === "image" || q.type === "mixed") && q.questionImage && (
              <img
                className="questionImage"
                src={q.questionImage}
                alt={`Question ${current + 1}`}
              />
            )}

            {q.answerType === "descriptive" ? (
              <textarea
                className="descriptiveResponse"
                placeholder="Type your answer here"
                value={answers[current] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            ) : (
              <div className="optionsGrid">
                {q.options.map((opt, i) => {
                  const value = String(i);
                  const isMultiple = q.answerType === "multiple";
                  const checked = isMultiple
                    ? Array.isArray(answers[current]) &&
                      answers[current].includes(value)
                    : String(answers[current]) === value;

                  return (
                    <label key={i} className="optionItem">
                      <input
                        type={isMultiple ? "checkbox" : "radio"}
                        checked={checked}
                        onChange={() => handleAnswer(value)}
                      />
                      <span>{opt.text || `Option ${i + 1}`}</span>
                      {opt.image && (
                        <img
                          className="optionImage"
                          src={opt.image}
                          alt={`Option ${i + 1}`}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* NAV */}
          <div className="navBar">
            <div className="navLeft">
              <button onClick={handlePrev}>
                <FiArrowLeft /> Prev
              </button>
              <button onClick={() => setCurrent(0)}>
                <FiSkipBack /> First
              </button>
              <button onClick={handleLast}>
                <FiSkipForward /> Last
              </button>
            </div>

            <div className="navCenter">
              <button
                className="flagBtn"
                onClick={() => {
                  const f = [...flagged];
                  f[current] = !f[current];
                  setFlagged(f);
                }}
              >
                <FiFlag /> {flagged[current] ? "Unflag" : "Flag"}
              </button>
            </div>

            <div className="navRight">
              {current === total - 1 ? (
                <button onClick={() => setShowSubmit(true)}>
                  <FiCheckCircle /> Submit
                </button>
              ) : (
                <button onClick={handleNext}>
                  Next <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showViolation && (
        <div className="violationPopup">⚠️ Violation ({violationCount}/4)</div>
      )}
    </div>
  );
}

export default TestQuiz;
