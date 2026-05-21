import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import "@/styles/manageSubjectCards.css";

function LiveCardPreview({ name, description, imageUrl }) {
  return (
    <div className="msc-live-card">
      <div className="msc-live-card-img-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="msc-live-card-img" />
        ) : (
          <div className="msc-live-card-img-placeholder">📷 No image</div>
        )}
      </div>
      <div className="msc-live-card-content">
        <h3>{name || <span style={{ color: "#bbb" }}>Card Name</span>}</h3>
        <p>{description || <span style={{ color: "#bbb" }}>Short description will appear here.</span>}</p>
        <button className="msc-live-start-btn">Start</button>
      </div>
    </div>
  );
}

function ManageSubjectCards() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "info" });
  const [editId, setEditId] = useState(null);

  const blankForm = { name: "", description: "", imageUrl: "", order: 0 };
  const [form, setForm] = useState(blankForm);

  const fileRef = useRef(null);

  const isAdmin = user?.roleLevel >= 10 || user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/subject-cards`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCards(data.cards);
    } catch { /**/ }
    setLoading(false);
  };

  const flash = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "info" }), 3000);
  };

  const handleUploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    setUploadingId("form");
    try {
      const res = await fetch(`${BASE_URL}/upload-image`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (data.success) setForm((f) => ({ ...f, imageUrl: data.url }));
      else flash("Image upload failed: " + data.message, "error");
    } catch { flash("Image upload error", "error"); }
    setUploadingId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { flash("Card name is required", "error"); return; }
    setSaving(true);
    try {
      const url = editId ? `${BASE_URL}/subject-cards/${editId}` : `${BASE_URL}/subject-cards`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        flash(editId ? "Card updated!" : "Card added!", "success");
        setForm(blankForm);
        setEditId(null);
        fetchCards();
      } else flash(data.message || "Error", "error");
    } catch { flash("Server error", "error"); }
    setSaving(false);
  };

  const handleEdit = (card) => {
    setEditId(card._id);
    setForm({ name: card.name, description: card.description, imageUrl: card.imageUrl, order: card.order });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this card from the home page?")) return;
    try {
      const res = await fetch(`${BASE_URL}/subject-cards/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) { fetchCards(); flash("Card deleted", "info"); }
      else flash(data.message || "Cannot delete: This subject has quizzes linked to it.", "error");
    } catch { flash("Delete error", "error"); }
  };

  const cancelEdit = () => { setEditId(null); setForm(blankForm); };

  return (
    <div className="msc-page">

      {/* Page header */}
      <div className="msc-page-header">
        <button className="msc-back-btn" onClick={() => navigate("/tests")}>← Back to Tests</button>
        <div>
          <h1>Home Page Subject Cards</h1>
          <p>Add, edit or remove the subject cards shown on the home page.</p>
        </div>
      </div>

      {msg.text && <div className={`msc-toast msc-toast-${msg.type}`}>{msg.text}</div>}

      {/* Editor: form + live preview side by side */}
      <div className="msc-editor">
        <div className="msc-form-box">
          <h2>{editId ? "✏️ Edit Card" : "➕ Add New Card"}</h2>

          <label>Card Name *</label>
          <input
            className="msc-input"
            placeholder="e.g. Mathematics"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <label>Short Description</label>
          <textarea
            className="msc-input msc-textarea"
            placeholder="e.g. Practice SSC Math with quizzes and tests."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />

          <label>Card Image</label>
          <div className="msc-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files[0] && handleUploadImage(e.target.files[0])}
            />
            <button
              className="msc-btn msc-btn-upload"
              onClick={() => fileRef.current.click()}
              disabled={uploadingId === "form"}
            >
              {uploadingId === "form" ? "Uploading…" : "📁 Upload Image"}
            </button>
            <span className="msc-or">or</span>
            <input
              className="msc-input msc-url-input"
              placeholder="Paste image URL…"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
          {form.imageUrl && (
            <button className="msc-remove-img" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}>✕ Remove image</button>
          )}

          <label>Display Order <span className="msc-hint">(lower = first)</span></label>
          <input
            className="msc-input msc-order"
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          />

          <div className="msc-form-actions">
            <button className="msc-btn msc-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editId ? "Update Card" : "Add Card"}
            </button>
            {editId && (
              <button className="msc-btn msc-btn-cancel" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="msc-preview-panel">
          <p className="msc-preview-label">Live Preview</p>
          <LiveCardPreview
            name={form.name}
            description={form.description}
            imageUrl={form.imageUrl}
          />
        </div>
      </div>

      {/* Existing cards */}
      <div className="msc-cards-section">
        <h2>Current Cards <span className="msc-count">({cards.length})</span></h2>
        {loading ? (
          <p className="msc-loading">Loading…</p>
        ) : cards.length === 0 ? (
          <p className="msc-empty">No cards yet — add one above.</p>
        ) : (
          <div className="msc-cards-grid">
            {cards.map((card) => {
              const quizCount = card.quizCount || 0;
              const hasQuizzes = quizCount > 0;
              return (
                <div key={card._id} className={`msc-card ${editId === card._id ? "msc-card-editing" : ""}`}>
                  {card.imageUrl ? (
                    <img src={card.imageUrl} className="msc-card-img" alt={card.name} />
                  ) : (
                    <div className="msc-card-no-img">📷 No Image</div>
                  )}
                  <div className="msc-card-body">
                    <h3>{card.name}</h3>
                    <p>{card.description || <em style={{ color: "#bbb" }}>No description</em>}</p>
                    <span className="msc-card-order">Order: {card.order}</span>
                    {hasQuizzes && <span className="msc-card-quiz-count">📝 {quizCount} quiz{quizCount !== 1 ? "zes" : ""}</span>}
                  </div>
                  <div className="msc-card-actions">
                    <button className="msc-btn msc-btn-edit" onClick={() => handleEdit(card)}>✏️ Edit</button>
                    <button 
                      className="msc-btn msc-btn-delete" 
                      onClick={() => handleDelete(card._id)}
                      disabled={hasQuizzes}
                      title={hasQuizzes ? `Cannot delete: ${quizCount} quiz(es) linked` : "Delete"}
                      style={{ opacity: hasQuizzes ? 0.5 : 1, cursor: hasQuizzes ? "not-allowed" : "pointer" }}
                    >🗑 Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSubjectCards;
