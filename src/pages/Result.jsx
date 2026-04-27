import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/img/transperent logo.png";
import { useAuth } from "../context/AuthContext";
import "../styles/result.css";

function getQuestionStatus(item) {
  const { userAnswer, correctAnswer, answerType } = item;

  const isSkipped =
    userAnswer === null ||
    userAnswer === undefined ||
    userAnswer === "" ||
    (Array.isArray(userAnswer) && userAnswer.length === 0);

  if (isSkipped) return "skipped";

  if (answerType === "multiple") {
    const selected = Array.isArray(userAnswer)
      ? userAnswer.map(String).sort()
      : [];
    const correct = Array.isArray(correctAnswer)
      ? correctAnswer.map(String).sort()
      : [String(correctAnswer)];
    const isCorrect =
      selected.length === correct.length &&
      selected.every((v, i) => v === correct[i]);
    return isCorrect ? "correct" : "wrong";
  }

  if (answerType === "descriptive") {
    const isCorrect =
      String(userAnswer).trim().toLowerCase() ===
      String(correctAnswer ?? "").trim().toLowerCase();
    return isCorrect ? "correct" : "wrong";
  }

  return String(userAnswer) === String(correctAnswer) ? "correct" : "wrong";
}

function AnswerReview({ breakdown, language = "en" }) {
  if (!breakdown || breakdown.length === 0) return null;

  const isHi = language === "hi";

  return (
    <div className="result-review-list">
      {breakdown.map((item, idx) => {
        const qStatus = getQuestionStatus(item);
        const { answerType, options, optionsHi, correctAnswer, userAnswer } = item;

        const qText = isHi && item.questionHi ? item.questionHi : item.question;

        const isFlagged = item.flagged === true;
        const cardBorder = isFlagged ? "flagged" : qStatus === "skipped" ? "skipped" : "attempted";

        return (
          <div key={idx} className={`result-q-card card-border-${cardBorder}`}>
            <div className="result-q-header">
              <span className="result-q-num">Q{idx + 1}</span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {isFlagged && <span className="result-flagged-badge">⚑ Flagged</span>}
                <span className={`result-status-badge result-status-${qStatus}`}>
                  {qStatus === "correct" && "✓ Correct"}
                  {qStatus === "wrong" && "✗ Wrong"}
                  {qStatus === "skipped" && "— Skipped"}
                </span>
              </div>
            </div>

            <p className="result-q-text">{qText}</p>

            {item.questionImage && (
              <img
                className="result-q-image"
                src={item.questionImage}
                alt={`Question ${idx + 1}`}
              />
            )}

            {answerType === "descriptive" ? (
              <div className="result-q-descriptive">
                <div className="result-q-desc-row">
                  <span className="result-q-desc-label">Your answer:</span>
                  <span className="result-q-desc-value">
                    {userAnswer || <em>No answer given</em>}
                  </span>
                </div>
                <div className="result-q-desc-row">
                  <span className="result-q-desc-label">Correct answer:</span>
                  <span className="result-q-desc-value correct-text">
                    {correctAnswer}
                  </span>
                </div>
              </div>
            ) : (
              <div className="result-q-options">
                {(options || []).map((opt, i) => {
                  const enText = typeof opt === "string" ? opt : opt.text;
                  const hiText = optionsHi?.[i]?.text;
                  const optText = isHi && hiText ? hiText : enText;
                  const optImage = typeof opt === "object" ? opt.image : null;
                  const optIndex = String(i);

                  const isCorrectOpt =
                    answerType === "multiple"
                      ? Array.isArray(correctAnswer) &&
                        correctAnswer.map(String).includes(optIndex)
                      : String(correctAnswer) === optIndex;

                  const isUserSelected =
                    answerType === "multiple"
                      ? Array.isArray(userAnswer) &&
                        userAnswer.map(String).includes(optIndex)
                      : String(userAnswer) === optIndex;

                  const isSkippedQ = qStatus === "skipped";

                  let optClass = "result-q-option neutral";
                  if (isCorrectOpt) optClass = "result-q-option correct";
                  else if (isUserSelected && !isCorrectOpt)
                    optClass = "result-q-option wrong";

                  return (
                    <div key={i} className={optClass}>
                      <span className="result-q-opt-label">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="result-q-opt-text">{optText}</span>
                      {optImage && (
                        <img
                          className="result-q-opt-image"
                          src={optImage}
                          alt={`Option ${i + 1}`}
                        />
                      )}
                      {isCorrectOpt && isSkippedQ && (
                        <span className="result-skipped-badge">Skipped</span>
                      )}
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
}

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReview, setShowReview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportCardRef = useRef(null);

  const state = location.state;
  const score = state?.score;

  if (!score) {
    return (
      <div className="result-empty">
        <h2>No result found</h2>
        <p>Submit a quiz to see your result.</p>
        <button
          className="result-btn primary"
          style={{ maxWidth: 180 }}
          onClick={() => navigate("/tests")}
        >
          Go to Tests
        </button>
      </div>
    );
  }

  const obtained = score.obtained ?? 0;
  const total = score.total ?? 0;
  const correct = score.correct ?? 0;
  const wrong = score.wrong ?? 0;
  const skipped = score.skipped ?? 0;
  const negative = score.negative ?? 0;
  const sectionTitle = state.sectionTitle ?? "Quiz";
  const breakdown = state.breakdown ?? [];
  const language = state.language ?? "en";

  const percentage =
    total > 0 ? Math.max(0, Math.round((obtained / total) * 100)) : 0;
  const passed = percentage >= 40;
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const handleDownloadPdf = async () => {
    if (!reportCardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 16;
      const imgH = (canvas.height * imgW) / canvas.width;
      const y = imgH < pageH - 16 ? (pageH - imgH) / 2 : 8;
      pdf.addImage(imgData, "PNG", 8, y, imgW, Math.min(imgH, pageH - 16));
      pdf.save(`${sectionTitle.replace(/\s+/g, "_")}_result.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (showReview) {
    return (
      <div className="result-review-page">
        <div className="result-review-topbar">
          <button
            className="result-review-back"
            onClick={() => setShowReview(false)}
          >
            ← Back to Results
          </button>
          <div className="result-review-title">{sectionTitle} — Answer Review</div>
          <div className="result-review-stats">
            <span className="rrs-correct">✓ {correct}</span>
            <span className="rrs-wrong">✗ {wrong}</span>
            <span className="rrs-skipped">— {skipped}</span>
          </div>
        </div>
        <div className="result-review-body">
          {breakdown.length > 0 ? (
            <AnswerReview breakdown={breakdown} language={language} />
          ) : (
            <p style={{ textAlign: "center", color: "#6f7d92", marginTop: "2rem" }}>
              No answer data for this result. Retake the quiz to view review.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      {/* ── Hidden Report Card (captured by html2canvas) ── */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "794px" }}>
        <div ref={reportCardRef} className="rc-wrap">
          {/* Header */}
          <div className="rc-header">
            <img src={logo} alt="SSC Pathnirman" className="rc-logo" />
            <div className="rc-header-text">
              <div className="rc-org-name">SSC Pathnirman</div>
              <div className="rc-org-tagline">Your Complete SSC Success Partner</div>
            </div>
            <div className={`rc-status-stamp ${passed ? "pass" : "fail"}`}>
              {passed ? "PASSED" : "FAILED"}
            </div>
          </div>

          <div className="rc-contact-bar">
            <span>📞 +91 97995 00688</span>
            <span>✉ sscinstitutepathnirman@gmail.com</span>
            <span>🌐 www.sscpathnirman.com</span>
          </div>

          <div className="rc-divider" />

          <div className="rc-title-row">
            <span className="rc-title">Performance Report Card</span>
          </div>

          {/* Student + Test Info */}
          <div className="rc-info-grid">
            <div className="rc-info-cell">
              <span className="rc-info-label">Student Email</span>
              <span className="rc-info-value">{user?.email ?? "—"}</span>
            </div>
            <div className="rc-info-cell">
              <span className="rc-info-label">Test Name</span>
              <span className="rc-info-value">{sectionTitle}</span>
            </div>
            <div className="rc-info-cell">
              <span className="rc-info-label">Date</span>
              <span className="rc-info-value">{dateStr}</span>
            </div>
            <div className="rc-info-cell">
              <span className="rc-info-label">Result</span>
              <span className={`rc-info-value ${passed ? "rc-pass-text" : "rc-fail-text"}`}>
                {passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>

          <div className="rc-divider" />

          {/* Score Hero */}
          <div className="rc-score-hero">
            <div className="rc-score-circle">
              <span className="rc-score-num">{obtained}</span>
              <span className="rc-score-denom">/ {total}</span>
            </div>
            <div className="rc-score-right">
              <div className="rc-pct-label">{percentage}%</div>
              <div className="rc-pct-sub">Overall Score</div>
              <div className="rc-bar-wrap">
                <div
                  className={`rc-bar-fill ${passed ? "pass" : "fail"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="rc-pass-mark">Passing Mark: 40%</div>
            </div>
          </div>

          <div className="rc-divider" />

          {/* Stats Table */}
          <table className="rc-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count / Marks</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="rc-row-correct">
                <td>Correct Answers</td>
                <td>{correct}</td>
                <td>+{correct * (total > 0 ? (total / (correct + wrong + skipped || 1)) : 1).toFixed(0)} marks approx</td>
              </tr>
              <tr className="rc-row-wrong">
                <td>Wrong Answers</td>
                <td>{wrong}</td>
                <td>Negative marks applied</td>
              </tr>
              <tr className="rc-row-skipped">
                <td>Skipped / Unattempted</td>
                <td>{skipped}</td>
                <td>No marks deducted</td>
              </tr>
              <tr className="rc-row-obtained">
                <td>Marks Obtained</td>
                <td>{obtained}</td>
                <td>After negative marking</td>
              </tr>
              <tr>
                <td>Total Marks</td>
                <td>{total}</td>
                <td>Full paper marks</td>
              </tr>
              <tr className="rc-row-wrong">
                <td>Negative Marks Deducted</td>
                <td>{negative > 0 ? `-${negative}` : 0}</td>
                <td>For wrong answers</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="rc-footer">
            <span>Generated by SSC Pathnirman &mdash; sscinstitutepathnirman@gmail.com</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── Visible Result Card ── */}
      <div className="result-card">
        <div className="result-logo-row">
          <img src={logo} alt="SSC Pathnirman" className="result-logo" />
          <span className="result-logo-name">SSC Pathnirman</span>
        </div>
        <span className={`result-badge ${passed ? "pass" : "fail"}`}>
          {passed ? "Passed" : "Failed"}
        </span>

        <h2 className="result-heading">
          {passed ? "Congratulations!" : "Better Luck Next Time!"}
        </h2>
        <p className="result-sub">{sectionTitle} — submitted successfully</p>

        <div className="result-score-row">
          <div className="result-score-big">{obtained}</div>
          <div className="result-score-meta">
            <div className="result-score-pct">{percentage}%</div>
            <div className="result-score-total">out of {total} marks</div>
          </div>
        </div>

        <div className="result-bar-wrap">
          <div
            className={`result-bar-fill ${passed ? "pass" : "fail"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="result-grid">
          <div className="result-stat">
            <span className="result-stat-label">Correct</span>
            <span className="result-stat-value green">{correct}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Wrong</span>
            <span className="result-stat-value red">{wrong}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Skipped</span>
            <span className="result-stat-value yellow">{skipped}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Obtained</span>
            <span className={`result-stat-value ${obtained >= 0 ? "orange" : "red"}`}>
              {obtained}
            </span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Total</span>
            <span className="result-stat-value">{total}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Negative</span>
            <span className="result-stat-value red">
              {negative > 0 ? `-${negative}` : 0}
            </span>
          </div>
        </div>

        <div className="result-actions">
          <button className="result-btn primary" onClick={() => navigate("/tests")}>
            Back to Tests
          </button>
          <button className="result-btn secondary" onClick={() => navigate("/")}>
            Home
          </button>
        </div>

        <button
          className="result-btn download"
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          {downloading ? "Generating PDF..." : "⬇ Download Report Card"}
        </button>

        <button className="result-btn detail" onClick={() => setShowReview(true)}>
          View Detailed Result
        </button>
      </div>
    </div>
  );
}

export default Result;
