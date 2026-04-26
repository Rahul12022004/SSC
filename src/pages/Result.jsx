import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [showReview, setShowReview] = useState(false);

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
      <div className="result-card">
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
            <span
              className={`result-stat-value ${obtained >= 0 ? "orange" : "red"}`}
            >
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
          <button
            className="result-btn primary"
            onClick={() => navigate("/tests")}
          >
            Back to Tests
          </button>
          <button
            className="result-btn secondary"
            onClick={() => navigate("/")}
          >
            Home
          </button>
        </div>

        <button
          className="result-btn detail"
          onClick={() => setShowReview(true)}
        >
          View Detailed Result
        </button>
      </div>
    </div>
  );
}

export default Result;
