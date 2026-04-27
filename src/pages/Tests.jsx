import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL, useAuth } from "../context/AuthContext.jsx";
import "../styles/tests.css";

const IconFile = () => (
<svg viewBox="0 0 24 24">
<path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
<path d="M8 3v5h5"/>
</svg>
);

const IconPlay = () => (
<svg viewBox="0 0 24 24">
<polygon points="8,6 18,12 8,18"/>
</svg>
);

const IconClock = () => (
<svg viewBox="0 0 24 24">
<circle cx="12" cy="12" r="9"/>
<path d="M12 7v5l3 3"/>
</svg>
);

const IconRefresh = () => (
<svg viewBox="0 0 24 24">
<path d="M21 12a9 9 0 0 1-15.5 6.36L3 16"/>
<path d="M3 12A9 9 0 0 1 18.5 5.64L21 8"/>
</svg>
);

const IconPlus = () => (
<svg viewBox="0 0 24 24">
<path d="M12 5v14"/>
<path d="M5 12h14"/>
</svg>
);

const formatDateTime=(date)=>
new Intl.DateTimeFormat("en-IN",{
day:"2-digit",
month:"short",
hour:"2-digit",
minute:"2-digit"
}).format(new Date(date));


function Tests(){

const {user}=useAuth();
const navigate=useNavigate();
const location=useLocation();

const [tests,setTests]=useState([]);
const [loading,setLoading]=useState(true);
const [message,setMessage]=useState("");
const [submitToast,setSubmitToast]=useState(location.state?.submitted ? location.state : null);
const [selectedSubject, setSelectedSubject] = useState("all");
const [selectedCategory, setSelectedCategory] = useState(null);
const [subjectView, setSubjectView] = useState(null); // drill-in subject
const [mockTab, setMockTab] = useState("full");
const [searchQuery, setSearchQuery] = useState("");
const [categories, setCategories] = useState([]);
const [catLoading, setCatLoading] = useState(false);

// inline add forms
const [showAddCat, setShowAddCat] = useState(false);
const [newCatName, setNewCatName] = useState("");
const [newCatIcon, setNewCatIcon] = useState("📝");
const [addCatLoading, setAddCatLoading] = useState(false);

const [showAddSubj, setShowAddSubj] = useState(false);
const [newSubjName, setNewSubjName] = useState("");
const [newSubjIcon, setNewSubjIcon] = useState("📚");
const [addSubjLoading, setAddSubjLoading] = useState(false);

const fetchCategories = async () => {
  setCatLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category`, { credentials: "include" });
    const data = await res.json();
    if (data.success) setCategories(data.categories || []);
  } catch (err) {
    console.error(err);
  } finally {
    setCatLoading(false);
  }
};

const handleAddCategory = async () => {
  if (!newCatName.trim()) return;
  setAddCatLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon }),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => [...prev, data.category]);
      setNewCatName(""); setNewCatIcon("📝"); setShowAddCat(false);
    } else alert(data.message);
  } catch (err) { console.error(err); }
  finally { setAddCatLoading(false); }
};

const handleDeleteCategory = async (catId) => {
  if (!window.confirm("Delete this category and all its subjects?")) return;
  try {
    await fetch(`${BASE_URL}/category/${catId}`, { method: "DELETE", credentials: "include" });
    setCategories(prev => prev.filter(c => c._id !== catId));
    if (selectedCategory?._id === catId) { setSelectedCategory(null); setSelectedSubject("all"); }
  } catch (err) { console.error(err); }
};

const handleAddSubject = async () => {
  if (!newSubjName.trim() || !selectedCategory) return;
  setAddSubjLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newSubjName.trim(), icon: newSubjIcon }),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      setSelectedCategory(data.category);
      setNewSubjName(""); setNewSubjIcon("📚"); setShowAddSubj(false);
    } else alert(data.message);
  } catch (err) { console.error(err); }
  finally { setAddSubjLoading(false); }
};

const handleDeleteSubject = async (subId) => {
  if (!selectedCategory) return;
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects/${subId}`, {
      method: "DELETE", credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      setSelectedCategory(data.category);
      if (selectedSubject === subId) setSelectedSubject("all");
    }
  } catch (err) { console.error(err); }
};

// Filter tests by subject
// Main list: only tests NOT linked to any subject
const filteredTests = tests.filter(test => !test.subject);

useEffect(()=>{
if(submitToast){
const t=setTimeout(()=>setSubmitToast(null),5000);
return ()=>clearTimeout(t);
}
},[submitToast]);

const [resultsData,setResultsData]=useState(null);
const [resultsLoading,setResultsLoading]=useState(false);
const [deleteLoadingId,setDeleteLoadingId]=useState(null);


const fetchTests=async()=>{

setLoading(true);

try{

const res=await fetch(`${BASE_URL}/quiz/all`);
const data=await res.json();

if(data.success){
setTests(data.quizzes||[]);
setMessage("");
}
else{
setTests([]);
setMessage(data.message||"No quizzes found");
}

}catch(err){
console.error(err);
setMessage("Unable to load quizzes");
}
finally{
setLoading(false);
}

};


useEffect(()=>{
fetchTests();
fetchCategories();
},[]);


const [,setTick]=useState(0);

useEffect(()=>{

const interval=setInterval(()=>{
setTick(t=>t+1);
},1000);

return ()=>clearInterval(interval);

},[]);


const getStatus=(quiz)=>{
if(!quiz.scheduledAt) return "draft";

return new Date()<new Date(quiz.scheduledAt)
? "upcoming"
: "live";
};


const getRemainingTime=(date)=>{

const diff=new Date(date)-new Date();

if(diff<=0) return null;

const h=Math.floor(diff/(1000*60*60));
const m=Math.floor((diff/(1000*60))%60);
const s=Math.floor((diff/1000)%60);

return `${h}h ${m}m ${s}s`;

};


const handleStartQuiz=(id=null)=>{

const url=id
? `/mock-test/${id}`
: "/exam";

if(!user){
navigate("/login",{state:{redirectTo:url}});
return;
}

navigate(url);

};


const handleCreateQuiz=()=>{

if(!user){
navigate("/login");
return;
}

navigate("/create-quiz");

};


const handleDeleteQuiz=async(id)=>{

if(!window.confirm("Delete this quiz?")) return;

setDeleteLoadingId(id);

try{

const res=await fetch(
`${BASE_URL}/quiz/${id}`,
{
method:"DELETE",
credentials:"include"
}
);

const data=await res.json();

if(!data.success){
alert(data.message);
return;
}

fetchTests();

}catch(err){
console.error(err);
alert("Delete failed");
}
finally{
setDeleteLoadingId(null);
}

};


const handleViewResults=async(id)=>{

setResultsLoading(true);

try{

const res=await fetch(
`${BASE_URL}/quiz/${id}/submissions`,
{
credentials:"include"
}
);

const data=await res.json();

if(data.success){
setResultsData(data);
}

}catch(err){
console.error(err);
}
finally{
setResultsLoading(false);
}

};



/* ADMIN CHECK FIXED */
const isAdmin=
user?.email==="demo.admin@ssc.test" ||
user?.role==="admin" ||
user?.roleLevel===10;



const liveCount =
filteredTests.filter(t=>getStatus(t)==="live").length;

const upcomingCount =
filteredTests.filter(t=>getStatus(t)==="upcoming").length;

// ── Subject drill-in view ──────────────────────────────────────
const MOCK_TABS = [
  { id: "full",         label: "Full Mocks" },
  { id: "sectional",    label: "Sectionals" },
  { id: "subject_wise", label: "Subject Wise" },
];

if (subjectView) {
  const subjectTests = tests.filter(t => t.subject?.toString() === subjectView._id?.toString());
  const tabTests = subjectTests
    .filter(t => t.mockType === mockTab)
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="pc-page">
      {/* Header */}
      <div className="sv-header">
        <button className="sv-back" onClick={() => setSubjectView(null)}>
          ← {selectedCategory?.name || "Back"}
        </button>
        <h2 className="sv-title">{subjectView.icon} {subjectView.name}</h2>
        {isAdmin && (
          <button
            className="pc-primary-btn sv-create-btn"
            onClick={() => navigate(
              `/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}`,
              { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab } }
            )}
          >
            <IconPlus/> <span>{{ full: "Full Mock", sectional: "Sectional", subject_wise: "Subject Wise" }[mockTab] || "Mock"}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <input
        className="sv-search"
        placeholder="Search by mock name..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      {/* Mock type tabs */}
      <div className="sv-tabs">
        {MOCK_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sv-tab${mockTab === tab.id ? " active" : ""}`}
            onClick={() => setMockTab(tab.id)}
          >
            {tab.label}
            <span className="sv-tab-count">
              ({subjectTests.filter(t => t.mockType === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      <div className="pc-divider"/>

      {/* Test list */}
      {tabTests.length === 0 && (
        <div className="sv-empty">
          <p>No {MOCK_TABS.find(t=>t.id===mockTab)?.label} found.</p>
          {isAdmin && (
            <button
              className="pc-primary-btn sv-empty-create"
              onClick={() => navigate(
                `/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}`,
                { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab } }
              )}
            >
              <IconPlus/> Create {{ full: "Full Mock", sectional: "Sectional", subject_wise: "Subject Wise" }[mockTab] || "Mock"}
            </button>
          )}
        </div>
      )}

      {tabTests.map(test => {
        const status = getStatus(test);
        return (
          <article key={test._id} className="pc-test-card">
            <div>
              <div className={`pc-badge-live pc-badge-${status}`}>{status}</div>
              <h2 className="pc-test-title">{test.title}</h2>
              <p className="pc-test-desc">
                {test.scheduledAt ? formatDateTime(test.scheduledAt) : "Practice anytime"}
              </p>
            </div>
            <div className="pc-card-actions">
              {isAdmin && (
                <div className="pc-admin-actions">
                  <button className="pc-admin-btn" onClick={() => navigate(`/create-quiz?edit=${test._id}&subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}`)}>Edit</button>
                  <button className="pc-admin-btn danger" onClick={() => handleDeleteQuiz(test._id)}>
                    {deleteLoadingId === test._id ? "Deleting" : "Delete"}
                  </button>
                  <button className="pc-admin-btn" onClick={() => handleViewResults(test._id)}>Results</button>
                </div>
              )}
              {status === "upcoming" ? (
                <div className="pc-countdown"><IconClock/><span>{getRemainingTime(test.scheduledAt)}</span></div>
              ) : (() => {
                const subKey = `submitted_${user?.email}_${test._id}`;
                const subData = localStorage.getItem(subKey);
                if (!isAdmin && subData) {
                  const parsed = JSON.parse(subData);
                  return (
                    <button className="pc-exam-btn pc-result-btn"
                      onClick={() => navigate("/result", { state: { score: parsed.score, sectionTitle: parsed.quizTitle, breakdown: parsed.breakdown ?? [], language: parsed.language ?? "en" } })}>
                      <IconFile/><span>View Result</span>
                    </button>
                  );
                }
                return (
                  <button className="pc-exam-btn" onClick={() => handleStartQuiz(test._id)}>
                    <IconPlay/><span>Start Quiz</span>
                  </button>
                );
              })()}
            </div>
          </article>
        );
      })}

      {/* Results modal */}
      {resultsData && (
        <div className="pc-modal-backdrop" onClick={() => setResultsData(null)}>
          <div className="pc-results-modal" onClick={e => e.stopPropagation()}>
            <h2>Student Results</h2>
            {resultsData?.submissions?.length > 0 && (
              <table className="pc-results-table">
                <thead><tr><th>Student</th><th>Marks</th><th>Submitted</th></tr></thead>
                <tbody>
                  {resultsData.submissions.map(sub => (
                    <tr key={sub._id}>
                      <td>{sub.email}</td><td>{sub.score}</td><td>{formatDateTime(sub.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
// ── end subject view ───────────────────────────────────────────

return(

<main className="pc-page">

{submitToast && (
<div className="pc-submit-toast">
  ✓ <strong>{submitToast.quizTitle || "Exam"}</strong> submitted! Your score: <strong>{submitToast.score}</strong>
  <button onClick={()=>setSubmitToast(null)}>×</button>
</div>
)}

<section>

<div className="pc-topbar">

<h1 className="pc-title">
Tests
</h1>


<div className="pc-toolbar">

<div className="pc-chips">

<div className="pc-chip">
<IconFile/>
<span>{tests.length+1} total</span>
</div>

<div className="pc-chip">
<IconPlay/>
<span>{liveCount+1} live</span>
</div>

<div className="pc-chip">
<IconClock/>
<span>{upcomingCount} upcoming</span>
</div>

</div>


<div className="pc-actions">

<button
className="pc-icon-btn"
onClick={fetchTests}
disabled={loading}
>
<IconRefresh/>
</button>

</div>

</div>

</div>



<div className="pc-divider"/>

{/* CATEGORY LABEL */}
<div className="cat-section">
  <div className="cat-label">
    {selectedCategory
      ? <button className="cat-back-btn" onClick={() => { setSelectedCategory(null); setSelectedSubject("all"); }}>← Back to Categories</button>
      : "Exam Categories"}
  </div>
  {isAdmin && showAddCat && (
    <div className="cat-inline-form" style={{ marginTop: 8 }}>
      <input className="cat-form-emoji" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} maxLength={2} placeholder="📝" />
      <input className="cat-form-input" placeholder="Category name" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCategory()} autoFocus />
      <button className="cat-form-save" onClick={handleAddCategory} disabled={addCatLoading}>{addCatLoading ? "..." : "Add"}</button>
      <button className="cat-form-cancel" onClick={() => { setShowAddCat(false); setNewCatName(""); }}>✕</button>
    </div>
  )}
</div>

{/* CATEGORY CARDS (shown when no category selected) */}
{!selectedCategory && (
  <div className="subject-cards-container cat-cards-grid">
    {categories.map(cat => (
      <div
        key={cat._id}
        className="subject-card"
        style={{ "--subject-color": cat.color }}
        onClick={() => { setSelectedCategory(cat); setSelectedSubject("all"); }}
      >
        {isAdmin && (
          <button
            className="subj-del-btn"
            onClick={e => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
            title="Delete category"
          >×</button>
        )}
        <span className="subject-card-icon">{cat.icon}</span>
        <span className="subject-card-name">{cat.name}</span>
        <span className="subject-card-count">
          {cat.subjects?.length ?? 0} subjects
        </span>
      </div>
    ))}
    {isAdmin && (
      <div
        className="subject-card subj-add-card"
        onClick={() => setShowAddCat(true)}
        style={{ "--subject-color": "#64748b" }}
      >
        <span className="subject-card-icon">➕</span>
        <span className="subject-card-name">Add Category</span>
      </div>
    )}
  </div>
)}

{/* SUBJECT CARDS (shown when category selected) */}
{selectedCategory && (
  <div className="subject-cards-container">
    {selectedCategory.subjects.map(subj => (
      <div
        key={subj._id}
        className={`subject-card${selectedSubject === subj._id ? " active" : ""}`}
        style={{ "--subject-color": subj.color }}
        onClick={() => { setSubjectView(subj); setMockTab("full"); setSearchQuery(""); }}
      >
        {isAdmin && (
          <button
            className="subj-del-btn"
            onClick={e => { e.stopPropagation(); handleDeleteSubject(subj._id); }}
            title="Delete subject"
          >×</button>
        )}
        <span className="subject-card-icon">{subj.icon}</span>
        <span className="subject-card-name">{subj.name}</span>
        <span className="subject-card-count">
          {tests.filter(t => t.subject?.toString() === subj._id?.toString()).length}
        </span>
      </div>
    ))}

    {isAdmin && !showAddSubj && (
      <div
        className="subject-card subj-add-card"
        onClick={() => setShowAddSubj(true)}
        style={{ "--subject-color": "#64748b" }}
      >
        <span className="subject-card-icon">➕</span>
        <span className="subject-card-name">Add Subject</span>
      </div>
    )}

    {isAdmin && showAddSubj && (
      <div className="subj-inline-form">
        <input
          className="cat-form-emoji"
          value={newSubjIcon}
          onChange={e => setNewSubjIcon(e.target.value)}
          maxLength={2}
          placeholder="📚"
        />
        <input
          className="cat-form-input"
          placeholder="Subject name"
          value={newSubjName}
          onChange={e => setNewSubjName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddSubject()}
          autoFocus
        />
        <button className="cat-form-save" onClick={handleAddSubject} disabled={addSubjLoading}>
          {addSubjLoading ? "..." : "Add"}
        </button>
        <button className="cat-form-cancel" onClick={() => { setShowAddSubj(false); setNewSubjName(""); }}>✕</button>
      </div>
    )}
  </div>
)}

<div className="pc-divider"/>



{resultsData && (

<div
className="pc-modal-backdrop"
onClick={()=>setResultsData(null)}
>

<div
className="pc-results-modal"
onClick={(e)=>e.stopPropagation()}
>

<h2>
Student Results
</h2>

{resultsLoading && (
<p>Loading...</p>
)}


{resultsData?.submissions?.length>0 && (

<table className="pc-results-table">

<thead>
<tr>
<th>Student</th>
<th>Marks</th>
<th>Submitted</th>
</tr>
</thead>

<tbody>

{resultsData.submissions.map(sub=>(
<tr key={sub._id}>
<td>{sub.email}</td>
<td>
{sub.score}
</td>
<td>
{formatDateTime(sub.submittedAt)}
</td>
</tr>
))}

</tbody>

</table>

)}

</div>

</div>

)}

</section>

</main>

);

}

export default Tests;