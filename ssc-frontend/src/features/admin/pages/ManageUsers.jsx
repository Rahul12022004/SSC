import { useState, useEffect } from "react";
import { BASE_URL } from "@/context/AuthContext";
import { motion } from "motion/react";
import Feedback from "./Feedback";
import AdminResults from "./AdminResults";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ROLES = [
  { value: "user",      label: "User",      level: 1  },
  { value: "moderator", label: "Moderator", level: 5  },
  { value: "admin",     label: "Admin",     level: 10 },
];

const getRoleMeta = (role) => {
  if (role === "admin")     return { bg: "#fee2e2", color: "#dc2626" };
  if (role === "moderator") return { bg: "#fff7ed", color: "#F77F00" };
  return { bg: "#eff6ff", color: "#2563eb" };
};

const cleanName = (v) => (v && v !== "undefined" ? v : "");

function getInitials(u) {
  const n = [u.firstName, u.lastName].map(cleanName).filter(Boolean).join(" ").trim();
  if (!n) return u.email?.[0]?.toUpperCase() || "U";
  const parts = n.split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
}

export default function ManageUsers() {
  const [tab, setTab]                   = useState("users");
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [editingUser, setEditingUser]   = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/users`, { credentials: "include", headers: authHeaders() });
      const data = await res.json();
      setUsers(data.success ? (data.users || []) : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleUpdateRole = async (userId) => {
    try {
      const res  = await fetch(`${BASE_URL}/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole, roleLevel: selectedLevel }),
      });
      const data = await res.json();
      if (data.success) { setUsers(prev => prev.map(u => u._id === userId ? data.user : u)); setEditingUser(null); }
      else alert(data.message);
    } catch { alert("Failed to update role"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res  = await fetch(`${BASE_URL}/users/${userId}`, { method: "DELETE", credentials: "include", headers: authHeaders() });
      const data = await res.json();
      if (data.success) setUsers(prev => prev.filter(u => u._id !== userId));
      else alert(data.message);
    } catch { alert("Failed to delete user"); }
  };

  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STATS = [
    { label: "Total Users",  value: users.length,                                     accent: "#F77F00", bg: "#fff7ed", border: "#fed7aa" },
    { label: "Verified",     value: users.filter(u => u.emailVerified).length,        accent: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Admins",       value: users.filter(u => u.role === "admin").length,     accent: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    { label: "Moderators",   value: users.filter(u => u.role === "moderator").length, accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  ];

  const TABS = [
    { key: "users",    label: "👥 Users",    count: users.length },
    { key: "results",  label: "📊 Results",  count: null },
    { key: "feedback", label: "💬 Feedback", count: null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "110px 32px 60px" }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ marginBottom: 28 }}>
          <span style={{ display: "inline-block", marginBottom: 12, padding: "3px 14px", borderRadius: 9999, fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "#fff7ed", color: "#F77F00" }}>
            Admin Panel
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, color: "#0B2545", lineHeight: 1.1 }}>
            Admin <span style={{ color: "#F77F00" }}>Dashboard.</span>
          </h1>
        </motion.div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "2px solid #e5e7eb" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: "10px 22px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                color: tab === t.key ? "#F77F00" : "#6b7280",
                borderBottom: tab === t.key ? "3px solid #F77F00" : "3px solid transparent",
                marginBottom: -2, transition: "all 0.15s",
              }}>
              {t.label}
              {t.count !== null && (
                <span style={{ marginLeft: 6, padding: "1px 7px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                  background: tab === t.key ? "#F77F00" : "#e5e7eb",
                  color: tab === t.key ? "#fff" : "#6b7280" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* RESULTS TAB */}
        {tab === "results" && <AdminResults />}

        {/* FEEDBACK TAB */}
        {tab === "feedback" && <Feedback />}

        {/* USERS TAB */}
        {tab === "users" && (
          <>
            {/* STAT CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }} whileHover={{ y: -4 }}
                  style={{ background: "#fff", border: `1px solid ${s.border}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: s.bg, marginBottom: 12, border: `1px solid ${s.border}` }}>
                    <span style={{ fontSize: 18, color: s.accent }}>
                      {s.label === "Total Users" ? "👥" : s.label === "Verified" ? "✓" : s.label === "Admins" ? "🛡" : "⚡"}
                    </span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0B2545", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* TOOLBAR */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <input type="text" placeholder="Search by name or email..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                style={{ flex: 1, padding: "11px 18px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#0B2545", background: "#f9fafb", outline: "none", fontFamily: "inherit" }}
                onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.1)"; e.target.style.background = "#fff"; }}
                onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; e.target.style.background = "#f9fafb"; }}
              />
              <button onClick={fetchUsers}
                style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "#F77F00", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                ↻ Refresh
              </button>
            </div>

            {/* TABLE */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8", fontSize: 15, background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb" }}>
                Loading users...
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        {["User", "Email", "Phone", "Role", "Level", "Verified", "Joined", "Actions"].map(h => (
                          <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map((user) => {
                        const roleMeta = getRoleMeta(user.role);
                        return (
                          <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff7ed", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#F77F00", flexShrink: 0 }}>
                                  {getInitials(user)}
                                </div>
                                <span style={{ fontWeight: 600, color: "#0B2545", fontSize: 14 }}>
                                  {[user.firstName, user.middleName, user.lastName].map(cleanName).filter(Boolean).join(" ") || "—"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{user.email}</td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{user.phone || "—"}</td>
                            <td style={{ padding: "14px 16px" }}>
                              {editingUser === user._id ? (
                                <select value={selectedRole}
                                  onChange={e => { setSelectedRole(e.target.value); const r = ROLES.find(r => r.value === e.target.value); setSelectedLevel(r?.level || 1); }}
                                  style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit" }}>
                                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                              ) : (
                                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: roleMeta.bg, color: roleMeta.color, textTransform: "capitalize" }}>
                                  {user.role}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                              {editingUser === user._id ? (
                                <input type="number" value={selectedLevel} min={1} max={10} onChange={e => setSelectedLevel(Number(e.target.value))}
                                  style={{ width: 56, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontWeight: 600, textAlign: "center", outline: "none", fontFamily: "inherit" }} />
                              ) : (
                                <span style={{ fontWeight: 600, color: "#0B2545" }}>{user.roleLevel}</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: user.emailVerified ? "#d1fae5" : "#fee2e2", color: user.emailVerified ? "#059669" : "#dc2626" }}>
                                {user.emailVerified ? "✓ Yes" : "✗ No"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 7 }}>
                                {editingUser === user._id ? (
                                  <>
                                    <button onClick={() => handleUpdateRole(user._id)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#d1fae5", color: "#059669", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                                    <button onClick={() => setEditingUser(null)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#f3f4f6", color: "#6b7280", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingUser(user._id); setSelectedRole(user.role); setSelectedLevel(user.roleLevel); }}
                                      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#fff7ed", color: "#F77F00", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                                    <button onClick={() => handleDeleteUser(user._id)}
                                      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", fontSize: 15 }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>👥</div>
                    {searchQuery ? "No users match your search." : "No users found."}
                  </div>
                )}
              </motion.div>
            )}

            {/* PAGINATION */}
            {!loading && filteredUsers.length > PAGE_SIZE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: page === 1 ? "#f9fafb" : "#fff", color: page === 1 ? "#94a3b8" : "#0B2545", fontWeight: 700, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    ← Prev
                  </button>
                  <span style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#0B2545" }}>{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: page === totalPages ? "#f9fafb" : "#F77F00", color: page === totalPages ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
