import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../context/AuthContext.jsx";
import { useAuth } from "../context/AuthContext";
import useAntiCheat from "./hooks/useAntiCheat.js";
import "../styles/mocktest.css";
import logo from "../assets/img/cut_transperent logo.png";

const OPTION_LABELS = ["A", "B", "C", "D"];

function MockTest() {
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
  const [visited, setVisited] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [language, setLanguage] = useState("en");
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const { violationCount, showViolation } = useAntiCheat(started, setShowConfirm);

  const isAdmin = user?.role === "admin" || user?.roleLevel === 10 || user?.email === "demo.admin@ssc.test";
  const submissionKey = `submitted_${user?.email}_${id}`;

  // ── Fetch quiz ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      // Block non-admins who already submitted
      if (!isAdmin && localStorage.getItem(submissionKey)) {
        setError("already_submitted");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/quiz/${id}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Quiz not found");
          return;
        }
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.duration * 60);
        setAnswers(Array(data.quiz.questions.length).fill(null));
        setVisited(Array(data.quiz.questions.length).fill(false));
      } catch {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, user?.email]);

  // ── Mark visited ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    setVisited((prev) => {
      const v = [...prev];
      v[current] = true;
      return v;
    });
  }, [current, started]);

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted]);

  // ── Auto-submit on timeout ──────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && started && !submitted) {
      handleSubmitQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setStarted(true);
    } catch {
      setStarted(true); // proceed even if fullscreen fails
    }
  };

  const handleSelect = (value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const q = quiz.questions[current];
      const isMultiple = q.answerType === "multiple";
      if (isMultiple) {
        const cur = Array.isArray(updated[current]) ? updated[current] : [];
        updated[current] = cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value];
      } else {
        updated[current] = value;
      }
      return updated;
    });
  };

  const handleSaveAndNext = () => {
    if (current < quiz.questions.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    if (!user?.email) {
      alert("You must be logged in to submit.");
      return;
    }
    setIsSubmitting(true);
    setShowConfirm(false);
    try {
      const res = await fetch(`${BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id, answers, email: user.email }),
      });
      const data = await res.json();
      const finalBreakdown = data.breakdown?.length > 0
        ? data.breakdown
        : (quiz?.questions ?? []).map((q, idx) => ({
            question: q.question,
            questionImage: q.questionImage || null,
            options: q.options,
            correctAnswer: q.correctAnswer ?? null,
            userAnswer: answers[idx] ?? null,
            answerType: q.answerType || "single",
          }));
      localStorage.setItem(submissionKey, JSON.stringify({ score: data.score ?? {}, submittedAt: Date.now(), quizTitle: quiz?.title, breakdown: finalBreakdown, language }));
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      navigate("/tests", { state: { submitted: true, score: data.score?.obtained ?? 0, quizTitle: quiz?.title } });
    } catch {
      alert("Server error during submission.");
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) =>
    Array.isArray(a) ? a.length > 0 : a !== null
  ).length;

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cbt-center-screen">
        <div className="cbt-spinner" />
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error === "already_submitted") {
    const prev = JSON.parse(localStorage.getItem(submissionKey) || "{}");
    return (
      <div className="cbt-center-screen">
        <div className="cbt-already-box">
          <div className="cbt-already-icon">✓</div>
          <h2>Already Submitted</h2>
          <p>You have already attempted this exam.</p>
          {prev.score !== undefined && (
            <p className="cbt-already-score">Your Score: <strong>{prev.score}</strong></p>
          )}
          <button className="cbt-btn-home" onClick={() => navigate("/tests")}>
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cbt-center-screen">
        <h2 className="cbt-error-msg">{error}</h2>
        <button className="cbt-btn-home" onClick={() => navigate("/tests")}>
          Back to Tests
        </button>
      </div>
    );
  }

  if (!quiz) return null;

  const total = quiz.questions.length;
  const q = quiz.questions[current];

  if (!q) return null;

  // ── Result screen ───────────────────────────────────────────────────────────
  if (submitted) {
    const maxScore = total * (quiz.eachMarks ?? 2);
    const score = result ?? 0;
    const skipped = total - answeredCount;
    const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : "0.0";
    const timeTaken = (quiz.duration * 60) - timeLeft;
    const timeTakenMin = Math.floor(timeTaken / 60);
    const timeTakenSec = timeTaken % 60;

    return (
      <div className="cbt-result-page">
        <div className="cbt-result-header">
          <h2>{quiz.title} — Result</h2>
          <p>Staff Selection Commission · Exam Completed</p>
        </div>
        <div className="cbt-result-body">
          <div className="cbt-result-card">

            {/* Score banner */}
            <div className="cbt-score-banner">
              <span className="cbt-score-label">Your Score</span>
              <span className="cbt-score-value">{score}</span>
              <span className="cbt-score-max">/ {maxScore}</span>
            </div>

            {/* Percentage bar */}
            <div className="cbt-pct-bar-wrap">
              <div className="cbt-pct-bar" style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
            </div>
            <p className="cbt-pct-label">{percentage}% Score</p>

            {/* Stats grid */}
            <div className="cbt-result-grid">
              <div className="cbt-stat-box total">
                <span>Total Questions</span>
                <strong>{total}</strong>
              </div>
              <div className="cbt-stat-box attempted">
                <span>Attempted</span>
                <strong>{answeredCount}</strong>
              </div>
              <div className="cbt-stat-box skipped">
                <span>Not Attempted</span>
                <strong>{skipped}</strong>
              </div>
              <div className="cbt-stat-box pct">
                <span>Percentage</span>
                <strong>{percentage}%</strong>
              </div>
              <div className="cbt-stat-box marks">
                <span>Marks/Question</span>
                <strong>{quiz.eachMarks ?? 2}</strong>
              </div>
              <div className="cbt-stat-box time">
                <span>Time Taken</span>
                <strong>{timeTakenMin}m {timeTakenSec}s</strong>
              </div>
            </div>

            {quiz.negativeMarking && (
              <p className="cbt-neg-info">
                Negative marking applied: −{quiz.negativeValue} per wrong answer
              </p>
            )}

            <div className="cbt-result-actions">
              <button className="cbt-btn-retake" onClick={() => window.location.reload()}>
                Retake Test
              </button>
              <button className="cbt-btn-home" onClick={() => navigate("/tests")}>
                All Tests
              </button>
              <button className="cbt-btn-gohome" onClick={() => navigate("/")}>
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Instruction screen ──────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="cbt-instruction-page">
        <div className="cbt-instruction-header">
          <div className="cbt-logo-badge">SSC</div>
          <h2>{quiz.title}</h2>
        </div>

        <div className="cbt-instruction-card">
          <div className="cbt-instr-section">
            <h3>General Instructions</h3>
            <ul>
              <li>The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time.</li>
              <li>This test contains <strong>{total}</strong> questions worth <strong>{quiz.eachMarks ?? 2} marks</strong> each.</li>
              <li>
                Negative marking:{" "}
                <strong>
                  {quiz.negativeMarking ? `−${quiz.negativeValue} per wrong answer` : "None"}
                </strong>
              </li>
              <li>You can navigate to any question using the Question Palette on the right side.</li>
              <li>Click <strong>Save &amp; Next</strong> to save your answer and move to the next question.</li>
            </ul>
          </div>

          <div className="cbt-instr-section warning">
            <h3>Important Guidelines</h3>
            <ul>
              <li>Do not press <strong>ESC</strong> or exit fullscreen during the exam.</li>
              <li>Switching tabs or minimizing the window may be counted as a violation.</li>
              <li>After <strong>4 violations</strong>, the exam will auto-submit.</li>
              <li>Ensure stable internet before starting.</li>
            </ul>
          </div>

          <div className="cbt-instr-section legend">
            <h3>Question Palette Legend</h3>
            <div className="cbt-legend-row">
              <div className="cbt-legend-item">
                <span className="cbt-legend-dot cbt-pal-answered" />
                Answered
              </div>
              <div className="cbt-legend-item">
                <span className="cbt-legend-dot cbt-pal-visited" />
                Not Answered
              </div>
              <div className="cbt-legend-item">
                <span className="cbt-legend-dot" />
                Not Visited
              </div>
            </div>
          </div>

          <div className="cbt-agree-box">
            <input
              type="checkbox"
              id="cbt-agree"
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="cbt-agree">
              I have read all the instructions and agree to follow them.
            </label>
          </div>

          <button
            className="cbt-btn-start"
            disabled={!agree}
            onClick={handleStart}
          >
            ▶ Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ── Exam screen ─────────────────────────────────────────────────────────────
  return (
    <div className="cbt-wrapper">
      {/* Header */}
      <div className="cbt-header">
        <div className="cbt-header-left">
          <img src={logo} alt="SSC Logo" className="cbt-logo-img" />
          <div className="cbt-exam-info">
            <span className="cbt-exam-title">{quiz.title}</span>
            <span className="cbt-exam-sub">
              Question {current + 1} of {total} &nbsp;|&nbsp; Answered{" "}
              {answeredCount}/{total}
            </span>
          </div>
        </div>
        <div className="cbt-candidate-info">
          <span>
            Candidate: <strong>{user?.name ?? user?.email ?? "Candidate"}</strong>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="cbt-body">
        {/* ── Left: Question panel ── */}
        <div className="cbt-main-panel">
          {/* Question header */}
          <div className="cbt-question-header">
            <div className="cbt-qno-section">
              <span className="cbt-qno-label">Question {current + 1}</span>
              {q.subject && (
                <span className="cbt-subject-tag">{q.subject}</span>
              )}
            </div>
            <div className="cbt-qno-right">
              <span className="cbt-marks-badge">+{quiz.eachMarks ?? 2} Marks</span>
              {quiz.negativeMarking && (
                <span className="cbt-neg-badge">−{quiz.negativeValue} Negative</span>
              )}
              <button
                className="cbt-lang-toggle"
                onClick={() => setLanguage((l) => (l === "en" ? "hi" : "en"))}
              >
                {language === "en" ? "Switch to Hindi" : "Switch to English"}
              </button>
            </div>
          </div>

          <div className="cbt-qdivider" />

          {/* Question body */}
          <div className="cbt-question-body">
            {(q.type === "text" || q.type === "mixed" || !q.type) && (
              <p className="cbt-question-text">
                {language === "hi" && q.questionHi ? q.questionHi : q.question}
              </p>
            )}
            {language === "hi" && !q.questionHi && (
              <p className="cbt-hindi-note">[Hindi translation not available]</p>
            )}
            {(q.type === "image" || q.type === "mixed") && q.questionImage && (
              <img
                className="cbt-question-image"
                src={q.questionImage}
                alt={`Question ${current + 1}`}
              />
            )}

            {q.answerType === "descriptive" ? (
              <textarea
                className="cbt-descriptive"
                placeholder="Type your answer here..."
                value={answers[current] ?? ""}
                onChange={(e) => handleSelect(e.target.value)}
              />
            ) : (
              <div className="cbt-options-list">
                {(q.options || []).map((opt, i) => {
                  const val = String(i);
                  const isMultiple = q.answerType === "multiple";
                  const checked = isMultiple
                    ? Array.isArray(answers[current]) &&
                      answers[current].includes(val)
                    : String(answers[current]) === val;

                  return (
                    <label
                      key={i}
                      className={`cbt-option-item ${checked ? "cbt-selected" : ""}`}
                    >
                      <input
                        type={isMultiple ? "checkbox" : "radio"}
                        name={`q${current}`}
                        className="cbt-radio"
                        checked={checked}
                        onChange={() => handleSelect(val)}
                      />
                      <span className="cbt-option-badge">{OPTION_LABELS[i]}</span>
                      <span className="cbt-option-text">
                        {(language === "hi" && q.optionsHi?.[i]?.text) ? q.optionsHi[i].text : (opt.text || `Option ${i + 1}`)}
                      </span>
                      {opt.image && (
                        <img
                          className="cbt-option-image"
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

          {/* Bottom nav */}
          <div className="cbt-nav-bar">
            <button
              className="cbt-btn-prev"
              onClick={handlePrev}
              disabled={current === 0}
            >
              &#8592; Previous
            </button>
            <button
              className="cbt-btn-save-next"
              onClick={handleSaveAndNext}
              disabled={current === total - 1}
            >
              Save &amp; Next &#8594;
            </button>
            <button
              className="cbt-btn-final-submit"
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
            >
              Final Submit
            </button>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="cbt-sidebar">
          {/* Timer */}
          <div className={`cbt-timer-box ${timeLeft < 300 ? "cbt-timer-warning" : ""}`}>
            <span className="cbt-timer-label">Time Remaining</span>
            <span className="cbt-timer-display">{formatTime(timeLeft)}</span>
            {timeLeft < 300 && (
              <span className="cbt-timer-alert">Less than 5 min left!</span>
            )}
          </div>

          {/* Palette */}
          <div className="cbt-palette-section">
            <div className="cbt-palette-heading">Question Palette</div>

            <div className="cbt-palette-grid">
              {quiz.questions.map((_, i) => {
                const isAnswered =
                  Array.isArray(answers[i])
                    ? answers[i].length > 0
                    : answers[i] !== null;
                const isCurrent = i === current;
                const isVisitedOnly = visited[i] && !isAnswered && !isCurrent;

                return (
                  <button
                    key={i}
                    className={`cbt-palette-btn
                      ${isCurrent ? "cbt-pal-current" : ""}
                      ${!isCurrent && isAnswered ? "cbt-pal-answered" : ""}
                      ${isVisitedOnly ? "cbt-pal-visited" : ""}
                    `}
                    onClick={() => setCurrent(i)}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="cbt-legend">
              {[
                { cls: "cbt-pal-answered", label: "Answered" },
                { cls: "cbt-pal-current", label: "Current" },
                { cls: "cbt-pal-visited", label: "Not Answered" },
                { cls: "", label: "Not Visited" },
              ].map(({ cls, label }) => (
                <div key={label} className="cbt-legend-item">
                  <span className={`cbt-legend-dot ${cls}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="cbt-summary-box">
            <div className="cbt-summary-item">
              <strong className="cbt-ans-count">{answeredCount}</strong>
              <span>Answered</span>
            </div>
            <div className="cbt-summary-sep" />
            <div className="cbt-summary-item">
              <strong>{total - answeredCount}</strong>
              <span>Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="cbt-modal-overlay">
          <div className="cbt-modal">
            <div className="cbt-modal-icon">⚠</div>
            <h3>Submit Exam?</h3>
            <div className="cbt-modal-stats">
              <div className="cbt-modal-stat">
                <span>Total</span>
                <strong>{total}</strong>
              </div>
              <div className="cbt-modal-stat">
                <span>Answered</span>
                <strong className="cbt-green">{answeredCount}</strong>
              </div>
              <div className="cbt-modal-stat">
                <span>Not Answered</span>
                <strong className="cbt-red">{total - answeredCount}</strong>
              </div>
            </div>
            <p className="cbt-modal-warning">
              Once submitted, you cannot change your answers.
            </p>
            <div className="cbt-modal-actions">
              <button
                className="cbt-btn-cancel"
                disabled={violationCount >= 4}
                onClick={() => {
                  if (violationCount < 4) setShowConfirm(false);
                }}
              >
                Go Back
              </button>
              <button
                className="cbt-btn-confirm"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
              >
                {isSubmitting ? "Submitting..." : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation toast */}
      {showViolation && (
        <div className="cbt-violation-toast">
          ⚠ Tab switch detected ({violationCount}/4)
        </div>
      )}
    </div>
  );
}

export default MockTest;
