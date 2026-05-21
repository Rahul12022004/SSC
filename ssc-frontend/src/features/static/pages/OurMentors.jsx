import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FaUserTie, FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { BASE_URL, useAuth } from "@/context/AuthContext";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* MENTOR CARD */
function MentorCard({ mentor, isAdmin, onEdit, onDelete, delay }) {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showImage = mentor.imageUrl && !imgError;

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
    >
      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <button
            onClick={() => onEdit(mentor)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <FaEdit className="text-blue-600" size={14} />
          </button>
          <button
            onClick={() => onDelete(mentor._id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <FaTrash className="text-red-600" size={14} />
          </button>
        </div>
      )}

      {/* Image Section */}
      <div className="relative w-full h-[220px] bg-gradient-to-br from-orange-50 to-blue-50 overflow-hidden">
        {showImage ? (
          <>
            <div className={`absolute inset-0 z-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse ${loaded ? "hidden" : ""}`} />
            <img
              src={mentor.imageUrl}
              alt={mentor.name}
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F77F00] to-[#d96c00] flex items-center justify-center">
              <FaUserTie size={40} className="text-white" />
            </div>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#0B2545' }}>
          {mentor.name}
        </h3>
        <div className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#fff7ed', color: '#F77F00' }}>
          {mentor.subject}
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#6b7280' }}>
          {mentor.description}
        </p>
        {mentor.achievements && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.achievements.split(',').slice(0, 2).map((achievement, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: '#eff6ff', color: '#2563eb' }}>
                {achievement.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ADD/EDIT MODAL */
function MentorModal({ mentor, onClose, onSave }) {
  const [form, setForm] = useState({
    name: mentor?.name || "",
    subject: mentor?.subject || "",
    description: mentor?.description || "",
    achievements: mentor?.achievements || "",
    imageUrl: mentor?.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) {
      setError("Name and subject are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = mentor?._id
        ? `${BASE_URL}/mentors/${mentor._id}`
        : `${BASE_URL}/mentors`;
      const method = mentor?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        onSave(data.mentor);
      } else {
        setError(data.message || "Failed to save mentor");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#0B2545' }}>
            {mentor ? "Edit Mentor" : "Add New Mentor"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes size={20} style={{ color: '#6b7280' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0B2545' }}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Sauryansh Singh"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0B2545' }}>Subject/Expertise *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. General Awareness + Math"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0B2545' }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Brief description about the mentor"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0B2545' }}>Achievements</label>
            <textarea
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={2}
              placeholder="Comma-separated achievements (e.g. AIR 95 CGL 2025, Inspector CBN)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#0B2545' }}>Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 rounded-xl font-semibold transition-colors"
              style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#F77F00,#d96c00)' }}
            >
              {saving ? "Saving..." : mentor ? "Update Mentor" : "Add Mentor"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* MAIN */
function OurMentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);

  const isAdmin = user?.role === "admin" || user?.roleLevel >= 10;

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mentors`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setMentors(data.mentors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleEdit = (mentor) => {
    setEditingMentor(mentor);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mentor?")) return;
    try {
      const res = await fetch(`${BASE_URL}/mentors/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMentors(mentors.filter((m) => m._id !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete mentor");
    }
  };

  const handleSave = (savedMentor) => {
    if (editingMentor) {
      setMentors(mentors.map((m) => (m._id === savedMentor._id ? savedMentor : m)));
    } else {
      setMentors([...mentors, savedMentor]);
    }
    setShowModal(false);
    setEditingMentor(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8" style={{ background: '#ffffff' }}>
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#0B2545 1px, transparent 1px), linear-gradient(90deg, #0B2545 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)' }} aria-hidden="true" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-4 px-4 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: '#fff7ed', color: '#F77F00' }}>
              Our Team
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-black leading-tight mb-5" style={{ color: '#0B2545' }}>
              Meet Your <span style={{ color: '#F77F00' }}>Mentors</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
              Learn from SSC toppers and selected officers who've been through the journey and know exactly what it takes to succeed.
            </p>
          </motion.div>

          {isAdmin && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              onClick={() => { setEditingMentor(null); setShowModal(true); }}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#F77F00,#d96c00)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus size={16} />
              Add New Mentor
            </motion.button>
          )}
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: '#6b7280' }}>No mentors found.</p>
              {isAdmin && (
                <button
                  onClick={() => { setEditingMentor(null); setShowModal(true); }}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#F77F00,#d96c00)' }}
                >
                  <FaPlus size={16} />
                  Add First Mentor
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mentors.map((mentor, i) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <MentorModal
          mentor={editingMentor}
          onClose={() => { setShowModal(false); setEditingMentor(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default OurMentors;
