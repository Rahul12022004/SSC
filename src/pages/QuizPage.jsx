import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFlag,
  FiLoader,
  FiPlay,
  FiSave,
  FiSend,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { sectionsData } from "../data/sections.js";
import "../styles/quiz.css";
import useAntiCheat from "./hooks/useAntiCheat.js";

const OPTION_LABELS = ["A", "B", "C", "D"];
const LEGACY_GENERAL_AWARENESS_ID = "g" + "k";
const LEGACY_REASONING_ID = "sci" + "ence";
const LEGACY_SECTION_IDS = {
  [LEGACY_GENERAL_AWARENESS_ID]: "general-awareness",
  [LEGACY_REASONING_ID]: "reasoning",
};

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sectionId = LEGACY_SECTION_IDS[id] || id;
  const section = sectionsData.find((s) => s.id === sectionId);

  const [started, setStarted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagged, setFlagged] = useState([]);
  const [timeLeft, setTimeLeft] = useState(section?.time ?? 0);

  const quizStartTimeRef = useRef(null);
  const { violationCount, showViolation } = useAntiCheat(
    started,
    setShowSubmit,
  );

  const total = section?.questions.length ?? 0;
  const q = section?.questions[current];
  const attempted = answers.filter((answer) => answer !== undefined).length;
  const fixedOptions = Array.from({ length: 4 }, (_, index) => ({
    label: OPTION_LABELS[index],
    text: q?.options?.[index] ?? `Option ${index + 1}`,
    disabled: !q?.options?.[index],
  }));

  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowSubmit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  if (!section) {
    return <h2>Section Not Found</h2>;
  }

  const handleStart = async () => {
    try {
      const el = document.documentElement;

      if (el.requestFullscreen && !document.fullscreenElement) {
        await el.requestFullscreen();
      }

      quizStartTimeRef.current = Date.now();
      setTimeLeft(section.time);
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

  const markSkippedIfNeeded = () => {
    if (answers[current] !== undefined) return;

    const stat = [...status];
    stat[current] = "skipped";
    setStatus(stat);
  };

  const handleNext = () => {
    markSkippedIfNeeded();
    setCurrent((c) => Math.min(c + 1, total - 1));
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
  };

  const handleLast = () => {
    markSkippedIfNeeded();
    setCurrent(total - 1);
  };

  const getTimeSpent = () => Math.floor((section.time - timeLeft) / 60);

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await new Promise((res) => setTimeout(res, 1000));

      navigate("/exam", {
        state: {
          sectionId,
          status: "submitted",
          spent: getTimeSpent(),
        },
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = () => {
    localStorage.setItem(
      `quiz_${sectionId}`,
      JSON.stringify({
        answers,
        current,
        timeLeft,
        flagged,
        status,
      }),
    );

    navigate("/exam", {
      state: {
        sectionId,
        status: "in-progress",
        spent: getTimeSpent(),
      },
    });
  };

  if (showSubmit) {
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
                <>
                  <FiSend /> Submit Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="quizPage">
        <div className="instructionWrapper">
          <div className="instructionCard">
            <h2>{section.title} Quiz Instructions</h2>

            <div className="instructionSection">
              <h3>General Rules</h3>
              <ul>
                <li>This is a timed quiz. Timer will start once you begin.</li>
                <li>Each question has four fixed options.</li>
                <li>You can navigate between questions freely.</li>
                <li>Make sure to review your answers before submitting.</li>
              </ul>
            </div>

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
    <div className="quizPage">
      <div className="quizHeader">
        <div>
          <h1>{section.title}</h1>
          <p className="questionCounter">
            Question {current + 1} of {total} | Answered {attempted}/{total}
          </p>
        </div>

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

      <div className="examLayout">
        <div className="sidePanel">
          {section.questions.map((_, i) => (
            <button
              type="button"
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
            </button>
          ))}
        </div>

        <div className="quizContent">
          <div className="questionCard">
            <h2>
              Q{current + 1}. {q.question}
            </h2>

            <div className="optionsGrid">
              {fixedOptions.map((opt, i) => (
                <label
                  key={opt.label}
                  className={`optionItem ${answers[current] === i ? "selected" : ""} ${
                    opt.disabled ? "disabled" : ""
                  }`}
                >
                  <input
                    type="radio"
                    checked={answers[current] === i}
                    disabled={opt.disabled}
                    onChange={() => handleAnswer(i)}
                  />
                  <span className="optionBadge">{opt.label}</span>
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

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
              <button className="saveExitBtn" onClick={handleSaveAndExit}>
                <FiSave /> Save & Exit
              </button>

              {current === total - 1 ? (
                <button
                  className="submitMainBtn"
                  onClick={() => setShowSubmit(true)}
                >
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
        <div className="violationPopup">
          <h3>Violation ({violationCount}/4)</h3>
          <p>Remaining chances: {Math.max(0, 4 - violationCount)}</p>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
