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

import { BASE_URL } from "@/context/AuthContext";
import RichTextBlockRenderer from "@/common/components/RichTextBlocks";
import FeedbackModal from "@/common/components/FeedbackModal";
import "@/styles/testquiz.css";
import { useParams, useNavigate } from "react-router-dom";
import useAntiCheat from "../hooks/useAntiCheat.js";
import { useAuth } from "@/context/AuthContext";

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
  const [pendingResult, setPendingResult] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sectionTimers, setSectionTimers] = useState([]);

  const { violationCount, showViolation } = useAntiCheat(
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
        // Start at first non-section question
        const firstQ = data.quiz.questions.findIndex((q) => q.type !== "section");
        if (firstQ > 0) setCurrent(firstQ);
        // Init per-section timers (only for sections with sectionTime > 0)
        setSectionTimers(
          data.quiz.questions
            .map((q, i) => ({ idx: i, name: q.question || "Section", timeLeft: (q.sectionTime || 0) * 60 }))
            .filter((s, i) => data.quiz.questions[i].type === "section" && data.quiz.questions[i].sectionTime > 0)
        );
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
          setShowSubmit(true);
          return 0;
        }
        return p - 1;
      });
      setSectionTimers((prev) =>
        prev.map((s) => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }))
      );
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
    let next = current + 1;
    while (next < quiz.questions.length && quiz.questions[next].type === "section") next++;
    setCurrent(Math.min(next, quiz.questions.length - 1));
  };

  const handlePrev = () => {
    let prev = current - 1;
    while (prev > 0 && quiz.questions[prev].type === "section") prev--;
    setCurrent(Math.max(prev, 0));
  };

  const handleLast = () => {
    let last = quiz.questions.length - 1;
    while (last > 0 && quiz.questions[last].type === "section") last--;
    setCurrent(last);
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    if (!user?.email) {
      alert("User not logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      const timeTaken = quiz.duration * 60 - timeLeft;
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ quizId: id, answers, timeTaken }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setIsSubmitting(false);
        return;
      }

      const serverBreakdown = data.breakdown ?? [];
      const finalBreakdown = (serverBreakdown.length > 0 ? serverBreakdown : quiz.questions.map((q, idx) => ({
        question: q.question,
        questionImage: q.questionImage || null,
        options: q.options,
        correctAnswer: q.correctAnswer ?? null,
        userAnswer: answers[idx] ?? null,
        answerType: q.answerType || "single",
      }))).map((item, idx) => ({ ...item, flagged: flagged[idx] ?? false }));

      const resultState = {
        quizId: id,
        isAdminTest: data.isAdminTest || false,
        feedbackEnabled: quiz.feedbackEnabled !== false,
        feedbackShown: true,
        score: data.score,
        sectionTitle: quiz.title,
        breakdown: finalBreakdown,
        rank: data.rank,
        totalUsers: data.totalUsers,
        percentile: data.percentile ?? null,
        rankInsight: data.rankInsight,
        solutionPdfUrl: data.solutionPdfUrl || null,
        endsAt: quiz.endsAt || null,
      };

      if (quiz.feedbackEnabled !== false) {
        setPendingResult(resultState);
        setShowFeedbackModal(true);
        setIsSubmitting(false);
      } else {
        navigate("/result", { state: resultState });
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    navigate("/result", { state: pendingResult });
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
  const qTotal = quiz.questions.filter((x) => x.type !== "section").length;
  const qNum = quiz.questions.slice(0, current + 1).filter((x) => x.type !== "section").length;
  const lastQuestionIdx = quiz.questions.reduce((last, item, i) => item.type !== "section" ? i : last, 0);

  // 🔥 SUBMIT SCREEN
  if (showSubmit) {
    const qTotalEarly = quiz.questions.filter((x) => x.type !== "section").length;
    const attempted = answers.filter((a, i) => {
      if (quiz.questions[i]?.type === "section") return false;
      return Array.isArray(a) ? a.length > 0 : a !== undefined && a !== "";
    }).length;

    return (
      <>
        <div className="testQuiz centerScreen">
          <div className="submitCard">
            <h2>Submit Quiz?</h2>

            <div className="submitStats">
              <div>
                <span>Total</span>
                <strong>{qTotalEarly}</strong>
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

        {showFeedbackModal && pendingResult && (
          <FeedbackModal
            quizId={pendingResult.quizId}
            quizTitle={pendingResult.sectionTitle}
            userEmail={user?.email}
            userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email}
            onClose={handleFeedbackClose}
          />
        )}
      </>
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
          {quiz.questions.map((item, i) => {
            if (item.type === "section") {
              const sTimer = sectionTimers.find((s) => s.idx === i);
              const secMm = sTimer ? String(Math.floor(sTimer.timeLeft / 60)).padStart(2, "0") : null;
              const secSs = sTimer ? String(sTimer.timeLeft % 60).padStart(2, "0") : null;
              return (
                <div key={i} className="qBoxSection" title={item.question}>
                  <span className="qBoxSectionName">{item.question || "Section"}</span>
                  {sTimer && (
                    <span className={`qBoxSectionTimer${sTimer.timeLeft === 0 ? " expired" : ""}`}>
                      {secMm}:{secSs}
                    </span>
                  )}
                </div>
              );
            }
            const num = quiz.questions.slice(0, i + 1).filter((x) => x.type !== "section").length;
            return (
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
                {num}
              </div>
            );
          })}
        </div>

        {/* MAIN */}
        <div className="quizContent">
          {q.type === "section" ? (
            <div className="sectionDividerCard">
              <div className="sectionDividerLabel">SECTION</div>
              <h2 className="sectionDividerTitle">{q.question || "New Section"}</h2>
              <button className="sectionNextBtn" onClick={handleNext}>
                Continue →
              </button>
            </div>
          ) : (
          <>
          <div className="questionCard">
            {(q.type === "text" || q.type === "mixed") && (
              <div className="testQuizQuestionPrompt">
                <span className="testQuizQuestionLabel">Q{qNum}.</span>
                <RichTextBlockRenderer
                  content={q.question}
                  className="testQuizRichQuestion"
                />
              </div>
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
              <button onClick={() => {
                const firstQ = quiz.questions.findIndex(q => q.type !== "section");
                setCurrent(firstQ >= 0 ? firstQ : 0);
              }}>
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
              {current === lastQuestionIdx ? (
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
          </>
          )}
        </div>
      </div>

      {showViolation && (
        <div className="violationPopup">⚠️ Violation ({violationCount}/4)</div>
      )}
    </div>
  );
}


export default TestQuiz;
