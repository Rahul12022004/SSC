import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiSkipBack,
  FiSkipForward,
  FiClock,
} from "react-icons/fi";
import { BASE_URL } from "../context/AuthContext.jsx";
import "../styles/quiz.css";
import { FiLoader } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { sectionsData } from "../data/sections.js";

function QuizPage() {
  const { id } = useParams();
  const section = sectionsData.find((s) => s.id === id);

  const [started, setStarted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const [showViolation, setShowViolation] = useState(false);
  const quizStartTimeRef = useRef(null);

  const chunksRef = useRef([]);

  const [flagged, setFlagged] = useState([]);

  if (!section) return <h2>Section Not Found</h2>;

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (section) {
      setTimeLeft(section.time);
    }
  }, [section]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && started) {
        e.preventDefault();

        const now = Date.now();
        const timeFromStart = Math.floor(
          (now - (quizStartTimeRef.current || now)) / 1000,
        );

        const newCount = violationCount + 1;

        setViolationCount(newCount);

        setViolations((prev) => [
          ...prev,
          `Violation detected at ${timeFromStart}s`,
        ]);

        setShowViolation(true);

        // auto hide popup after 3 sec
        setTimeout(() => setShowViolation(false), 3000);

        // fullscreen restore
        setTimeout(() => {
          const el = document.documentElement;
          if (!document.fullscreenElement) {
            el.requestFullscreen().catch(() => {});
          }
        }, 200);

        // force submit
        if (newCount >= 4) {
          setShowSubmit(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, violationCount]);

  useEffect(() => {
    const disable = (e) => {
      if (e.type === "contextmenu") e.preventDefault();

      if (e.ctrlKey || e.metaKey || e.altKey || e.key.startsWith("F")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disable);
    document.addEventListener("keydown", disable);

    return () => {
      document.removeEventListener("contextmenu", disable);
      document.removeEventListener("keydown", disable);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && started) {
        setShowViolation(true);
        setTimeout(() => setShowViolation(false), 2000);

        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started]);

  // TIMER
  useEffect(() => {
    if (!started) return;

    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [started]);

  const handleStart = async () => {
    try {
      const el = document.documentElement;

      if (el.requestFullscreen) {
        await el.requestFullscreen();
      }

      quizStartTimeRef.current = Date.now();
      setStarted(true);
    } catch {
      alert("Failed to start quiz!");
    }
  };

  const formatTime = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (i) => {
    const updated = [...answers];
    updated[current] = i;
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
    setCurrent((c) => Math.min(c + 1, section.questions.length - 1));
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
  };

  const handleLast = () => {
    setCurrent(section.questions.length - 1);
  };

  const total = section.questions.length;

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await fetch(`${BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          violations,
        }),
      });

      alert("Quiz Submitted!");
      window.close();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // ✅ SUBMIT SCREEN
  if (showSubmit) {
    const total = section.questions.length;
    const attempted = answers.filter((a) => a !== undefined).length;
    const skipped = total - attempted;

    return (
      <div className="quizPage centerScreen">
        <div className="submitCard">
          <h2>Submit Quiz?</h2>

          <div className="submitStats">
            <div>
              <span>Total Questions</span>
              <strong>{total}</strong>
            </div>

            <div>
              <span>Attempted</span>
              <strong className="greenText">{attempted}</strong>
            </div>

            <div>
              <span>Skipped</span>
              <strong className="yellowText">{skipped}</strong>
            </div>
          </div>

          <p className="submitWarning">
            Once submitted, you cannot change your answers.
          </p>

          <div className="submitActions">
            <button
              className="cancelBtn"
              disabled={isSubmitting || violationCount >= 4}
              onClick={() => {
                if (violationCount < 4) setShowSubmit(false);
              }}
            >
              Go Back
            </button>

            <button
              className="submitBtn"
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
            >
              {isSubmitting ? (
                <span className="loaderWrapper">
                  <FiLoader className="spinIcon" />
                  Submitting...
                </span>
              ) : (
                "Submit Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ INSTRUCTION PAGE
  if (!started) {
    return (
      <div className="quizPage">
        <div className="instructionCard">
          <h2>Quiz Instructions</h2>

          <ul>
            <li>Do not switch tabs</li>
            <li>Timer will auto submit</li>
            <li>Each question must be answered carefully</li>
          </ul>

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
          </div>

          <div className="agreeBox">
            <input
              type="checkbox"
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label>I agree to all instructions</label>
          </div>

          <button disabled={!agree} onClick={handleStart}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = section.questions[current];

  return (
    <div className="quizPage">
      {/* HEADER */}
      <div className="quizHeader">
        <h1>{section.title}</h1>
        <div className="timerBox">
          <div className="timer">
            <FiClock /> {formatTime()}
          </div>

          <div className="negativeMarking">
            Negative Marking: <span>{section.negative}</span>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* TRACKER */}
      <div className="examLayout">
        {/* SIDE PANEL */}
        <div className="sidePanel">
          {section.questions.map((_, i) => (
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

        {/* MAIN CONTENT */}
        <div className="quizContent">
          <div className="questionCard">
            <h2>
              Q{current + 1}. {q.question}
            </h2>

            <div className="optionsGrid">
              {q.options.map((opt, i) => (
                <label key={i} className="optionItem">
                  <input
                    type="radio"
                    checked={answers[current] === i}
                    onChange={() => handleAnswer(i)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* NAV */}
          <div className="navBar">
            <div className="navLeft">
              <button onClick={handlePrev}>
                <FiArrowLeft /> Previous
              </button>

              <button onClick={() => setCurrent(0)}>
                <FiSkipBack /> First
              </button>

              <button onClick={handleLast}>
                <FiSkipForward /> Last
              </button>
            </div>

            {/* FLAG BUTTON */}
            <button
              className="flagBtn"
              onClick={() => {
                const f = [...flagged];
                f[current] = !f[current];
                setFlagged(f);
              }}
            >
              🚩 {flagged[current] ? "Unflag" : "Flag"}
            </button>

            <div className="navRight">
              {current === total - 1 ? (
                <button onClick={() => setShowSubmit(true)}>Submit</button>
              ) : (
                <button onClick={handleNext}>
                  Next <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="navBar">
        <div className="navLeft">
          <button onClick={handlePrev}>
            <FiArrowLeft /> Previous
          </button>

          {current > 0 && (
            <button onClick={() => setCurrent(0)}>
              <FiSkipBack /> First
            </button>
          )}

          {current > 0 && (
            <button onClick={handleLast}>
              <FiSkipForward /> Last
            </button>
          )}
        </div>

        <button
          onClick={() => {
            const f = [...flagged];
            f[current] = !f[current];
            setFlagged(f);
          }}
        >
          {flagged[current] ? "Unflag" : "Flag"}
        </button>

        <div className="navRight">
          {current === total - 1 ? (
            <button onClick={() => setShowSubmit(true)}>Submit</button>
          ) : (
            <button onClick={handleNext}>
              Next <FiArrowRight />
            </button>
          )}
        </div>
      </div>

      {showViolation && violationCount <= 3 && (
        <div className="violationPopup">
          <h3>Violation detected! Alert: {violationCount}</h3>
          <p>
            You are given {Math.max(0, 3 - violationCount)} chances left. After
            that, the quiz will be forcefully terminated!
          </p>
          <p>
            You are given {3 - violationCount} chances. After that, the quiz
            will be forcefully terminated!
          </p>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
