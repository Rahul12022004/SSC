import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BASE_URL } from "@/context/AuthContext";
import { jsPDF } from "jspdf";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : "0.0");

const TYPE_TABS = [
  { key: "full",      label: "Full Quiz",      color: "#2563eb", bg: "#dbeafe" },
  { key: "sectional", label: "Sectional Quiz",  color: "#7c3aed", bg: "#ede9fe" },
];

export default function AdminResults() {
  const [quizzes, setQuizzes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState("full");
  const [selected, setSelected]       = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading]   = useState(false);
  const [detailSub, setDetailSub]     = useState(null);

  useEffect(() => { fetchOverview(); }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/quiz/admin/results-overview`, { headers: authHeaders(), credentials: "include" });
      const data = await res.json();
      setQuizzes(data.success ? data.quizzes : []);
    } catch { setQuizzes([]); }
    finally { setLoading(false); }
  };

  const openQuiz = async (quiz) => {
    setSelected(quiz);
    setDetailSub(null);
    setSubLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/quiz/${quiz._id}/submissions`, { headers: authHeaders(), credentials: "include" });
      const data = await res.json();
      setSubmissions(data.success ? data.submissions : []);
    } catch { setSubmissions([]); }
    finally { setSubLoading(false); }
  };

  // segregate by mockType — treat "subject_wise" as sectional
  const byTab = quizzes.filter(q => {
    const t = q.mockType || "full";
    if (tab === "full") return t === "full";
    return t === "sectional" || t === "subject_wise";
  });

  const filtered = byTab.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSubs = quizzes.reduce((s, q) => s + q.submissions, 0);
  const STATS = [
    { label: "Total Quizzes",     value: quizzes.length,                               color: "#F77F00" },
    { label: "Full Quizzes",      value: quizzes.filter(q => (q.mockType||"full") === "full").length,      color: "#2563eb" },
    { label: "Sectional Quizzes", value: quizzes.filter(q => (q.mockType||"full") !== "full").length,      color: "#7c3aed" },
    { label: "Total Submissions", value: totalSubs,                                    color: "#16a34a" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "110px 32px 60px" }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 32 }}>
          <span style={{ display: "inline-block", marginBottom: 10, padding: "3px 14px", borderRadius: 9999, fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "#fff7ed", color: "#F77F00" }}>
            Admin Panel
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, color: "#0B2545", lineHeight: 1.1 }}>
            Quiz <span style={{ color: "#F77F00" }}>Results.</span>
          </h1>
        </motion.div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {TYPE_TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
              style={{ padding: "9px 22px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: tab === t.key ? t.bg : "#f3f4f6",
                color: tab === t.key ? t.color : "#6b7280",
                boxShadow: tab === t.key ? `0 0 0 2px ${t.color}40` : "none",
              }}>
              {t.label}
              <span style={{ marginLeft: 8, padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: tab === t.key ? t.color : "#e5e7eb",
                color: tab === t.key ? "#fff" : "#6b7280" }}>
                {quizzes.filter(q => {
                  const mt = q.mockType || "full";
                  return t.key === "full" ? mt === "full" : mt !== "full";
                }).length}
              </span>
            </button>
          ))}
        </div>

        {/* SEARCH + REFRESH */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab === "full" ? "full" : "sectional"} quizzes...`}
            style={{ flex: 1, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}
            onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
          <button onClick={fetchOverview} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "#F77F00", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refresh
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Loading...</div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    {["Quiz Title", "Subject", "Type", "Total Marks", "Submissions", "Avg Score", "Created", "Action"].map(h => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => {
                    const mt = q.mockType || "full";
                    const typeLabel = mt === "full" ? "Full" : mt === "sectional" ? "Sectional" : "Subject Wise";
                    const typeColor = mt === "full" ? "#2563eb" : "#7c3aed";
                    const typeBg    = mt === "full" ? "#dbeafe" : "#ede9fe";
                    return (
                      <tr key={q._id} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "#0B2545", fontSize: 14, maxWidth: 240 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{q.subject || "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: typeBg, color: typeColor }}>{typeLabel}</span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{q.totalMarks}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, background: q.submissions > 0 ? "#d1fae5" : "#f3f4f6", color: q.submissions > 0 ? "#059669" : "#9ca3af" }}>
                            {q.submissions}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{fmt(q.avgScore)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <button onClick={() => openQuiz(q)} disabled={q.submissions === 0}
                            style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: q.submissions > 0 ? "#fff7ed" : "#f3f4f6", color: q.submissions > 0 ? "#F77F00" : "#9ca3af", fontWeight: 700, fontSize: 12, cursor: q.submissions > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                            View Results
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                  No {tab === "full" ? "full" : "sectional"} quizzes found.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUBMISSIONS DRAWER */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", justifyContent: "flex-end" }}
              onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setDetailSub(null); } }}>

              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
                style={{ width: "min(720px, 95vw)", background: "#fff", height: "100%", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>

                {/* Drawer Header */}
                <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {detailSub && (
                        <button onClick={() => setDetailSub(null)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, background: "none", border: "none", color: "#F77F00", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                          ← Back to submissions
                        </button>
                      )}
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0B2545", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.title}</h2>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
                        {detailSub
                          ? `${detailSub.studentName || detailSub.email}`
                          : `${submissions.length} student${submissions.length !== 1 ? "s" : ""} appeared · Total marks: ${selected.totalMarks}`}
                      </p>
                    </div>
                    <button onClick={() => { setSelected(null); setDetailSub(null); }}
                      style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#6b7280", flexShrink: 0 }}>×</button>
                  </div>
                </div>

                <div style={{ padding: "20px 28px", flex: 1 }}>
                  {subLoading ? (
                    <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading submissions...</div>
                  ) : detailSub ? (
                    <DetailView sub={detailSub} totalMarks={selected.totalMarks} />
                  ) : (
                    <SubmissionList submissions={submissions} totalMarks={selected.totalMarks} onView={setDetailSub} quizTitle={selected.title} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubmissionList({ submissions, totalMarks, onView, quizTitle }) {
  const [search, setSearch]         = useState("");
  const [sortOrder, setSortOrder]   = useState("default");
  const [topN, setTopN]             = useState(0);
  const [customN, setCustomN]       = useState("");
  const [useCustom, setUseCustom]   = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = submissions.filter(s =>
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "high") return b.score - a.score;
    if (sortOrder === "low")  return a.score - b.score;
    return 0;
  });

  const effectiveN = useCustom ? (parseInt(customN) || 0) : topN;
  const displayed  = effectiveN > 0 ? sorted.slice(0, effectiveN) : sorted;

  const activeFilters = (sortOrder !== "default" ? 1 : 0) + (effectiveN > 0 ? 1 : 0);

  const downloadCSV = () => {
    const header = ["Rank", "Name", "Email", "Score", `Score/${totalMarks}`, "Percentage", "Time Taken", "Submitted At"];
    const rows = displayed.map((s, i) => {
      const pct = totalMarks > 0 ? Math.round((s.score / totalMarks) * 100) : 0;
      const time = s.timeTaken > 0 ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : "";
      const date = new Date(s.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      return [i + 1, s.studentName || "", s.email || "", s.score, `${s.score}/${totalMarks}`, `${pct}%`, time, date];
    });
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${quizTitle || "results"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const title = quizTitle || "Quiz Results";
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text(title, 14, 18);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Total Marks: ${totalMarks}  |  Submissions: ${displayed.length}  |  Generated: ${new Date().toLocaleString("en-IN")}`, 14, 26);

    const cols = ["#", "Name", "Email", "Score", "%", "Time", "Submitted"];
    const colW = [10, 45, 65, 20, 15, 22, 50];
    const startX = 14; let y = 36;

    doc.setFillColor(11, 37, 69); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    let x = startX;
    colW.forEach((w, i) => { doc.rect(x, y, w, 8, "F"); doc.text(cols[i], x + 2, y + 5.5); x += w; });
    y += 8;

    doc.setTextColor(30, 30, 30); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    displayed.forEach((s, i) => {
      if (y > 190) { doc.addPage(); y = 20; }
      const pct  = totalMarks > 0 ? Math.round((s.score / totalMarks) * 100) : 0;
      const time = s.timeTaken > 0 ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : "—";
      const date = new Date(s.submittedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
      const vals = [i + 1, s.studentName || "—", s.email || "—", s.score, `${pct}%`, time, date];
      if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(startX, y, colW.reduce((a,b)=>a+b,0), 7, "F"); }
      x = startX;
      colW.forEach((w, j) => { doc.text(String(vals[j]).slice(0, j===2?35:30), x + 2, y + 5); x += w; });
      y += 7;
    });

    doc.save(`${quizTitle || "results"}.pdf`);
  };

  const pillBtn = (active, onClick, label) => (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700,
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
      background: active ? "#0B2545" : "#f3f4f6",
      color: active ? "#fff" : "#6b7280",
    }}>{label}</button>
  );

  return (
    <>
      {/* Top bar: search + filter button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{ flex: 1, minWidth: 160, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          onFocus={e => { e.target.style.borderColor = "#F77F00"; }}
          onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
        />
        <button onClick={() => setFilterOpen(o => !o)}
          style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: filterOpen ? "#0B2545" : "#fff", color: filterOpen ? "#fff" : "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          ⚙ Filter
          {activeFilters > 0 && (
            <span style={{ background: "#F77F00", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>{activeFilters}</span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Sort */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sort by Marks</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pillBtn(sortOrder === "default", () => setSortOrder("default"), "Default")}
              {pillBtn(sortOrder === "high",    () => setSortOrder("high"),    "High → Low")}
              {pillBtn(sortOrder === "low",     () => setSortOrder("low"),     "Low → High")}
            </div>
          </div>

          {/* Show entries */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Show Entries</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {pillBtn(!useCustom && topN === 0,  () => { setUseCustom(false); setTopN(0);  }, "All")}
              {pillBtn(!useCustom && topN === 10, () => { setUseCustom(false); setTopN(10); }, "Top 10")}
              {pillBtn(!useCustom && topN === 20, () => { setUseCustom(false); setTopN(20); }, "Top 20")}
              {pillBtn(!useCustom && topN === 30, () => { setUseCustom(false); setTopN(30); }, "Top 30")}
              {pillBtn(useCustom, () => { setUseCustom(true); setTopN(0); }, "Custom Range")}
            </div>
            {useCustom && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Show top</span>
                <input
                  type="number" min={1} max={submissions.length} value={customN}
                  onChange={e => setCustomN(e.target.value)}
                  placeholder="e.g. 50"
                  style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                  onFocus={e => { e.target.style.borderColor = "#F77F00"; }}
                  onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
                />
                <span style={{ fontSize: 12, color: "#6b7280" }}>of {submissions.length} entries</span>
              </div>
            )}
          </div>

          {/* Downloads */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Download</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadPDF}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                ↓ PDF
              </button>
              <button onClick={downloadCSV}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                ↓ Excel
              </button>
            </div>
          </div>

          {/* Clear */}
          {activeFilters > 0 && (
            <button onClick={() => { setSortOrder("default"); setTopN(0); setUseCustom(false); setCustomN(""); }}
              style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Count indicator */}
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
        Showing {displayed.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        {effectiveN > 0 && ` · Top ${effectiveN}`}
        {sortOrder !== "default" && ` · ${sortOrder === "high" ? "High → Low" : "Low → High"}`}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {displayed.map((s, i) => {
          const pct   = totalMarks > 0 ? Math.round((s.score / totalMarks) * 100) : 0;
          const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#F77F00" : "#dc2626";
          const initials = s.studentName
            ? s.studentName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
            : s.email?.[0]?.toUpperCase() || "?";
          return (
            <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 18px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
              {sortOrder !== "default" && (
                <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", minWidth: 20, textAlign: "center" }}>#{i + 1}</div>
              )}
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff7ed", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#F77F00", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0B2545", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.studentName || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Unknown</span>}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  {new Date(s.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  {s.timeTaken > 0 && ` · ${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s`}
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color }}>{s.score}<span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>/{totalMarks}</span></div>
                <div style={{ fontSize: 11, color, fontWeight: 700 }}>{pct}%</div>
              </div>
              <button onClick={() => onView(s)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#0B2545", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                Detail
              </button>
            </motion.div>
          );
        })}
        {displayed.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No submissions found.</div>}
      </div>
    </>
  );
}

function DetailView({ sub, totalMarks }) {
  const pct   = totalMarks > 0 ? Math.round((sub.score / totalMarks) * 100) : 0;
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#F77F00" : "#dc2626";

  const STATS = [
    { label: "Student",   value: sub.studentName || "—",       color: "#0B2545" },
    { label: "Email",     value: sub.email,                    color: "#475569" },
    { label: "Score",     value: `${sub.score}/${totalMarks}`, color },
    { label: "Percent",   value: `${pct}%`,                   color },
    { label: "Time Taken",value: sub.timeTaken > 0 ? `${Math.floor(sub.timeTaken/60)}m ${sub.timeTaken%60}s` : "—", color: "#2563eb" },
    { label: "Submitted", value: new Date(sub.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), color: "#6b7280" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {Array.isArray(sub.answers) && sub.answers.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0B2545", marginBottom: 12 }}>Answer Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sub.answers.map((ans, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", minWidth: 28 }}>Q{i + 1}</span>
                <span style={{ fontSize: 13, color: "#0B2545", flex: 1 }}>
                  {ans === null || ans === undefined || ans === ""
                    ? <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Skipped</span>
                    : <span>Answer: <strong>{String(ans)}</strong></span>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
