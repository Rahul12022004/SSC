import { useState } from "react";
import { BASE_URL } from "@/context/AuthContext";

const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    padding: "20px",
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    animation: "slideUp 0.3s ease",
    overflow: "hidden",
  },
  header: {
    padding: "24px 24px 16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0b2545",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "32px",
    color: "#6b7280",
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
  },
  body: { padding: "24px" },
  subtitle: { color: "#6b7280", fontSize: "14px", margin: "0 0 24px" },
  ratingWrap: { marginBottom: "24px" },
  label: { display: "block", fontWeight: 600, color: "#0b2545", marginBottom: "12px", fontSize: "14px" },
  starRow: { display: "flex", gap: "8px" },
  starBtn: (active) => ({
    background: "none",
    border: "none",
    fontSize: "36px",
    color: active ? "#fbbf24" : "#d1d5db",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  }),
  textWrap: { marginBottom: "24px", position: "relative" },
  labelText: { display: "block", fontWeight: 600, color: "#0b2545", marginBottom: "8px", fontSize: "14px" },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
  },
  charCount: { position: "absolute", bottom: "-20px", right: 0, fontSize: "12px", color: "#9ca3af" },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" },
  skipBtn: {
    padding: "10px 20px",
    border: "1px solid #d1d5db",
    background: "white",
    color: "#6b7280",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: (disabled) => ({
    padding: "10px 24px",
    border: "none",
    background: disabled ? "#f9a85d" : "#f77f00",
    color: "white",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  }),
};

export default function FeedbackModal({ quizId, quizTitle, userEmail, userName, onClose }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { alert("Please select a rating"); return; }
    if (!feedback.trim()) { alert("Please provide feedback"); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/quiz/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, email: userEmail, userName, quizTitle, rating, feedback: feedback.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Thank you for your feedback!");
        onClose();
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.headerTitle}>How was your quiz experience?</h2>
          <button style={S.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={S.body}>
          <p style={S.subtitle}>Your feedback helps us improve the quiz quality</p>

          <div style={S.ratingWrap}>
            <label style={S.label}>Rate this quiz</label>
            <div style={S.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} style={S.starBtn(rating >= star)} onClick={() => setRating(star)}>★</button>
              ))}
            </div>
          </div>

          <div style={S.textWrap}>
            <label style={S.labelText}>Your feedback</label>
            <textarea
              style={S.textarea}
              placeholder="Tell us about your experience with this quiz..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={1000}
              rows={5}
            />
            <span style={S.charCount}>{feedback.length}/1000</span>
          </div>

          <div style={S.actions}>
            <button style={S.skipBtn} onClick={onClose}>Skip</button>
            <button style={S.submitBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
