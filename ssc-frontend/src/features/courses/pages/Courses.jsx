import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, BASE_URL } from "@/context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { FaBookOpen, FaUserTie, FaTools } from "react-icons/fa";
import { motion, useInView } from "motion/react";

import img1 from "@/assets/images/cgl.png";
import img2 from "@/assets/images/HCL.png";
import img3 from "@/assets/images/MTS.png";
import img4 from "@/assets/images/GD.png";
import img5 from "@/assets/images/Stenographer.png";
import img6 from "@/assets/images/JE.png";
import img7 from "@/assets/images/CPO.png";
import img8 from "@/assets/images/Selction Post.png";

const STATIC_COURSES = [
  { _id: "static-cgl",   name: "SSC CGL",            description: "For Inspector, Auditor, and Assistant posts (Graduation required).", imageUrl: img1, status: "coming_soon", isStatic: true },
  { _id: "static-chsl",  name: "SSC CHSL",            description: "For LDC, DEO (12th pass).",                                         imageUrl: img2, status: "coming_soon", isStatic: true },
  { _id: "static-mts",   name: "SSC MTS",             description: "For non-technical staff like peon, watchman (10th pass).",           imageUrl: img3, status: "coming_soon", isStatic: true },
  { _id: "static-gd",    name: "SSC GD",              description: "For BSF, CISF, and CRPF constable posts.",                          imageUrl: img4, status: "coming_soon", isStatic: true },
  { _id: "static-steno", name: "SSC Stenographer",    description: "For Grade C & D stenography positions.",                            imageUrl: img5, status: "coming_soon", isStatic: true },
  { _id: "static-je",    name: "SSC JE",              description: "For civil, electrical, or mechanical engineers.",                   imageUrl: img6, status: "coming_soon", isStatic: true },
  { _id: "static-cpo",   name: "SSC CPO",             description: "For Sub-Inspectors in Delhi Police & CAPFs.",                      imageUrl: img7, status: "coming_soon", isStatic: true },
  { _id: "static-sel",   name: "SSC Selection Posts", description: "Specialized technical and non-technical roles.",                   imageUrl: img8, status: "coming_soon", isStatic: true },
];

const getCourseIcon = (name) => {
  if (name.includes("CGL") || name.includes("CHSL")) return <FaUserTie size={36} />;
  if (name.includes("JE")) return <FaTools size={36} />;
  return <FaBookOpen size={36} />;
};

function CourseCard({ course, isAdmin, onEdit, onDelete, onEnter, index }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isActive = course.status === "active";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.11)" }}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)", height: 340 }}
    >
      {/* orange top accent on hover */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 z-10"
        style={{ background: "#F77F00" }}
      />

      {/* image */}
      <div className="relative w-full overflow-hidden" style={{ height: 180, background: "#f1f5f9" }}>
        {course.imageUrl ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize: "200% 100%" }} />
            )}
            <img
              src={course.imageUrl}
              alt={course.name}
              onLoad={() => setLoaded(true)}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              style={{ opacity: loaded ? 1 : 0 }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "#0B2545" }}>
            {getCourseIcon(course.name)}
          </div>
        )}

        {/* admin actions */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => onEdit(course)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              title="Edit"
            >✏️</button>
            <button
              onClick={() => onDelete(course._id)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              title="Delete"
            >🗑</button>
          </div>
        )}
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg mb-2 leading-snug" style={{ color: "#0B2545" }}>{course.name}</h3>
        <p className="text-sm leading-relaxed flex-1 mb-4 overflow-hidden" style={{ color: "#64748b", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{course.description}</p>
        <button
          onClick={isActive && !course.isStatic && onEnter ? () => onEnter(course._id) : undefined}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
          style={isActive
            ? { background: "#F77F00", color: "#fff", cursor: "pointer" }
            : { background: "#f1f5f9", color: "#94a3b8", cursor: "default" }
          }
        >
          {isActive ? "Enroll Now" : "Coming Soon"}
        </button>
      </div>
    </motion.div>
  );
}


function AddCourseCard({ onClick, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300"
      style={{ height: 340, borderColor: "#F77F00", background: "#fff8f0" }}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{ background: "rgba(247,127,0,0.12)" }}>
        <FiPlus size={24} style={{ color: "#F77F00" }} />
      </div>
      <p className="font-semibold text-sm" style={{ color: "#F77F00" }}>Add New Course</p>
    </motion.div>
  );
}

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({
    name: course?.name || "",
    description: course?.description || "",
    imageUrl: course?.imageUrl || "",
    status: course?.status || "coming_soon",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${BASE_URL}/upload-image`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (data.success) setForm(f => ({ ...f, imageUrl: data.url }));
      else setError("Image upload failed: " + data.message);
    } catch { setError("Image upload failed"); }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Course name is required"); return; }
    setSaving(true); setError("");
    try {
      const isStatic = course?.isStatic;
      const url = (course && !isStatic) ? `${BASE_URL}/courses/${course._id}` : `${BASE_URL}/courses`;
      const method = (course && !isStatic) ? "PUT" : "POST";
      const payload = { ...form, imageUrl: typeof form.imageUrl === "string" ? form.imageUrl : "" };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) onSave(data.course, isStatic ? course._id : null);
      else setError(data.message || "Failed");
    } catch { setError("Server error"); }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)", borderTop: "4px solid #F77F00" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold" style={{ color: "#0B2545" }}>{course ? "Edit Course" : "Add New Course"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">✕</button>
        </div>
        {error && <p className="px-6 pt-4 text-sm text-red-500">{error}</p>}
        <div className="px-6 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#0B2545" }}>Course Name *</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0B2545" }}
              onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              placeholder="e.g. SSC CGL"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#0B2545" }}>Description</label>
            <textarea
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0B2545", minHeight: 80, fontFamily: "inherit" }}
              onFocus={e => { e.target.style.borderColor = "#F77F00"; e.target.style.boxShadow = "0 0 0 3px rgba(247,127,0,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              placeholder="Short description..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#0B2545" }}>Course Image</label>
            <div className="flex gap-2 flex-wrap items-center">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files[0] && handleUpload(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: uploading ? "#94a3b8" : "#0B2545" }}
              >
                {uploading ? "Uploading…" : form.imageUrl ? "Replace Image" : "Upload Image"}
              </button>
              <input
                className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0B2545" }}
                placeholder="or paste image URL…"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            {form.imageUrl && (
              <div className="flex items-center gap-3 mt-3">
                <img src={form.imageUrl} alt="preview" className="h-14 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                  className="text-xs text-red-400 border border-gray-200 rounded-lg px-3 py-1 hover:border-red-300 transition-colors"
                >✕ Remove</button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#0B2545" }}>Status</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0B2545" }}
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="coming_soon">Coming Soon</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#f1f5f9", color: "#475569" }}
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: saving ? "#94a3b8" : "linear-gradient(135deg,#F77F00,#ff8c00)" }}
          >
            {saving ? "Saving…" : course ? "Update Course" : "Add Course"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roleLevel >= 10 || user?.role === "admin";

  const [dbCourses, setDbCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [hiddenStatics, setHiddenStatics] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hiddenStaticCourses") || "[]"); }
    catch { return []; }
  });

  const visibleStatics = STATIC_COURSES.filter(c => !hiddenStatics.includes(c._id));
  const allCourses = [...visibleStatics, ...dbCourses];

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses`);
      const data = await res.json();
      if (data.success) setDbCourses(data.courses);
    } catch { /* keep empty */ }
  };

  useEffect(() => { fetchCourses(); }, []);

  const hideStatic = (id) => {
    const updated = [...hiddenStatics, id];
    setHiddenStatics(updated);
    localStorage.setItem("hiddenStaticCourses", JSON.stringify(updated));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    if (STATIC_COURSES.some(c => c._id === id)) { hideStatic(id); return; }
    try {
      const res = await fetch(`${BASE_URL}/courses/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) setDbCourses(prev => prev.filter(c => c._id !== id));
      else alert(data.message || "Delete failed");
    } catch { alert("Delete failed"); }
  };

  const handleSave = (savedCourse, originalStaticId) => {
    if (originalStaticId) {
      hideStatic(originalStaticId);
      setDbCourses(prev => [...prev, savedCourse]);
    } else if (modal?.mode === "edit") {
      setDbCourses(prev => prev.map(c => c._id === savedCourse._id ? savedCourse : c));
    } else {
      setDbCourses(prev => [...prev, savedCourse]);
    }
    setModal(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", color: "#0B2545" }}>

      {/* hero strip */}
      <div className="pt-28 pb-14 px-6 lg:px-8 text-center" style={{ background: "#ffffff" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto"
        >
          <span
            className="inline-block mb-4 px-4 py-1 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ background: "#fff7ed", color: "#F77F00" }}
          >
            Course Catalogue
          </span>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: "#0B2545", fontFamily: "'Outfit', system-ui, sans-serif" }}>
            Pick your path to<br />
            <span style={{ color: "#F77F00" }}>SSC selection.</span>
          </h1>
          <p className="text-lg" style={{ color: "#6b7280" }}>
            Every major SSC exam, covered with structured courses, mock tests, and mentor support.
          </p>
        </motion.div>
      </div>

      {/* grid section */}
      <div className="px-6 lg:px-8 pb-20" style={{ background: "#f9fafb" }}>
        <div className="max-w-7xl mx-auto pt-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allCourses.map((c, i) => (
              <CourseCard
                key={c._id}
                course={c}
                index={i}
                isAdmin={isAdmin}
                onEdit={course => setModal({ mode: "edit", course })}
                onDelete={handleDelete}
                onEnter={id => navigate(`/courses/${id}`)}
              />
            ))}
            {isAdmin && <AddCourseCard onClick={() => setModal({ mode: "add" })} index={allCourses.length} />}
          </div>
        </div>
      </div>

      {modal && (
        <CourseModal
          course={modal.mode === "edit" ? modal.course : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Courses;
