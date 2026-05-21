import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { AArrowUpIcon } from "@/components/ui/a-arrow-up";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "@/assets/img/transperent logo.png";
import RichTextBlockRenderer from "@/common/components/RichTextBlocks";
import FeedbackModal from "@/common/components/FeedbackModal";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/context/AuthContext";
import "@/styles/result.css";

/* ── helpers ─────────────────────────────────────────────────────── */
function getQuestionStatus({ userAnswer, correctAnswer, answerType }) {
  const empty =
    userAnswer === null || userAnswer === undefined || userAnswer === "" ||
    (Array.isArray(userAnswer) && userAnswer.length === 0);
  if (empty) return "skipped";
  if (answerType === "multiple") {
    const sel = (Array.isArray(userAnswer) ? userAnswer : []).map(String).sort();
    const cor = (Array.isArray(correctAnswer) ? correctAnswer : [String(correctAnswer)]).map(String).sort();
    return sel.length === cor.length && sel.every((v, i) => v === cor[i]) ? "correct" : "wrong";
  }
  if (answerType === "descriptive") {
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer ?? "").trim().toLowerCase()
      ? "correct" : "wrong";
  }
  return String(userAnswer) === String(correctAnswer) ? "correct" : "wrong";
}

function fmtSecs(s) {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60), sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

function getInitials(str) {
  if (!str) return "S";
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str.slice(0, 2).toUpperCase();
}

/* ── SVG icons ───────────────────────────────────────────────────── */
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75"/>
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.75"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2v8M4 7l3.5 3.5L11 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12h11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="9" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="6" y="6" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M10 7.5H5M5 7.5L7.5 5M5 7.5L7.5 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 9c-2.2 0-4-1.8-4-4V2h8v3c0 2.2-1.8 4-4 4z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 10.5h5M7 9v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 4H1.5a1 1 0 010-2H3M11 4h1.5a1 1 0 000-2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 1h8l1 2-1 2H3L2 3l1-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M3 5v8M11 5v8M3 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 8h4M5 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconFileCheck = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M13 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-5-7z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
    <path d="M13 2v7h7" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
    <path d="M8 14l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 6h12M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconListCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 9l1 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 5h4v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L1 14h14L8 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
    <path d="M8 6v4M8 11.5v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const IconClockOutline = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M8 4.5v4l2.5 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCircleX = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCircleMinus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 3V2.5A1.5 1.5 0 018.5 2.5V3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconMedal = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 5.5L3 1h8l-1.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M5 1.5l2 2.5M9 1.5L7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* ── Score ring ──────────────────────────────────────────────────── */
function ScoreRing({ pct, passed }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  return (
    <div className="rp-ring-wrap">
      <svg viewBox="0 0 120 120" className="rp-ring-svg">
        <defs>
          <linearGradient id="rg-pass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8c38" />
            <stop offset="100%" stopColor="#ff6b00" />
          </linearGradient>
          <linearGradient id="rg-fail" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <circle className="rp-ring-bg" cx="60" cy="60" r={r} />
        <circle
          className="rp-ring-fg"
          cx="60" cy="60" r={r}
          stroke={passed ? "url(#rg-pass)" : "url(#rg-fail)"}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="rp-ring-inner">
        <span className="rp-ring-pct">{pct}%</span>
        <span className="rp-ring-sub">Score</span>
      </div>
    </div>
  );
}

/* ── Answer Review page ──────────────────────────────────────────── */
function AnswerReview({ breakdown, language, onBack, sectionTitle, correct, wrong, skipped, solutionPdfUrl }) {
  const [filter, setFilter] = useState("all");
  const [pdfFailed, setPdfFailed] = useState(false);
  const isHi = language === "hi";
  const filtered = breakdown.filter(item => filter === "all" || getQuestionStatus(item) === filter);

  const questionsList = (
    <div className="rp-review-body">
      {filtered.length === 0 && <p className="rp-review-empty">No questions match this filter.</p>}
      {filtered.map((item, i) => {
        const status = getQuestionStatus(item);
        const qText = isHi && item.questionHi ? item.questionHi : item.question;
        const { answerType, options, optionsHi, correctAnswer, userAnswer } = item;
        const origIdx = breakdown.indexOf(item);
        return (
          <div key={item._id ?? origIdx} className={`rp-qcard rp-qcard-${status}`}>
            <div className="rp-qcard-header">
              <div className="rp-qcard-num">Q{origIdx + 1}</div>
              <span className={`rp-qcard-badge badge-${status}`}>
                {status === "correct" ? "Correct" : status === "wrong" ? "Incorrect" : "Skipped"}
              </span>
              {item.flagged && <span className="rp-qcard-flagged">Flagged</span>}
            </div>
            <div className="rp-qcard-text"><RichTextBlockRenderer content={qText} /></div>
            {item.questionImage && <img className="rp-qcard-img" src={item.questionImage} alt="" />}

            {answerType === "descriptive" ? (
              <div className="rp-qcard-desc">
                <div className="rp-qcard-desc-row">
                  <span className="rp-desc-label">Your answer</span>
                  <span className="rp-desc-value">{userAnswer || <em>No answer given</em>}</span>
                </div>
                <div className="rp-qcard-desc-row">
                  <span className="rp-desc-label">Correct answer</span>
                  <span className="rp-desc-value rp-desc-correct">{correctAnswer}</span>
                </div>
              </div>
            ) : (
              <div className="rp-qcard-options">
                {(options || []).map((opt, oi) => {
                  const text = (isHi && optionsHi?.[oi]?.text) ? optionsHi[oi].text : (typeof opt === "string" ? opt : opt.text);
                  const img = typeof opt === "object" ? opt.image : null;
                  const si = String(oi);
                  const isCorrect = answerType === "multiple"
                    ? Array.isArray(correctAnswer) && correctAnswer.map(String).includes(si)
                    : String(correctAnswer) === si;
                  const isUser = answerType === "multiple"
                    ? Array.isArray(userAnswer) && userAnswer.map(String).includes(si)
                    : String(userAnswer) === si;
                  return (
                    <div key={oi} className={`rp-option ${isCorrect ? "opt-correct" : isUser ? "opt-wrong" : "opt-neutral"}`}>
                      <span className="rp-option-letter">{String.fromCharCode(65 + oi)}</span>
                      <span className="rp-option-text">{text}</span>
                      {img && <img className="rp-option-img" src={img} alt="" />}
                      {isCorrect && <span className="rp-opt-mark correct">✓</span>}
                      {isUser && !isCorrect && <span className="rp-opt-mark wrong">✗</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="rp-review">
      <div className="rp-review-topbar">
        <button className="rp-review-back" onClick={onBack}>
          <IconChevronLeft /> Back
        </button>
        <div className="rp-review-titlegroup">
          <span className="rp-review-title">{sectionTitle}</span>
          <span className="rp-review-subtitle">Answer Review</span>
        </div>
        <div className="rp-review-filters">
          <IconFilter />
          {[
            { key: "all",     label: `All (${breakdown.length})` },
            { key: "correct", label: `Correct (${correct})` },
            { key: "wrong",   label: `Wrong (${wrong})` },
            { key: "skipped", label: `Skipped (${skipped})` },
          ].map(f => (
            <button key={f.key} className={`rp-filter ${filter === f.key ? `active-${f.key}` : ""}`}
              onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="rp-review-split">
        <div className="rp-review-split-questions">{questionsList}</div>
        <div className="rp-review-split-pdf">

          {/* PDF panel header */}
          <div className="rp-pdf-header">
            <div className="rp-pdf-header-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M8 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="rp-pdf-header-text">
              <span className="rp-pdf-header-title">Solution PDF</span>
              <span className="rp-pdf-header-sub">Official Answer Key</span>
            </div>
            {solutionPdfUrl && (
              <a href={solutionPdfUrl} target="_blank" rel="noreferrer" className="rp-pdf-open-btn">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 9L9 2M9 2H5M9 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Open
              </a>
            )}
          </div>

          {/* PDF content */}
          {solutionPdfUrl ? (
            <div className="rp-pdf-iframe-wrap">
              {pdfFailed ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: 24 }}>
                  <p style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>PDF preview unavailable in this browser.</p>
                  <a href={solutionPdfUrl} target="_blank" rel="noreferrer"
                    style={{ padding: "10px 20px", background: "#f77f00", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <iframe
                  src={solutionPdfUrl}
                  title="Solution PDF"
                  className="rp-pdf-iframe"
                  onError={() => setPdfFailed(true)}
                />
              )}
            </div>
          ) : (
            <div className="rp-pdf-empty">
              <div className="rp-pdf-empty-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M19 4H8a2 2 0 00-2 2v20a2 2 0 002 2h16a2 2 0 002-2V12L19 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M19 4v8h8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M11 18h10M11 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="rp-pdf-empty-title">No solution uploaded</p>
              <p className="rp-pdf-empty-sub">The admin hasn't added an answer key for this quiz yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Section icons map ───────────────────────────────────────────── */
const SECTION_ICONS = {
  "quantitative": <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2v10M4 4l6 6M10 4L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  "english": <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h6M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  "reasoning": <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 5v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  "general": <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 7a3 3 0 006 0M7 1.5V4M7 10v2.5M1.5 7H4M10 7h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

function getSectionIcon(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

/* ── Main Result page ────────────────────────────────────────────── */
export default function Result() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [showReview, setShowReview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fetchedPdfUrl, setFetchedPdfUrl] = useState(null);
  const [fetchedRank, setFetchedRank] = useState(null);
  const [fetchedTotalUsers, setFetchedTotalUsers] = useState(null);
  const [fetchedPercentile, setFetchedPercentile] = useState(null);
  const reportRef = useRef(null);

  const state = location.state;
  const quizId         = state?.quizId ?? null;
  const solutionPdfUrl = state?.solutionPdfUrl ?? null;
  const stateRank      = state?.rank      ?? null;
  const stateTotalUsers = state?.totalUsers ?? null;
  const statePercentile = state?.percentile ?? null;

  /* Fetch PDF URL from DB if missing from state (admin added it after submission) */
  useEffect(() => {
    if (solutionPdfUrl || !quizId) return;
    fetch(`${BASE_URL}/quiz/${quizId}/solution-pdf`)
      .then(r => r.json())
      .then(d => { if (d.success && d.solutionPdfUrl) setFetchedPdfUrl(d.solutionPdfUrl); })
      .catch(() => {});
  }, [quizId, solutionPdfUrl]);

  /* Fetch rank/percentile from DB when missing from state (old localStorage entries, refresh, etc.) */
  useEffect(() => {
    const needsRank = stateRank === null;
    const needsPercentile = statePercentile === null;
    if ((!needsRank && !needsPercentile) || !quizId) return;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${BASE_URL}/quiz/${quizId}/my-rank`, { credentials: "include", headers })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          if (needsRank) {
            setFetchedRank(d.rank);
            setFetchedTotalUsers(d.totalUsers);
          }
          if (needsPercentile && d.percentile != null) {
            setFetchedPercentile(d.percentile);
          }
        }
      })
      .catch(() => {});
  }, [quizId, stateRank, statePercentile]);

  const score = state?.score;
  if (!score) return <Navigate to="/tests" replace />;

  const isAdminTest = state?.isAdminTest;
  const feedbackEnabled = state?.feedbackEnabled !== false;

  // Feedback is now shown before navigating here (in TestQuiz), so no auto-show needed.

  const obtained      = score.obtained  ?? 0;
  const total         = score.total     ?? 0;
  const correct       = score.correct   ?? 0;
  const wrong         = score.wrong     ?? 0;
  const skipped       = score.skipped   ?? 0;
  const negative      = Number(score.negative ?? 0);
  const title         = state.sectionTitle ?? "Quiz";
  const breakdown     = state.breakdown    ?? [];
  const language      = state.language     ?? "en";
  const sectionStats  = state.sectionStats ?? [];
  const rank          = stateRank      ?? fetchedRank;
  const totalUsers    = stateTotalUsers ?? fetchedTotalUsers;
  const rankInsight   = state.rankInsight  ?? null;
  const endsAt          = state.endsAt ?? null;
  const quizEnded       = !quizId || (endsAt !== null && new Date() >= new Date(endsAt));

  const effectivePdfUrl = solutionPdfUrl || fetchedPdfUrl;

  const pct       = total > 0 ? Math.max(0, Number(((obtained / total) * 100).toFixed(1))) : 0;
  const passed    = pct >= 40;
  const totalQ    = correct + wrong + skipped;
  const accuracy  = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
  const rankNumber = Number(rank ?? 0);
  const attemptedUsers = Number(totalUsers ?? 0);
  // Use server-calculated percentile (students scoring strictly less / total * 100)
  const rawPercentile = statePercentile ?? fetchedPercentile;
  const percentile = rawPercentile != null && isFinite(rawPercentile)
    ? Math.max(0, Math.min(100, rawPercentile))
    : null;
  const dateStr   = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), []);

  /* total time from section stats */
  const totalTimeSecs = sectionStats.reduce((sum, s) => sum + (s.timeUsed || 0), 0);
  const totalAllocMin = sectionStats.reduce((sum, s) => sum + (s.sectionTime || 0), 0);
  const timeTakenMin  = totalTimeSecs > 0 ? Math.floor(totalTimeSecs / 60) : null;
  const timeSavedMin  = totalAllocMin > 0 && timeTakenMin !== null ? totalAllocMin - timeTakenMin : null;

  const userName  = user?.name || user?.email || "Student";
  const initials  = getInitials(userName);

  /* per-section computed stats */
  const computedSections = sectionStats.map(sec => {
    const bd  = (sec.breakdownIndices || []).map(bi => breakdown[bi]).filter(Boolean);
    const sc  = bd.filter(x => getQuestionStatus(x) === "correct").length;
    const sw  = bd.filter(x => getQuestionStatus(x) === "wrong").length;
    const ss  = bd.filter(x => getQuestionStatus(x) === "skipped").length;
    const acc = bd.length > 0 ? Math.round((sc / bd.length) * 100) : 0;
    const pts = sc * 1 - sw * 0.5;
    const maxPts = bd.length;
    return { ...sec, sc, sw, ss, acc, pts: Math.max(0, pts), maxPts };
  });

  /* when sectionStats absent, show single row for the quiz */
  const tableRows = computedSections.length > 0 ? computedSections : [{
    name: title, sc: correct, sw: wrong, ss: skipped,
    acc: accuracy, pts: Math.max(0, obtained), maxPts: total,
    sectionTime: 0, timeUsed: totalTimeSecs,
  }];

  /* insights */
  const insightWin = skipped === 0
    ? { title: "You attempted every question", body: "0 skipped — strong test-taking confidence. Keep this habit for full-length mocks." }
    : { title: `${correct} questions answered correctly`, body: `${skipped} question${skipped > 1 ? "s" : ""} skipped. Try to attempt all for a higher score.` };

  const insightWork = wrong > 0
    ? { title: `${wrong} wrong answer${wrong > 1 ? "s" : ""} cost you ${negative > 0 ? negative : (wrong * 0.5).toFixed(1)} marks`, body: "Review your incorrect questions in the analysis section to identify weak topics." }
    : { title: "No negative marks this round", body: "Excellent precision — every question you attempted was correct. Maintain this accuracy." };

  const insightTime = timeSavedMin !== null && timeSavedMin > 0
    ? { title: `You finished ${timeSavedMin} min${timeSavedMin > 1 ? "s" : ""} early`, body: "Use spare time to review flagged questions and verify your answers before submitting." }
    : timeTakenMin !== null
    ? { title: `Time used: ${timeTakenMin} min`, body: "Review your pacing in the analysis to see where you spent the most time." }
    : { title: "Review your answers in Analysis", body: "Use the View Analysis button to see question-by-question performance and time spent." };

  /* PDF */
  const handlePdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#fff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const iw = pw - 16, ih = (canvas.height * iw) / canvas.width;
      pdf.addImage(img, "PNG", 8, ih < ph - 16 ? (ph - ih) / 2 : 8, iw, Math.min(ih, ph - 16));
      pdf.save(`${title.replace(/\s+/g, "_")}_result.pdf`);
    } finally { setDownloading(false); }
  };

  if (showReview) {
    return (
      <AnswerReview breakdown={breakdown} language={language} onBack={() => setShowReview(false)}
        sectionTitle={title} correct={correct} wrong={wrong} skipped={skipped} solutionPdfUrl={effectivePdfUrl} />
    );
  }

  return (
    <div className="rp">

      {/* Feedback Modal */}
      {showFeedback && quizId && user?.email && (
        <FeedbackModal
          quizId={quizId}
          quizTitle={title}
          userEmail={user.email}
          userName={userName}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* ── Hidden PDF card ── */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "794px" }}>
        <div ref={reportRef} className="rc-wrap">
          <div className="rc-header">
            <img src={logo} alt="SSC Pathnirman" className="rc-logo" />
            <div className="rc-header-text">
              <div className="rc-org-name">SSC Pathnirman</div>
              <div className="rc-org-tagline">Your Complete SSC Success Partner</div>
            </div>
            <div className={`rc-status-stamp ${passed ? "pass" : "fail"}`}>{passed ? "PASSED" : "FAILED"}</div>
          </div>
          <div className="rc-contact-bar">
            <span>📞 +91 97995 00688</span>
            <span>✉ sscinstitutepathnirman@gmail.com</span>
            <span>🌐 www.sscpathnirman.com</span>
          </div>
          <div className="rc-divider" />
          <div className="rc-title-row"><span className="rc-title">Performance Report Card</span></div>
          <div className="rc-info-grid">
            <div className="rc-info-cell"><span className="rc-info-label">Student</span><span className="rc-info-value">{user?.email ?? "—"}</span></div>
            <div className="rc-info-cell"><span className="rc-info-label">Test</span><span className="rc-info-value">{title}</span></div>
            <div className="rc-info-cell"><span className="rc-info-label">Date</span><span className="rc-info-value">{dateStr}</span></div>
            <div className="rc-info-cell"><span className="rc-info-label">Result</span><span className={`rc-info-value ${passed ? "rc-pass-text" : "rc-fail-text"}`}>{passed ? "PASSED" : "FAILED"}</span></div>
          </div>
          <div className="rc-divider" />
          <div className="rc-score-hero">
            <div className="rc-score-circle"><span className="rc-score-num">{obtained}</span><span className="rc-score-denom">/ {total}</span></div>
            <div className="rc-score-right">
              <div className="rc-pct-label">{pct}%</div>
              <div className="rc-pct-sub">Overall Score</div>
              <div className="rc-bar-wrap"><div className={`rc-bar-fill ${passed ? "pass" : "fail"}`} style={{ width: `${pct}%` }} /></div>
              <div className="rc-pass-mark">Passing Mark: 40%</div>
            </div>
          </div>
          <div className="rc-divider" />
          <table className="rc-table">
            <thead><tr><th>Category</th><th>Value</th><th>Remarks</th></tr></thead>
            <tbody>
              <tr className="rc-row-correct"><td>Correct</td><td>{correct}</td><td>Full marks</td></tr>
              <tr className="rc-row-wrong"><td>Wrong</td><td>{wrong}</td><td>Negative applied</td></tr>
              <tr className="rc-row-skipped"><td>Skipped</td><td>{skipped}</td><td>No deduction</td></tr>
              <tr className="rc-row-obtained"><td>Marks Obtained</td><td>{obtained}</td><td>After negative</td></tr>
              <tr><td>Total Marks</td><td>{total}</td><td>Full paper</td></tr>
              <tr className="rc-row-wrong"><td>Negative Deducted</td><td>{negative > 0 ? `-${negative}` : 0}</td><td>Wrong answers</td></tr>
            </tbody>
          </table>
          <div className="rc-footer"><span>SSC Pathnirman — sscinstitutepathnirman@gmail.com</span><span>{dateStr}</span></div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="rp-nav">
        <div className="rp-nav-left">
          <div className="rp-nav-logo">
            <img src={logo} alt="SSC Pathnirman" />
          </div>
          <div className="rp-nav-crumb">
            <span className="rp-nav-crumb-link" onClick={() => navigate("/tests")}>Tests</span>
            <span className="rp-nav-sep">/</span>
            <span className="rp-nav-crumb-link" onClick={() => navigate("/tests")}>{title}</span>
            <span className="rp-nav-sep">/</span>
            <span className="rp-nav-crumb-current">Result</span>
          </div>
        </div>
        <div className="rp-nav-right">
          <div className="rp-nav-user-card">
            <span className="rp-nav-avatar">{initials}</span>
            <div className="rp-nav-user-info">
              <span className="rp-nav-name">{userName}</span>
              <span className="rp-nav-email">{user?.email || "student@email.com"}</span>
              <span className="rp-nav-role">SSC CGL Student</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="rp-page">

        {/* ── Page header ── */}
        <header className="rp-header">
          <div className="rp-h-left">
            <div className="rp-h-icon"><IconFileCheck /></div>
            <div>
              <div className="rp-h-eyebrow">Result · Mock Test</div>
              <h1 className="rp-h-title">{title}</h1>
              <div className="rp-h-sub">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconCalendar style={{ color: "var(--rp-orange)" }} /> {dateStr}
                </span>
                <span className="rp-h-sub-dot" />
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconListCheck style={{ color: "var(--rp-orange)" }} /> {totalQ} questions
                </span>
                {totalTimeSecs > 0 && (
                  <>
                    <span className="rp-h-sub-dot" />
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <IconClock style={{ color: "var(--rp-orange)" }} /> {fmtSecs(totalTimeSecs)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className={`rp-status-pill ${passed ? "pass" : "fail"}`}>
            <span className="rp-status-dot" />
            {passed ? "Passed with merit" : "Not qualified"}
          </span>
        </header>

        {/* ── Hero: score card + metric grid ── */}
        <section className="rp-hero">

          {/* Score card */}
          <div className="rp-score-card">
            <div className="rp-tricolor" />
            <div className="rp-sc-head">
              <div className="rp-sc-eyebrow">Overall Performance</div>
              <div className={`rp-sc-status ${passed ? "pass" : "fail"}`}>
                {passed ? "Qualified" : "Below cut-off"}
              </div>
            </div>
            <div className="rp-sc-grid">
              <ScoreRing pct={pct} passed={passed} />
              <div className="rp-sc-side">
                <div className="rp-sc-kicker">Final Score</div>
                <div className="rp-sc-final">
                  <span className="rp-sc-big">{obtained}</span>
                  <span className="rp-sc-denom">/ {total}</span>
                </div>
                <div className="rp-sc-label">Final Score · After Negative</div>
                <div className="rp-sc-bar-meta">
                  <span>Progress</span>
                  <b>{pct}%</b>
                </div>
                <div className="rp-sc-bar">
                  <div className={`rp-sc-bar-fill${passed ? "" : " fail"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="rp-sc-passmark">
                  <span>Passing mark <b>40%</b></span>
                  <span>You scored <b>{pct}%</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="rp-metrics-grid">
            <div className="rp-metric-card green">
              <div className="rp-mc-top">
                <span className="rp-mc-icon"><IconCheck /></span>
                <span className="rp-mc-chip pos">+{correct} marks</span>
              </div>
              <div className="rp-mc-val">{correct}</div>
              <div className="rp-mc-lbl">Correct Answers</div>
            </div>

            <div className="rp-metric-card red">
              <div className="rp-mc-top">
                <span className="rp-mc-icon"><IconX /></span>
                <span className="rp-mc-chip neg">−{negative > 0 ? negative : (wrong * 0.5).toFixed(1)} marks</span>
              </div>
              <div className="rp-mc-val">{wrong}</div>
              <div className="rp-mc-lbl">Wrong Answers</div>
            </div>

            <div className="rp-metric-card blue">
              <div className="rp-mc-top">
                <span className="rp-mc-icon"><IconTarget /></span>
                <span className="rp-mc-chip neu">{correct} of {totalQ}</span>
              </div>
              <div className="rp-mc-val">{accuracy}%</div>
              <div className="rp-mc-lbl">Accuracy</div>
            </div>

            <div className="rp-metric-card orange">
              <div className="rp-mc-top">
                <span className="rp-mc-icon"><IconClock /></span>
                <span className="rp-mc-chip org">{timeTakenMin !== null ? `${timeTakenMin} min` : `${skipped} skipped`}</span>
              </div>
              <div className="rp-mc-val">
                {timeTakenMin !== null
                  ? <>{timeTakenMin}<span className="small"> min</span></>
                  : <>{skipped}<span className="small"> skip</span></>}
              </div>
              <div className="rp-mc-lbl">{timeTakenMin !== null ? "Time Taken" : "Skipped"}</div>
            </div>

            <div className="rp-metric-card violet">
              <div className="rp-mc-top">
                <span className="rp-mc-icon">
                  <AArrowUpIcon size={16} style={{color:"#7c3aed",display:"inline-flex"}} />
                </span>
                <span className="rp-mc-chip">{pct}%</span>
              </div>
              <div className="rp-mc-val">{pct}<span className="small">%</span></div>
              <div className="rp-mc-lbl">Percentage</div>
            </div>

            <div className="rp-metric-card teal">
              <div className="rp-mc-top">
                <span className="rp-mc-icon">
                  <IconTrendUp />
                </span>
                <span className="rp-mc-chip">
                  {rank && totalUsers ? `Rank ${rank}/${totalUsers}` : "N/A"}
                </span>
              </div>
              <div className="rp-mc-val">
                {percentile !== null
                  ? <>{percentile}<span className="small">%ile</span></>
                  : <span style={{fontSize:"22px"}}>—</span>}
              </div>
              <div className="rp-mc-lbl">Percentile</div>
            </div>
          </div>

        </section>

        {/* ── Main grid: table + sidebar ── */}
        <section className="rp-main-grid">

          {/* Section performance table */}
          <div className="rp-card" style={{ borderLeft: "4px solid var(--rp-orange)", overflow: "hidden" }}>
            <div className="rp-card-head">
              <h3>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--rp-orange)" }}>
                  <rect x="1" y="7" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="5.5" y="4" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="10" y="1" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Section Performance
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="rp-sec-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Skipped</th>
                    <th>Accuracy</th>
                    <th style={{ textAlign: "right" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((sec, i) => (
                    <tr key={sec._id ?? sec.name ?? i}>
                      <td>
                        <div className="rp-sec-name">
                          <span className="rp-sec-dot">{getSectionIcon(sec.name)}</span>
                          <div>
                            <span className="rp-sec-title">{sec.name}</span>
                            <span className="rp-sec-sub">
                              {sec.maxPts > 0 ? `${sec.maxPts} questions` : ""}
                              {sec.sectionTime > 0 ? ` · ${sec.sectionTime}m allotted` : ""}
                              {sec.timeUsed > 0 ? ` · ${fmtSecs(sec.timeUsed)} used` : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td><span className="rp-pill g">{sec.sc}</span></td>
                      <td><span className="rp-pill r">{sec.sw}</span></td>
                      <td><span className="rp-pill m">{sec.ss}</span></td>
                      <td>
                        <div className="rp-progress-cell">
                          <div className="rp-progress-bar">
                            <div className="rp-progress-fill" style={{ width: `${sec.acc}%` }} />
                          </div>
                          <span className="rp-progress-text">{sec.acc}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--rp-text-primary)" }}>
                        {sec.pts > 0 ? Number.isInteger(sec.pts) ? sec.pts : sec.pts.toFixed(1) : 0}
                        <span style={{ color: "var(--rp-text-muted)", fontWeight: 600, fontSize: 12 }}> / {sec.maxPts}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="rp-sidebar">

            {/* Leaderboard rank */}
            {rank !== null && (
              <div className="rp-rank-card">
                <div className="rp-rank-head"><IconTrophy /> Leaderboard Rank</div>
                <div className="rp-rank-value">
                  #{rank}
                  <span className="rp-rank-of">of {totalUsers ?? "—"}</span>
                </div>
                {rankInsight && (
                  <div className="rp-rank-insight">
                    <IconMedal style={{ color: "var(--rp-orange)", flexShrink: 0 }} />
                    {rankInsight}
                  </div>
                )}
                {!rankInsight && totalUsers === 1 && (
                  <div className="rp-rank-insight">
                    <IconMedal style={{ color: "var(--rp-orange)", flexShrink: 0 }} />
                    You're first on the board. Invite peers to make it competitive.
                  </div>
                )}
              </div>
            )}

            {/* Score breakdown */}
            <div className="rp-breakdown-card">
              <h3>
                <IconReceipt style={{ color: "var(--rp-orange)" }} />
                Score Breakdown
              </h3>
              <p>How your final score was calculated.</p>
              <div className="rp-bd-list">
                <div className="rp-bd-row">
                  <span className="rp-bd-label"><IconCheckCircle style={{ color: "var(--rp-success)" }} /> Correct (×1 mark)</span>
                  <span className="rp-bd-value green">+{correct}.0</span>
                </div>
                <div className="rp-bd-row">
                  <span className="rp-bd-label"><IconCircleX style={{ color: "var(--rp-error)" }} /> Wrong (×0.5 negative)</span>
                  <span className="rp-bd-value red">−{negative > 0 ? Number(negative).toFixed(1) : (wrong * 0.5).toFixed(1)}</span>
                </div>
                <div className="rp-bd-row">
                  <span className="rp-bd-label"><IconCircleMinus style={{ color: "var(--rp-text-muted)" }} /> Skipped (no penalty)</span>
                  <span className="rp-bd-value muted">0.0</span>
                </div>
                <div className="rp-bd-row">
                  <span className="rp-bd-label"><IconClipboard style={{ color: "var(--rp-orange)" }} /> Total possible</span>
                  <span className="rp-bd-value muted">{total}.0</span>
                </div>
                <div className="rp-bd-row total">
                  <span className="rp-bd-label">Marks Obtained</span>
                  <span className="rp-bd-value">{obtained}</span>
                </div>
              </div>
            </div>

          </aside>
        </section>

        {/* ── Insights strip ── */}
        <section className="rp-insights">
          <div className="rp-insight win">
            <div className="rp-insight-icon"><IconTrendUp /></div>
            <div>
              <h4>{insightWin.title}</h4>
              <p>{insightWin.body}</p>
            </div>
          </div>
          <div className="rp-insight work">
            <div className="rp-insight-icon"><IconWarning /></div>
            <div>
              <h4>{insightWork.title}</h4>
              <p>{insightWork.body}</p>
            </div>
          </div>
          <div className="rp-insight time">
            <div className="rp-insight-icon"><IconClockOutline /></div>
            <div>
              <h4>{insightTime.title}</h4>
              <p>{insightTime.body}</p>
            </div>
          </div>
        </section>

        {/* ── Sticky action bar ── */}
        <div className="rp-action-bar">
          <div className="rp-ab-msg">
            <span className="rp-ab-check">✓</span>
            <span>Result saved to your profile. <b>Top recommendation:</b> Review wrong answers before your next attempt.</span>
          </div>
          <div className="rp-ab-actions">
            <button className="rp-btn rp-btn-ghost" onClick={() => navigate("/tests")}>
              <IconArrowLeft /> Back to Tests
            </button>
            <button className="rp-btn rp-btn-outline" onClick={handlePdf} disabled={downloading}>
              <IconDownload />
              {downloading ? "Generating…" : "Download Report"}
            </button>
            {breakdown.length > 0 && quizEnded && (
              <button className="rp-btn rp-btn-dark" onClick={() => setShowReview(true)}>
                <IconChart /> View Analysis
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
