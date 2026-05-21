import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import RichTextBlockRenderer from "@/common/components/RichTextBlocks";
import useAntiCheat from "../hooks/useAntiCheat.js";
import FeedbackModal from "@/common/components/FeedbackModal";
import "@/styles/mocktest.css";
import logo from "@/assets/img/cut_transperent logo.png";

const OPTION_LABELS = ["A", "B", "C", "D"];

const parseSections = (questions) => {
  const secs = [];
  let cur = null;
  questions.forEach((q, i) => {
    if (q.type === "section") {
      if (cur) secs.push(cur);
      cur = { name: q.question || "Section", sectionTime: Number(q.sectionTime) || 0, questionIndices: [] };
    } else {
      if (!cur) cur = { name: "All Questions", sectionTime: 0, questionIndices: [] };
      cur.questionIndices.push(i);
    }
  });
  if (cur) secs.push(cur);
  return secs;
};

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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [markedForReview, setMarkedForReview] = useState([]);

  const [sections, setSections] = useState([]);
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [lockedSections, setLockedSections] = useState(new Set());
  const [perSectionUsed, setPerSectionUsed] = useState([]);
  const [sectionTransitioning, setSectionTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizAutoLock, setQuizAutoLock] = useState(false);
  const [sectionSubmitReason, setSectionSubmitReason] = useState("timer");
  const sectionTimeLeftRef = useRef(0);
  const currentSectionIdxRef = useRef(0);
  const sectionsRef = useRef([]);
  const quizAutoLockRef = useRef(false);

  const { violationCount, showViolation } = useAntiCheat(started, setShowConfirm);

  const isAdmin = user?.role === "admin" || user?.roleLevel >= 10;
  const submissionKey = `submitted_${user?.email}_${id}`;
  const hasSectionTimers = sections.some(s => s.sectionTime > 0);

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
        setQuizAutoLock(Boolean(data.quiz.autoLock));
        quizAutoLockRef.current = Boolean(data.quiz.autoLock);
        setTimeLeft(data.quiz.duration * 60);
        setAnswers(Array(data.quiz.questions.length).fill(null));
        setVisited(Array(data.quiz.questions.length).fill(false));
        const parsed = parseSections(data.quiz.questions);
        setSections(parsed);
        sectionsRef.current = parsed;
        setSectionTimeLeft(parsed[0]?.sectionTime > 0 ? parsed[0].sectionTime * 60 : 0);
        setPerSectionUsed(parsed.map(() => 0));
        const firstRealIdx = parsed[0]?.questionIndices[0] ?? 0;
        setCurrent(firstRealIdx);
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

  // ── Keep refs in sync ───────────────────────────────────────────────────────
  useEffect(() => { sectionTimeLeftRef.current = sectionTimeLeft; }, [sectionTimeLeft]);
  useEffect(() => { currentSectionIdxRef.current = currentSectionIdx; }, [currentSectionIdx]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { quizAutoLockRef.current = quizAutoLock; }, [quizAutoLock]);

  // ── Section switch detection (carry-forward + timer reset) ───────────────────
  useEffect(() => {
    if (!started || !quiz || sectionsRef.current.length === 0) return;
    const newSecIdx = sectionsRef.current.findIndex(s => s.questionIndices.includes(current));
    if (newSecIdx < 0 || newSecIdx === currentSectionIdxRef.current) return;
    
    // Save previous section time used
    const prevSec = sectionsRef.current[currentSectionIdxRef.current];
    if (prevSec?.sectionTime > 0) {
      const used = prevSec.sectionTime * 60 - sectionTimeLeftRef.current;
      const savedIdx = currentSectionIdxRef.current;
      setPerSectionUsed(prev => { const n = [...prev]; n[savedIdx] = Math.max(0, used); return n; });
    }
    
    // Reset timer for new section
    const newSec = sectionsRef.current[newSecIdx];
    if (newSec) {
      const newTime = (newSec.sectionTime ?? 0) > 0 ? newSec.sectionTime * 60 : 0;
      setSectionTimeLeft(newTime);
    }
    setCurrentSectionIdx(newSecIdx);
  }, [current, started, quiz]);

  // ── Section countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    const interval = setInterval(() => {
      setSectionTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted]);

  // ── Section expiry: auto-lock + transition ───────────────────────────────────
  useEffect(() => {
    if (!started || sectionTimeLeft !== 0) return;
    const sec = sectionsRef.current[currentSectionIdxRef.current];
    if (!sec || !sec.sectionTime || sec.sectionTime === 0) return;
    if (quizAutoLockRef.current) {
      const expiredIdx = currentSectionIdxRef.current;
      // Save time used for this section
      setPerSectionUsed(prev => { const n = [...prev]; n[expiredIdx] = sec.sectionTime * 60; return n; });
      setSectionSubmitReason("timer");
      setLockedSections(prev => { const n = new Set(prev); n.add(expiredIdx); return n; });
      setSectionTransitioning(true);
      setTimeout(() => {
        setSectionTransitioning(false);
        const nextSec = sectionsRef.current[expiredIdx + 1];
        if (nextSec?.questionIndices.length > 0) setCurrent(nextSec.questionIndices[0]);
        else setShowConfirm(true);
      }, 2000);
    }
  }, [sectionTimeLeft, started]);

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

  const navigateTo = (qIdx) => {
    const secIdx = sectionsRef.current.findIndex(s => s.questionIndices.includes(qIdx));
    if (secIdx >= 0 && lockedSections.has(secIdx)) return;
    if (quizAutoLockRef.current && secIdx >= 0 && secIdx !== currentSectionIdxRef.current) return;
    setCurrent(qIdx);
  };

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
    const nextIdx = quiz.questions.findIndex((q, i) => i > current && q.type !== "section");
    if (nextIdx === -1) return;
    if (quizAutoLockRef.current) {
      const nextSecIdx = sectionsRef.current.findIndex(s => s.questionIndices.includes(nextIdx));
      if (nextSecIdx !== currentSectionIdxRef.current) return;
    }
    navigateTo(nextIdx);
  };

  const isAtSectionEnd = (() => {
    if (!quizAutoLock || sections.length <= 1) return false;
    const sec = sections[currentSectionIdx];
    if (!sec) return false;
    const lastQInSec = sec.questionIndices[sec.questionIndices.length - 1];
    return current === lastQInSec;
  })();

  const handleSubmitSection = () => {
    const idx = currentSectionIdxRef.current;
    const sec = sectionsRef.current[idx];
    // Save time used for this section
    if (sec?.sectionTime > 0) {
      const used = sec.sectionTime * 60 - sectionTimeLeftRef.current;
      setPerSectionUsed(prev => { const n = [...prev]; n[idx] = Math.max(0, used); return n; });
    }
    setSectionSubmitReason("manual");
    setLockedSections(prev => { const n = new Set(prev); n.add(idx); return n; });
    setSectionTransitioning(true);
    setTimeout(() => {
      setSectionTransitioning(false);
      const nextSec = sectionsRef.current[idx + 1];
      if (nextSec?.questionIndices.length > 0) setCurrent(nextSec.questionIndices[0]);
      else setShowConfirm(true);
    }, 1000);
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const updated = [...prev];
      updated[current] = !updated[current];
      return updated;
    });
  };

  const handlePrev = () => {
    let prevIdx = current - 1;
    while (prevIdx >= 0 && quiz.questions[prevIdx]?.type === "section") prevIdx--;
    if (prevIdx >= 0) navigateTo(prevIdx);
  };

  const handleClear = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = null;
      return updated;
    });
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
      const timeTaken = (quiz?.duration ?? 0) * 60 - timeLeft;
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
        alert(data.message || "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
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
      let breakdownOffset = 0;
      const qToBI = {};
      (quiz?.questions ?? []).forEach((q, i) => {
        if (q.type !== "section") { qToBI[i] = breakdownOffset; breakdownOffset++; }
      });
      const finalSectionStats = sectionsRef.current.map((sec, i) => {
        const breakdownIndices = sec.questionIndices.map(qi => qToBI[qi]).filter(bi => bi !== undefined);
        let timeUsed = perSectionUsed[i] || 0;
        if (i === currentSectionIdxRef.current && sec.sectionTime > 0) {
          timeUsed = sec.sectionTime * 60 - sectionTimeLeftRef.current;
        }
        return { name: sec.name, sectionTime: sec.sectionTime, timeUsed: Math.max(0, timeUsed), breakdownIndices };
      });
      localStorage.setItem(submissionKey, JSON.stringify({
        score: data.score ?? {},
        submittedAt: Date.now(),
        quizTitle: quiz?.title,
        breakdown: finalBreakdown,
        language,
        sectionStats: finalSectionStats,
        rank: data.rank,
        totalUsers: data.totalUsers,
        percentile: data.percentile ?? null,
        rankInsight: data.rankInsight,
      }));
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      const resultState = {
        quizId: id,
        isAdminTest: data.isAdminTest || false,
        feedbackEnabled: quiz?.feedbackEnabled !== false,
        score: data.score ?? {},
        sectionTitle: quiz?.title,
        breakdown: finalBreakdown,
        language,
        sectionStats: finalSectionStats,
        rank: data.rank,
        totalUsers: data.totalUsers,
        percentile: data.percentile ?? null,
        rankInsight: data.rankInsight,
        solutionPdfUrl: data.solutionPdfUrl || null,
        endsAt: quiz?.endsAt || null,
      };
      const feedbackKey = `feedback_shown_${user.email}_${id}`;
      const alreadyShown = localStorage.getItem(feedbackKey);
      if (quiz?.feedbackEnabled !== false && !alreadyShown) {
        setPendingResult(resultState);
        setShowFeedbackModal(true);
        setIsSubmitting(false);
      } else {
        navigate("/result", { state: resultState });
      }
    } catch {
      alert("Server error during submission.");
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClose = () => {
    localStorage.setItem(`feedback_shown_${user?.email}_${id}`, "1");
    setShowFeedbackModal(false);
    navigate("/result", { state: pendingResult });
  };

  const answeredCount = answers.filter((a) =>
    Array.isArray(a) ? a.length > 0 : a !== null
  ).length;
  const reviewCount = markedForReview.filter(Boolean).length;

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

  const total = quiz.questions.filter(q => q.type !== "section").length;
  const lastRealQIdx = quiz.questions.reduce((acc, q, i) => q.type !== "section" ? i : acc, -1);
  const currentDisplayNum = quiz.questions.slice(0, current + 1).filter(q => q.type !== "section").length;
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
    const durationMin = quiz.duration ?? 60;
    const perQ = quiz.eachMarks ?? 2;
    const negVal = quiz.negativeMarking ? Math.abs(quiz.negativeValue ?? 0.5) : 0;

    // Derive sections from question list (type === "section" marks section headers)
    const derivedSections = (() => {
      const sections = [];
      let current = null;
      for (const qItem of quiz.questions) {
        if (qItem.type === "section") {
          if (current) sections.push(current);
          current = { name: qItem.question || "Section", count: 0, sectionTime: qItem.sectionTime || 0 };
        } else {
          if (!current) current = { name: "All Questions", count: 0, sectionTime: 0 };
          current.count++;
        }
      }
      if (current) sections.push(current);
      // Always show at least one row
      if (sections.length === 0) return [{ name: "All Questions", count: total, time: durationMin }];
      
      return sections.map(sec => {
        // Use actual sectionTime if available, otherwise proportionally divide
        const hasSectionTimes = sections.some(s => s.sectionTime > 0);
        let time;
        if (hasSectionTimes && sec.sectionTime > 0) {
          time = sec.sectionTime;
        } else if (hasSectionTimes) {
          time = 0; // Section without timer
        } else {
          const totalQ = sections.reduce((s, s2) => s + s2.count, 0) || 1;
          time = Math.round((sec.count / totalQ) * durationMin);
        }
        return { ...sec, time };
      });
    })();

    return (
      <div className="cbt-instruction-page">
        <div className="cbt-instruction-header">
          <div className="cbt-logo-badge">SSC</div>
          <h2>{quiz.title}</h2>
        </div>

        <div className="cbt-instr-body">
          {/* ── Title block ── */}
          <div className="cbt-instr-title-block">
            <h1 className="cbt-instr-quiz-title">{quiz.title}</h1>
            <p className="cbt-instr-quiz-id">Quiz ID: {quiz.quizCode || quiz._id}</p>
          </div>

          {/* ── Stats row ── */}
          <div className="cbt-instr-stats">
            <div className="cbt-instr-stat">
              <span className="cbt-instr-stat-label">Total Questions</span>
              <span className="cbt-instr-stat-value">{total}</span>
            </div>
            <div className="cbt-instr-stat">
              <span className="cbt-instr-stat-label">Correct Marks</span>
              <span className="cbt-instr-stat-value">+{perQ}</span>
            </div>
            <div className="cbt-instr-stat">
              <span className="cbt-instr-stat-label">Negative Marks</span>
              <span className="cbt-instr-stat-value">{quiz.negativeMarking ? `-${negVal}` : "None"}</span>
            </div>
            <div className="cbt-instr-stat">
              <span className="cbt-instr-stat-label">Total Time</span>
              <span className="cbt-instr-stat-value">{durationMin} Minutes</span>
            </div>
          </div>

          {/* ── Test Summary ── */}
          <div className="cbt-summary-block">
              <h2 className="cbt-summary-title">
                <span className="cbt-summary-bar" />
                Test Summary
              </h2>
              <div className="cbt-summary-table-wrapper">
                <table className="cbt-summary-table">
                  <thead>
                    <tr>
                      <th>Section Name</th>
                      <th>Questions</th>
                      <th>Time (Min)</th>
                      <th>Marks</th>
                      <th>Negative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {derivedSections.map((sec, i) => (
                      <tr key={i}>
                        <td className="cbt-sum-name">{sec.name.toUpperCase()}</td>
                        <td>{sec.count}</td>
                        <td>{sec.time}</td>
                        <td className="cbt-sum-marks">+{perQ}</td>
                        <td className="cbt-sum-neg">{quiz.negativeMarking ? negVal : "—"}</td>
                      </tr>
                    ))}
                    <tr className="cbt-sum-total">
                      <td><strong>Total</strong></td>
                      <td><strong>{total}</strong></td>
                      <td><strong>{durationMin}</strong></td>
                      <td colSpan={2}><strong>Time: {durationMin} Mins</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          {/* ── Instruction card ── */}
          <div className="cbt-instruction-card">

            {/* 1. Quiz Mode Symbols */}
            <div className="cbt-instr-section">
              <h3>1. Quiz Mode Symbols (During Test)</h3>
              <div className="cbt-symbol-grid">
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-answered">1</span>
                  <span>Answered</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-review-answered">2 ★</span>
                  <span>Answered &amp; Marked for Review</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-review">3</span>
                  <span>Marked for Review (Unanswered)</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-current">4</span>
                  <span>Current Question</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-notvisited">5</span>
                  <span>Not Visited</span>
                </div>
              </div>
            </div>

            {/* 2. Solution Mode Symbols */}
            <div className="cbt-instr-section">
              <h3>2. Solution Mode Symbols (Analysis)</h3>
              <div className="cbt-symbol-grid">
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-correct">✓</span>
                  <span>Correct Answer</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-wrong">✗</span>
                  <span>Wrong Answer</span>
                </div>
                <div className="cbt-symbol-item">
                  <span className="cbt-sym-box cbt-sym-skipped">0</span>
                  <span>Skipped</span>
                </div>
              </div>
            </div>

            {/* 3. General Instructions */}
            <div className="cbt-instr-section">
              <h3>3. General Instructions / सामान्य निर्देश</h3>
              <ul className="cbt-instr-list">
                <li>
                  <strong>Name Entry:</strong> You <u>MUST</u> enter your full name in the box provided inside the quiz to submit.
                </li>
                <li>
                  <strong>Do not reload the page.</strong><br />
                  <span className="cbt-instr-hi">कृपया पेज को रीलोड न करें।</span>
                </li>
                <li>
                  <strong>Stable internet is required.</strong><br />
                  <span className="cbt-instr-hi">स्थिर इंटरनेट सुनिश्चित करें।</span>
                </li>
                <li>
                  <strong>Submit before time ends.</strong><br />
                  <span className="cbt-instr-hi">समय समाप्त होने से पहले जमा करें।</span>
                </li>
              </ul>
            </div>

            {/* Agree checkbox */}
            <div className="cbt-agree-box">
              <input
                type="checkbox"
                id="cbt-agree"
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="cbt-agree">
                I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair means in this examination.
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
      </div>
    );
  }

  // ── Exam screen ─────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-100" style={{fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-orange-700 to-orange-500 text-white px-5 py-2 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SSC Logo" className="h-10 w-auto" />
          <div>
            <div className="font-bold text-base leading-tight">{quiz.title}</div>
            <div className="text-xs opacity-85">
              Question {currentDisplayNum} of {total} &nbsp;|&nbsp; Answered {answeredCount}/{total}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Candidate"}</div>
          <div className="text-xs opacity-80">Candidate: <strong>{user?.email ?? ""}</strong></div>
        </div>
      </header>

      {/* Section Tabs */}
      {sections.length > 1 && (
        <div className="flex-shrink-0 bg-indigo-900 border-b-2 border-yellow-400 flex overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {sections.map((sec, i) => {
            const secAnswered = sec.questionIndices.filter(qi => { const a = answers[qi]; return Array.isArray(a) ? a.length > 0 : a !== null; }).length;
            const isActive = i === currentSectionIdx;
            const isLocked = lockedSections.has(i);
            const isFuture = quizAutoLock && i > currentSectionIdx && !isLocked;
            const isBlocked = isLocked || isFuture;
            return (
              <button
                key={i}
                onClick={() => { if (!isBlocked && sec.questionIndices.length > 0) navigateTo(sec.questionIndices[0]); }}
                disabled={isBlocked}
                className={`flex-shrink-0 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all border-b-4 ${isActive ? "text-white border-yellow-400 bg-white/10" : "text-blue-200 border-transparent hover:text-white hover:bg-white/5"} ${isBlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {sec.name} {secAnswered}/{sec.questionIndices.length}{isLocked ? " 🔒" : isFuture ? " 🔐" : ""}
              </button>
            );
          })}
        </div>
      )}

      {/* Stats Bar */}
      {(() => {
        const curQs = sections[currentSectionIdx]?.questionIndices ??
          quiz.questions.map((_, i) => i).filter(i => quiz.questions[i].type !== "section");
        const secAnswered = curQs.filter(qi => { const a = answers[qi]; return Array.isArray(a) ? a.length > 0 : a !== null; }).length;
        const secReview   = curQs.filter(qi => !!markedForReview[qi]).length;
        const secNotVisit = curQs.filter(qi => !visited[qi]).length;
        const secNotAns   = curQs.length - secAnswered - secNotVisit;
        return (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-1.5 flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">{secAnswered} Answered</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">{Math.max(0, secNotAns)} Not Answered</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">{secReview} For Review</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{secNotVisit} Not Visited</span>
          </div>
        );
      })()}

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-3 p-3 overflow-hidden relative">

        {/* Mobile backdrop — closes sidebar on tap outside */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left: Question Panel */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Question Header */}
          <div className="flex-shrink-0 border-b border-gray-100 px-5 py-2.5">
            {/* Row 1: Question label + Palette toggle (mobile) / badges+lang (desktop) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-blue-900 text-sm whitespace-nowrap">Question {currentDisplayNum}</span>
                {q.subject && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium truncate">{q.subject}</span>}
              </div>
              {/* Desktop: marks + neg + language */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-semibold">+{quiz.eachMarks ?? 2} Marks</span>
                {quiz.negativeMarking && (
                  <span className="px-2 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded text-xs font-semibold">−{quiz.negativeValue} Neg</span>
                )}
                <button
                  onClick={() => setLanguage(l => l === "en" ? "hi" : "en")}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {language === "en" ? "हिंदी" : "English"}
                </button>
              </div>
              {/* Mobile: palette toggle only */}
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="lg:hidden shrink-0 px-2.5 py-1 bg-indigo-900 text-white rounded text-xs font-bold flex items-center gap-1"
                title="Toggle palette"
              >
                📋 {sidebarOpen ? "✕" : "Palette"}
              </button>
            </div>
            {/* Row 2 (mobile only): marks + neg + language */}
            <div className="flex lg:hidden items-center gap-2 mt-1.5 flex-wrap">
              <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs font-semibold">+{quiz.eachMarks ?? 2} Marks</span>
              {quiz.negativeMarking && (
                <span className="px-2 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded text-xs font-semibold">−{quiz.negativeValue} Neg</span>
              )}
              <button
                onClick={() => setLanguage(l => l === "en" ? "hi" : "en")}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                {language === "en" ? "हिंदी" : "English"}
              </button>
            </div>
          </div>

          {/* Question Body — only this area scrolls */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {(q.type === "text" || q.type === "mixed" || !q.type) && (
              <div className="mb-5 text-gray-800 text-sm leading-relaxed">
                <RichTextBlockRenderer content={language === "hi" && q.questionHi ? q.questionHi : q.question} />
              </div>
            )}
            {language === "hi" && !q.questionHi && (
              <p className="text-xs text-gray-400 mb-3">[Hindi translation not available]</p>
            )}
            {(q.type === "image" || q.type === "mixed") && q.questionImage && (
              <img src={q.questionImage} alt={`Question ${currentDisplayNum}`} className="max-w-full rounded mb-4 border" />
            )}
            {q.answerType === "descriptive" ? (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type your answer here..."
                value={answers[current] ?? ""}
                onChange={e => handleSelect(e.target.value)}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {(q.options || []).map((opt, i) => {
                  const val = String(i);
                  const isMultiple = q.answerType === "multiple";
                  const checked = isMultiple
                    ? Array.isArray(answers[current]) && answers[current].includes(val)
                    : String(answers[current]) === val;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all select-none ${checked ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
                    >
                      <input
                        type={isMultiple ? "checkbox" : "radio"}
                        name={`q${current}`}
                        className="sr-only"
                        checked={checked}
                        onChange={() => handleSelect(val)}
                      />
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${checked ? "bg-blue-600 text-white" : "bg-indigo-900 text-white"}`}>
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-sm text-gray-700">
                        {(language === "hi" && q.optionsHi?.[i]?.text) ? q.optionsHi[i].text : (opt.text || `Option ${i + 1}`)}
                      </span>
                      {opt.image && <img src={opt.image} alt={`Option ${i + 1}`} className="h-12 ml-2 rounded" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Nav */}
          <div className="flex-shrink-0 border-t border-gray-100 px-3 py-2.5 bg-gray-50">
            {/* Mobile: 2×2 grid */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <button
                onClick={handlePrev}
                disabled={currentDisplayNum === 1}
                className="py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleClear}
                disabled={Array.isArray(answers[current]) ? answers[current].length === 0 : answers[current] === null}
                className="py-2 border-2 border-red-400 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleMarkForReview}
                className={`py-2 rounded-lg text-xs font-semibold border-2 transition-colors ${markedForReview[current] ? "border-purple-600 bg-purple-600 text-white" : "border-purple-600 text-purple-600 hover:bg-purple-50"}`}
              >
                {markedForReview[current] ? "★ Marked" : "☆ Review"}
              </button>
              <button
                onClick={handleSaveAndNext}
                disabled={current === lastRealQIdx || isAtSectionEnd}
                title={isAtSectionEnd ? "Use 'Submit Section' to proceed" : ""}
                className="py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save & Next →
              </button>
            </div>
            {/* Desktop (sm+): single row */}
            <div className="hidden sm:flex items-center justify-between gap-2">
              <button
                onClick={handlePrev}
                disabled={currentDisplayNum === 1}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleClear}
                disabled={Array.isArray(answers[current]) ? answers[current].length === 0 : answers[current] === null}
                className="px-4 py-2 border-2 border-red-400 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Clear Response
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkForReview}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${markedForReview[current] ? "border-purple-600 bg-purple-600 text-white" : "border-purple-600 text-purple-600 hover:bg-purple-50"}`}
                >
                  {markedForReview[current] ? "★ Marked" : "☆ Mark for Review"}
                </button>
                <button
                  onClick={handleSaveAndNext}
                  disabled={current === lastRealQIdx || isAtSectionEnd}
                  title={isAtSectionEnd ? "Use 'Submit Section' to proceed" : ""}
                  className="px-5 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Save & Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar — static on desktop, overlay drawer on mobile */}
        <div className={`flex-shrink-0 flex flex-col gap-2 overflow-y-auto transition-transform duration-300 absolute right-0 top-0 bottom-0 w-72 bg-slate-100 z-30 p-2 shadow-2xl lg:relative lg:w-60 lg:min-h-0 lg:shadow-none lg:p-0 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>

          {/* Mobile close row */}
          <div className="lg:hidden flex items-center justify-between mb-1 px-1">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Palette & Timer</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 flex items-center justify-center bg-indigo-900 text-white rounded-full text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Time Card */}
          <div className={`flex-shrink-0 rounded-xl p-3 text-center text-white shadow ${timeLeft < 300 ? "bg-red-700" : "bg-indigo-900"}`}>
            {/* Global Timer */}
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Time Remaining</div>
            <div className="text-3xl font-bold tabular-nums">{formatTime(timeLeft || 0)}</div>
            {timeLeft < 300 && <div className="text-xs mt-1 animate-pulse">⚠ Less than 5 min!</div>}

            {/* Sectional Timer - Check if section exists and has sectionTime */}
            {sections && sections.length > 0 && sections[currentSectionIdx] && (
              sections[currentSectionIdx].sectionTime > 0 ? (
                <>
                  <div className="mx-auto my-3 h-px w-3/4 bg-white/30" />
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Sectional Time</div>
                  <div className="text-xs font-medium opacity-75 mb-2">{sections[currentSectionIdx]?.name || "Current Section"}</div>
                  {sectionTimeLeft > 0
                    ? <div className="text-2xl font-bold tabular-nums">{formatTime(sectionTimeLeft || 0)}</div>
                    : <div className="text-sm font-bold text-red-200">Time over</div>
                  }
                </>
              ) : null
            )}
          </div>

          {/* Palette */}
          <div className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <div className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wide">
              Question Palette
              {sections[currentSectionIdx] && <span className="text-blue-600"> — {sections[currentSectionIdx].name}</span>}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(sections[currentSectionIdx]?.questionIndices ??
                quiz.questions.map((_, i) => i).filter(i => quiz.questions[i].type !== "section")
              ).map((realIdx, relPos) => {
                const isAnswered = Array.isArray(answers[realIdx]) ? answers[realIdx].length > 0 : answers[realIdx] !== null;
                const isCurrent = realIdx === current;
                const isReview = !!markedForReview[realIdx];
                const isVisitedOnly = visited[realIdx] && !isAnswered && !isCurrent && !isReview;
                const secIdxForQ = sectionsRef.current.findIndex(s => s.questionIndices.includes(realIdx));
                const isLocked = secIdxForQ >= 0 && lockedSections.has(secIdxForQ);

                let btnCls = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ";
                if (isLocked)                    btnCls += "bg-gray-200 text-gray-400 cursor-not-allowed";
                else if (isAnswered && isReview) btnCls += "bg-purple-500 text-white";
                else if (isAnswered)             btnCls += "bg-green-500 text-white";
                else if (isReview)               btnCls += "bg-purple-400 text-white";
                else if (isVisitedOnly)          btnCls += "border-2 border-red-400 text-red-500 bg-white";
                else                             btnCls += "bg-gray-100 text-gray-500 border border-gray-300";

                return (
                  <button
                    key={realIdx}
                    onClick={() => navigateTo(realIdx)}
                    disabled={isLocked}
                    title={isLocked ? "Section locked" : `Q${relPos + 1}`}
                    className={btnCls}
                  >
                    {relPos + 1}{isReview ? "★" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <div className="flex flex-col gap-1.5">
              {[
                { color: "bg-green-500", label: "Answered" },
                { color: "bg-purple-500", label: "Answered & Marked" },
                { color: "bg-purple-400", label: "Marked for Review" },
                { color: "border-2 border-red-400 bg-white", label: "Not Answered" },
                { color: "bg-gray-100 border border-gray-300", label: "Not Visited" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex justify-around text-center">
            <div>
              <div className="text-xl font-bold text-green-600">{answeredCount}</div>
              <div className="text-xs text-gray-500">Answered</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <div className="text-xl font-bold text-gray-700">{total - answeredCount}</div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>

          {/* Submit Section (autoLock ON, multiple sections, current not locked) */}
          {quizAutoLock && sections.length > 1 && !lockedSections.has(currentSectionIdx) && (
            <button
              onClick={handleSubmitSection}
              disabled={sectionTransitioning}
              className="flex-shrink-0 w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors shadow"
            >
              Submit Section →
            </button>
          )}

          {/* Final Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="flex-shrink-0 w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors shadow"
          >
            Final Submit
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-full">
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-center mb-4">Submit Exam?</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Total", val: total, cls: "text-gray-700" },
                { label: "Answered", val: answeredCount, cls: "text-green-600" },
                { label: "For Review", val: reviewCount, cls: "text-purple-600" },
                { label: "Not Answered", val: total - answeredCount, cls: "text-red-600" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${cls}`}>{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">Once submitted, you cannot change your answers.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { if (violationCount < 4) setShowConfirm(false); }}
                disabled={violationCount >= 4}
                className="flex-1 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section transition overlay */}
      {sectionTransitioning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-3">🔒</div>
            <h3 className="text-lg font-bold mb-2">
              {sectionSubmitReason === "manual" ? "Section Submitted" : "Section Time Over"}
            </h3>
            <p className="text-gray-500 text-sm">This section is now locked. Moving to next section...</p>
          </div>
        </div>
      )}

      {/* Violation toast */}
      {showViolation && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
          ⚠ Tab switch detected ({violationCount}/4)
        </div>
      )}

      {showFeedbackModal && pendingResult && (
        <FeedbackModal
          quizId={pendingResult.quizId}
          quizTitle={pendingResult.sectionTitle}
          userEmail={user?.email}
          userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
}

export default MockTest;
