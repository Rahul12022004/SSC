import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BASE_URL } from "@/context/AuthContext";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const STARS = [5, 4, 3, 2, 1];

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/quiz/feedback/all`, { headers: authHeaders(), credentials: "include" });
      const data = await res.json();
      setFeedbacks(data.success ? data.feedbacks : []);
    } catch { setFeedbacks([]); }
    finally { setLoading(false); }
  };

  const filtered = feedbacks.filter(fb => {
    const matchRating = ratingFilter === "all" || fb.rating === parseInt(ratingFilter);
    const q = search.toLowerCase();
    const matchSearch = !q ||
      fb.userName?.toLowerCase().includes(q) ||
      fb.quizTitle?.toLowerCase().includes(q) ||
      fb.email?.toLowerCase().includes(q);
    return matchRating && matchSearch;
  });

  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const STATS = [
    { label: "Total Feedback", value: feedbacks.length,                                   color: "#F77F00" },
    { label: "Avg Rating",     value: `${avg} ★`,                                         color: "#fbbf24" },
    { label: "5 Star",         value: feedbacks.filter(f => f.rating === 5).length,       color: "#16a34a" },
    { label: "4 Star",         value: feedbacks.filter(f => f.rating === 4).length,       color: "#2563eb" },
    { label: "3 Star",         value: feedbacks.filter(f => f.rating === 3).length,       color: "#7c3aed" },
    { label: "2 Star",         value: feedbacks.filter(f => f.rating === 2).length,       color: "#F77F00" },
    { label: "1 Star",         value: feedbacks.filter(f => f.rating === 1).length,       color: "#dc2626" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "110px 32px 60px" }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 32 }}>
          <span style={{ display: "inline-block", marginBottom: 10, padding: "3px 14px", borderRadius: 9999, fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "#fff7ed", color: "#F77F00" }}>
            Admin Panel
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, color: "#0B2545", lineHeight: 1.1 }}>
            Quiz <span style={{ color: "#F77F00" }}>Feedback.</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6b7280" }}>Feedback submitted by students after completing a quiz</p>
        </motion.div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 14, marginBottom: 28 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name, quiz or email..."
            style={{ flex: 1, minWidth: 220, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
            style={{ padding: "11px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
            <option value="all">All Ratings</option>
            {STARS.map(r => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
          </select>
          <button onClick={fetchFeedbacks}
            style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "#F77F00", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refresh
          </button>
        </div>

        {/* FEEDBACK LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading feedback...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>💬</div>
            No feedback found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((fb, i) => {
              const initials = fb.userName
                ? fb.userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                : fb.email?.[0]?.toUpperCase() || "?";
              const starColor = fb.rating >= 4 ? "#16a34a" : fb.rating === 3 ? "#F77F00" : "#dc2626";

              return (
                <motion.div key={fb._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>

                  {/* Card Header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    {/* Student info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff7ed", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#F77F00", flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0B2545", fontSize: 15 }}>{fb.userName || "Unknown Student"}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{fb.email}</div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize: 18, color: s <= fb.rating ? "#fbbf24" : "#e5e7eb" }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: starColor }}>{fb.rating}/5</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "16px 20px" }}>
                    {/* Quiz name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#F77F00", marginRight: 8 }}>Quiz</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0B2545" }}>{fb.quizTitle}</span>
                    </div>

                    {/* Feedback text */}
                    <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9", marginBottom: 12 }}>
                      "{fb.feedback}"
                    </div>

                    {/* Time */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                      <span>🕐</span>
                      <span>{new Date(fb.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
