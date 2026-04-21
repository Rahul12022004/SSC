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
    FiSave, // ✅ ADD THIS
  } from "react-icons/fi";

  import { BASE_URL } from "../context/AuthContext.jsx";
  import "../styles/quiz.css";
  import { FiLoader } from "react-icons/fi";
  import { useParams } from "react-router-dom";
  import { sectionsData } from "../data/sections.js";
  import { useNavigate } from "react-router-dom";

  import useAntiCheat from "./hooks/useAntiCheat.js";

  function QuizPage() {
    const { id } = useParams();
    const section = sectionsData.find((s) => s.id === id);
    const navigate = useNavigate();

    const [started, setStarted] = useState(false);
    const [agree, setAgree] = useState(false);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [status, setStatus] = useState([]);
    const [showSubmit, setShowSubmit] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { violationCount, showViolation } = useAntiCheat(
      started,
      setShowSubmit,
    );

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
        // ✅ SIMULATE DELAY (like real API)
        await new Promise((res) => setTimeout(res, 1000));

        console.log("✅ Quiz Submitted");
        console.log("Answers:", answers);
        console.log("Violations:", violationCount);

        // ✅ NAVIGATE BACK TO DASHBOARD
        navigate("/exam", {
          state: {
            sectionId: id,
            status: "submitted",
            spent: Math.floor((section.time * 60 - timeLeft) / 60),
          },
        });
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    };

    const handleSaveAndExit = () => {
      console.log("💾 Saving progress...");

      // ✅ Save to localStorage
      localStorage.setItem(
        `quiz_${id}`,
        JSON.stringify({
          answers,
          current,
          timeLeft,
          flagged,
          status,
        }),
      );

      // ✅ Navigate to dashboard as in-progress
      navigate("/exam", {
        state: {
          sectionId: id,
          status: "in-progress",
          spent: Math.floor((section.time * 60 - timeLeft) / 60),
        },
      });
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

    // ✅ INSTRUCTION PAGE
    if (!started) {
      return (
        <div className="quizPage">
          <div className="instructionWrapper">
            <div className="instructionCard">
              <h2> Quiz Instructions</h2>

              <div className="instructionSection">
                <h3> General Rules</h3>
                <ul>
                  <li>This is a timed quiz. Timer will start once you begin.</li>
                  <li>Each question has only one correct answer.</li>
                  <li>You can navigate between questions freely.</li>
                  <li>Make sure to review your answers before submitting.</li>
                </ul>
              </div>

              <div className="instructionSection warning">
                <h3> Important Guidelines</h3>
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
                <h3> Question Status</h3>
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
              {/* LEFT */}
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

              {/* CENTER */}
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

              {/* RIGHT */}
              <div className="navRight">
                {/* SAVE & EXIT */}
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
            <h3>⚠️ Violation ({violationCount}/4)</h3>
            <p>Remaining chances: {Math.max(0, 4 - violationCount)}</p>
          </div>
        )}
      </div>
    );
  }

  export default QuizPage;
