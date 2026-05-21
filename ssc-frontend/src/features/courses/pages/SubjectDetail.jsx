import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, BASE_URL } from "@/context/AuthContext";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiFileText, FiVideo } from "react-icons/fi";
import "@/styles/courseDetail.css";

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return url;
}

function isIframeable(url) {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com") || url.includes("drive.google.com");
}

function VideoPlayer({ url }) {
  if (!url) return null;
  const embed = getEmbedUrl(url);
  if (isIframeable(url)) {
    return (
      <div className="cdVideoWrapper">
        <iframe src={embed} title="video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      </div>
    );
  }
  return <div className="cdVideoWrapper"><video src={url} controls /></div>;
}

function BlockCard({ block, isAdmin, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cdBlock">
      <div className="cdBlockHeader" onClick={() => setOpen(o => !o)}>
        <span className="cdBlockTitle">{block.title}</span>
        <div className="cdBlockActions">
          {isAdmin && (
            <>
              <button className="cdIconBtn" onClick={e => { e.stopPropagation(); onEdit(block); }} title="Edit"><FiEdit2 size={15} /></button>
              <button className="cdIconBtn danger" onClick={e => { e.stopPropagation(); onDelete(block._id); }} title="Delete"><FiTrash2 size={15} /></button>
            </>
          )}
          <span className="cdChevron">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className="cdBlockBody">
          {block.description && <p className="cdBlockDesc">{block.description}</p>}
          {block.videoUrl && <VideoPlayer url={block.videoUrl} />}
          {block.pdfUrl && (
            <a className="cdPdfBtn" href={block.pdfUrl} target="_blank" rel="noreferrer">
              <FiFileText size={16} /> Download Notes (PDF)
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function BlockModal({ block, cardId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: block?.title || "",
    description: block?.description || "",
    videoUrl: block?.videoUrl || "",
    pdfUrl: block?.pdfUrl || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handlePdfUpload = async (file) => {
    setUploading(true); setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${BASE_URL}/upload-file`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (data.success) setForm(f => ({ ...f, pdfUrl: data.url }));
      else setError("PDF upload failed: " + data.message);
    } catch { setError("PDF upload failed"); }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const isEdit = !!block?._id;
      const url = isEdit
        ? `${BASE_URL}/subject-cards/${cardId}/blocks/${block._id}`
        : `${BASE_URL}/subject-cards/${cardId}/blocks`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onSaved(data.block, isEdit);
      else setError(data.message || "Failed");
    } catch { setError("Server error"); }
    setSaving(false);
  };

  return (
    <div className="cdModalOverlay" onClick={onClose}>
      <div className="cdModalBox" onClick={e => e.stopPropagation()}>
        <div className="cdModalHeader">
          <h2>{block ? "Edit Block" : "Add Block"}</h2>
          <button className="cdModalClose" onClick={onClose}>✕</button>
        </div>
        {error && <p className="cdModalError">{error}</p>}
        <div className="cdModalBody">
          <label>Title *</label>
          <input placeholder="e.g. Algebra Basics" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          <label>Description</label>
          <textarea rows={3} placeholder="Short description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <label>Video URL <span className="cdLabelHint">(YouTube / Vimeo / Google Drive / MP4)</span></label>
          <div className="cdVideoInputRow">
            <FiVideo size={16} className="cdInputIcon" />
            <input placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} />
          </div>
          {form.videoUrl && <div className="cdVideoPreview"><VideoPlayer url={form.videoUrl} /></div>}
          <label>Notes PDF</label>
          <div className="cdPdfRow">
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePdfUpload(e.target.files[0])} />
            <button type="button" className="cdUploadBtn" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? "Uploading…" : form.pdfUrl ? "Replace PDF" : "Upload PDF"}
            </button>
            {form.pdfUrl && (
              <a href={form.pdfUrl} target="_blank" rel="noreferrer" className="cdPdfLink">
                <FiFileText size={14} /> View uploaded PDF
              </a>
            )}
          </div>
        </div>
        <div className="cdModalFooter">
          <button className="cdCancelBtn" onClick={onClose}>Cancel</button>
          <button className="cdSaveBtn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : block ? "Update Block" : "Add Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roleLevel >= 10 || user?.role === "admin";

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockModal, setBlockModal] = useState(null);

  useEffect(() => { fetchCard(); }, [id]);

  const fetchCard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/subject-cards/${id}`);
      const data = await res.json();
      if (data.success) setCard(data.card);
      else setError(data.message || "Subject not found");
    } catch { setError("Failed to load subject"); }
    setLoading(false);
  };

  const handleBlockSaved = (savedBlock, isEdit) => {
    setCard(prev => {
      const blocks = isEdit
        ? prev.blocks.map(b => b._id === savedBlock._id ? savedBlock : b)
        : [...prev.blocks, savedBlock];
      return { ...prev, blocks };
    });
    setBlockModal(null);
  };

  const handleBlockDelete = async (blockId) => {
    if (!window.confirm("Delete this block?")) return;
    try {
      const res = await fetch(`${BASE_URL}/subject-cards/${id}/blocks/${blockId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) setCard(prev => ({ ...prev, blocks: prev.blocks.filter(b => b._id !== blockId) }));
      else alert(data.message || "Delete failed");
    } catch { alert("Delete failed"); }
  };

  if (loading) return <div className="cdLoadingPage"><div className="cdSpinner" /></div>;
  if (error) return <div className="cdErrorPage"><p>{error}</p><button onClick={() => navigate("/")}>← Back</button></div>;

  const sortedBlocks = [...(card.blocks || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="cdPage">
      <div className="cdHero">
        <button className="cdBackBtn" onClick={() => navigate("/")}>
          <FiArrowLeft size={16} /> Back to Home
        </button>
        {card.imageUrl && <img src={card.imageUrl} alt={card.name} className="cdHeroImg" />}
        <div className="cdHeroInfo">
          <h1>{card.name}</h1>
          {card.description && <p>{card.description}</p>}
        </div>
      </div>

      <div className="cdContent">
        <div className="cdSectionHeader">
          <h2>Study Materials</h2>
          {isAdmin && (
            <button className="cdAddBlockBtn" onClick={() => setBlockModal({ mode: "add" })}>
              <FiPlus size={16} /> Add Block
            </button>
          )}
        </div>

        {sortedBlocks.length === 0 ? (
          <div className="cdEmpty">
            <p>No blocks yet.{isAdmin ? " Click \"Add Block\" to get started." : " Check back soon!"}</p>
          </div>
        ) : (
          <div className="cdBlockList">
            {sortedBlocks.map(b => (
              <BlockCard
                key={b._id}
                block={b}
                isAdmin={isAdmin}
                onEdit={block => setBlockModal({ mode: "edit", block })}
                onDelete={handleBlockDelete}
              />
            ))}
          </div>
        )}
      </div>

      {blockModal && (
        <BlockModal
          block={blockModal.mode === "edit" ? blockModal.block : null}
          cardId={id}
          onClose={() => setBlockModal(null)}
          onSaved={handleBlockSaved}
        />
      )}
    </div>
  );
}

export default SubjectDetail;
