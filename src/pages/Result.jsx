import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiHome } from "react-icons/fi";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <h2>No result found.</h2>
        <button onClick={() => navigate("/tests")}>Go to Tests</button>
      </div>
    );
  }

  const { score } = result;
  const percentage = score.total > 0
    ? Math.round((score.obtained / score.total) * 100)
    : 0;
  const passed = percentage >= 40;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>
          {passed
            ? <FiCheckCircle color="#22c55e" />
            : <FiXCircle color="#ef4444" />}
        </div>

        <h2 style={{ marginBottom: "0.25rem" }}>
          {passed ? "Congratulations! 🎉" : "Better Luck Next Time!"}
        </h2>
        <p style={{ color: "#888", marginBottom: "1.5rem" }}>
          Quiz submitted successfully
        </p>

        {/* Score Circle */}
        <div style={styles.scoreCircle(passed)}>
          <span style={{ fontSize: "2rem", fontWeight: "700" }}>
            {percentage}%
          </span>
          <span style={{ fontSize: "0.85rem", color: "#aaa" }}>Score</span>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Obtained</span>
            <strong style={{ color: "#22c55e" }}>{score.obtained}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Marks</span>
            <strong>{score.total}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Correct</span>
            <strong style={{ color: "#22c55e" }}>{score.correct}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Wrong</span>
            <strong style={{ color: "#ef4444" }}>{score.wrong ?? 0}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Skipped</span>
            <strong style={{ color: "#f59e0b" }}>{score.skipped ?? 0}</strong>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Negative</span>
            <strong style={{ color: "#ef4444" }}>-{score.negative ?? 0}</strong>
          </div>
        </div>

        <button style={styles.btn} onClick={() => navigate("/tests")}>
          <FiHome /> &nbsp; Back to Tests
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f0f",
    padding: "2rem",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "1.25rem",
    padding: "2.5rem",
    textAlign: "center",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  scoreCircle: (passed) => ({
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: `5px solid ${passed ? "#22c55e" : "#ef4444"}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 2rem",
  }),
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statBox: {
    background: "#111",
    borderRadius: "0.75rem",
    padding: "0.75rem 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#666",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.75rem 2rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default Result;