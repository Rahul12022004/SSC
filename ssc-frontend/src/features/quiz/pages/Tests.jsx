import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL, useAuth } from "@/context/AuthContext";
import QuizSettingsDropdown from "@/common/components/QuizSettingsDropdown";
import "@/styles/tests.css";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
const messageRef=useRef("");
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

const [subSubjectView, setSubSubjectView] = useState(null);
const [showAddSubSub, setShowAddSubSub] = useState(false);
const [newSubSubName, setNewSubSubName] = useState("");
const [newSubSubIcon, setNewSubSubIcon] = useState("📖");
const [addSubSubLoading, setAddSubSubLoading] = useState(false);

const [mockGroupView, setMockGroupView] = useState(null);
const [showAddMockGroup, setShowAddMockGroup] = useState(false);
const [newMockGroupName, setNewMockGroupName] = useState("");
const [newMockGroupIcon, setNewMockGroupIcon] = useState("📋");
const [addMockGroupLoading, setAddMockGroupLoading] = useState(false);

const [moveQuiz, setMoveQuiz] = useState(null);
const [moveTargetCatId, setMoveTargetCatId] = useState("");
const [moveTargetSubjId, setMoveTargetSubjId] = useState("");
const [moveTargetGroupId, setMoveTargetGroupId] = useState("");
const [moveLoading, setMoveLoading] = useState(false);

const openMoveModal = (test) => {
  setMoveQuiz(test);
  setMoveTargetCatId("");
  setMoveTargetSubjId("");
  setMoveTargetGroupId("");
};

const handleMoveQuiz = async () => {
  if (!moveQuiz || !moveTargetCatId || !moveTargetSubjId) return;
  setMoveLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/quiz/${moveQuiz._id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({
        subject:      moveTargetSubjId || null,
        categoryId:   moveTargetCatId  || null,
        mockGroupId:  moveTargetGroupId || null,
        subSubjectId: null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMoveQuiz(null);
      fetchTests();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setMoveLoading(false);
  }
};

const fetchCategories = async () => {
  setCatLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category`, { credentials: "include", headers: authHeaders() });
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
      headers: { "Content-Type": "application/json", ...authHeaders() },
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
    await fetch(`${BASE_URL}/category/${catId}`, { method: "DELETE", credentials: "include", headers: authHeaders() });
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
      headers: { "Content-Type": "application/json", ...authHeaders() },
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
      method: "DELETE", credentials: "include", headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      setSelectedCategory(data.category);
      if (selectedSubject === subId) setSelectedSubject("all");
    }
  } catch (err) { console.error(err); }
};

const handleAddSubSubject = async () => {
  if (!newSubSubName.trim() || !subjectView || !selectedCategory) return;
  setAddSubSubLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects/${subjectView._id}/subsubjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ name: newSubSubName.trim(), icon: newSubSubIcon }),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      const updatedSubj = data.category.subjects.find(s => s._id.toString() === subjectView._id.toString());
      if (updatedSubj) setSubjectView(updatedSubj);
      setSelectedCategory(data.category);
      setNewSubSubName(""); setNewSubSubIcon("📖"); setShowAddSubSub(false);
    } else alert(data.message);
  } catch (err) { console.error(err); }
  finally { setAddSubSubLoading(false); }
};

const handleDeleteSubSubject = async (subSubId) => {
  if (!subjectView || !selectedCategory) return;
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects/${subjectView._id}/subsubjects/${subSubId}`, {
      method: "DELETE", credentials: "include", headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      const updatedSubj = data.category.subjects.find(s => s._id.toString() === subjectView._id.toString());
      if (updatedSubj) setSubjectView(updatedSubj);
      setSelectedCategory(data.category);
      if (subSubjectView?._id?.toString() === subSubId) setSubSubjectView(null);
    }
  } catch (err) { console.error(err); }
};

const handleAddMockGroup = async () => {
  if (!newMockGroupName.trim() || !subjectView || !selectedCategory) return;
  setAddMockGroupLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects/${subjectView._id}/mockgroups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ name: newMockGroupName.trim(), icon: newMockGroupIcon, mockType: mockTab }),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      const updatedSubj = data.category.subjects.find(s => s._id.toString() === subjectView._id.toString());
      if (updatedSubj) setSubjectView(updatedSubj);
      setSelectedCategory(data.category);
      setNewMockGroupName(""); setNewMockGroupIcon("📋"); setShowAddMockGroup(false);
    } else alert(data.message);
  } catch (err) { console.error(err); }
  finally { setAddMockGroupLoading(false); }
};

const handleDeleteMockGroup = async (groupId) => {
  if (!subjectView || !selectedCategory) return;
  try {
    const res = await fetch(`${BASE_URL}/category/${selectedCategory._id}/subjects/${subjectView._id}/mockgroups/${groupId}`, {
      method: "DELETE", credentials: "include", headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
      const updatedSubj = data.category.subjects.find(s => s._id.toString() === subjectView._id.toString());
      if (updatedSubj) setSubjectView(updatedSubj);
      setSelectedCategory(data.category);
      if (mockGroupView?._id?.toString() === groupId) setMockGroupView(null);
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
      messageRef.current="";
    }
    else{
      setTests([]);
      messageRef.current=data.message||"No quizzes found";
    }
  }catch(err){
    console.error(err);
    messageRef.current="Unable to load quizzes";
  }
  finally{
    setLoading(false);
  }
};

const fetchCategoriesData = async () => {
  setCatLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/category`, { credentials: "include", headers: authHeaders() });
    const data = await res.json();
    if (data.success) setCategories(data.categories || []);
  } catch (err) {
    console.error(err);
  } finally {
    setCatLoading(false);
  }
};

useEffect(()=>{
  Promise.all([fetchTests(), fetchCategoriesData()]);
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

const getQuizEndTime=(test)=>{
  if(test.endsAt) return new Date(test.endsAt);
  return null;
};

const isQuizEnded=(test)=>{
  const end=getQuizEndTime(test);
  return end ? new Date()>end : false;
};

const formatEndsAt=(test)=>{
  if(!test.endsAt) return null;
  return new Intl.DateTimeFormat("en-IN",{
    day:"2-digit", month:"short",
    hour:"2-digit", minute:"2-digit"
  }).format(new Date(test.endsAt));
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

navigate("/admin/create-quiz");

};


const handleDeleteQuiz=async(id)=>{

if(!window.confirm("Delete this quiz?")) return;

setDeleteLoadingId(id);

try{

const res=await fetch(
`${BASE_URL}/quiz/${id}`,
{
method:"DELETE",
credentials:"include",
headers:authHeaders()
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

const handleToggleFeedback = async (quizId, enabled) => {
  try {
    const res = await fetch(`${BASE_URL}/quiz/${quizId}/toggle-feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ feedbackEnabled: enabled }),
    });
    const data = await res.json();
    if (data.success) {
      fetchTests();
    } else {
      alert(data.message || "Failed to toggle feedback");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to toggle feedback");
  }
};



const isAdmin=
user?.role==="admin" ||
user?.roleLevel>=10;



const liveCount = tests.filter(t => !t.subject && getStatus(t) === "live").length;

const upcomingCount = tests.filter(t => !t.subject && getStatus(t) === "upcoming").length;

// ── Subject drill-in view ──────────────────────────────────────
const MOCK_TABS = [
  { id: "full",         label: "Full Mocks" },
  { id: "sectional",    label: "Sectionals" },
  { id: "subject_wise", label: "Subject Wise" },
];

if (subjectView) {
  const subjectTests = tests.filter(t => t.subject?.toString() === subjectView._id?.toString());
  const tabTests = subjectTests
    .filter(t => (t.mockType || "full") === mockTab)
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="pc-page">
      {/* Header */}
      <div className="sv-header">
        <button className="sv-back" onClick={() => setSubjectView(null)}>
          ← {selectedCategory?.name || "Back"}
        </button>
        <h2 className="sv-title">{subjectView.icon} {subjectView.name}</h2>
        {isAdmin && mockTab !== "subject_wise" && mockGroupView && (
          <button
            className="pc-primary-btn sv-create-btn"
            onClick={() => navigate(
              `/admin/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}&mockGroupId=${mockGroupView._id}`,
              { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab, mockGroupId: mockGroupView._id } }
            )}
          >
            <IconPlus/> <span>Create Mock</span>
          </button>
        )}
        {isAdmin && mockTab === "subject_wise" && subSubjectView && (
          <button
            className="pc-primary-btn sv-create-btn"
            onClick={() => navigate(
              `/admin/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=subject_wise&subSubjectId=${subSubjectView._id}`,
              { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab: "subject_wise", subSubjectId: subSubjectView._id } }
            )}
          >
            <IconPlus/> <span>Create Mock</span>
          </button>
        )}
      </div>

      {/* Mock type tabs */}
      <div className="sv-tabs">
        {MOCK_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sv-tab${mockTab === tab.id ? " active" : ""}`}
            onClick={() => { setMockTab(tab.id); setSubSubjectView(null); setShowAddSubSub(false); setMockGroupView(null); setShowAddMockGroup(false); }}
          >
            {tab.label}
            <span className="sv-tab-count">
              ({subjectTests.filter(t => (t.mockType || "full") === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      <div className="pc-divider"/>

      {mockTab === "subject_wise" ? (
        subSubjectView ? (
          <>
            <div className="sv-sub-header">
              <button className="sv-back sv-sub-back" onClick={() => setSubSubjectView(null)}>
                ← {subjectView.icon} {subjectView.name}
              </button>
              <span className="sv-sub-title">{subSubjectView.icon} {subSubjectView.name}</span>
            </div>
            {(() => {
              const ssTests = tests
                .filter(t => t.subSubjectId?.toString() === subSubjectView._id?.toString())
                .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));
              return (
                <>
                  {ssTests.length === 0 && (
                    <div className="sv-empty">
                      <p>No mocks found.</p>
                      {isAdmin && (
                        <button
                          className="pc-primary-btn sv-empty-create"
                          onClick={() => navigate(
                            `/admin/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=subject_wise&subSubjectId=${subSubjectView._id}`,
                            { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab: "subject_wise", subSubjectId: subSubjectView._id } }
                          )}
                        >
                          <IconPlus/> Create Mock
                        </button>
                      )}
                    </div>
                  )}
                  {ssTests.map(test => {
                    const status = getStatus(test);
                    return (
                      <article key={test._id} className="pc-test-card" style={{ position: 'relative' }}>
                        {isAdmin && (
                          <QuizSettingsDropdown
                            quiz={test}
                            onEdit={() => navigate(`/admin/create-quiz?edit=${test._id}&subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=subject_wise&subSubjectId=${subSubjectView._id}`)}
                            onMove={() => openMoveModal(test)}
                            onDelete={() => handleDeleteQuiz(test._id)}
                            onResults={() => handleViewResults(test._id)}
                            onToggleFeedback={(enabled) => handleToggleFeedback(test._id, enabled)}
                            deleteLoading={deleteLoadingId === test._id}
                          />
                        )}
                        <div>
                          <div className={`pc-badge-live pc-badge-${status}`}>{status}</div>
                          <h2 className="pc-test-title">{test.title}</h2>
                          <p className="pc-test-desc">{test.scheduledAt ? formatDateTime(test.scheduledAt) : "Practice anytime"}</p>
                        </div>
                        <div className="pc-card-actions">
                          {status === "upcoming" ? (
                            <div className="pc-countdown"><IconClock/><span>{getRemainingTime(test.scheduledAt)}</span></div>
                          ) : (() => {
                            const subKey = `submitted_${user?.email}_${test._id}`;
                            const subData = localStorage.getItem(subKey);
                            if (subData) {
                              const parsed = JSON.parse(subData);
                              return (
                                <button className="pc-exam-btn pc-result-btn"
                                  onClick={() => navigate("/result", { state: { quizId: test._id, score: parsed.score, sectionTitle: parsed.quizTitle, breakdown: parsed.breakdown ?? [], language: parsed.language ?? "en", sectionStats: parsed.sectionStats ?? [], rank: parsed.rank ?? null, totalUsers: parsed.totalUsers ?? null, percentile: parsed.percentile ?? null, rankInsight: parsed.rankInsight ?? null, endsAt: test.endsAt || null } })}>
                                  <IconFile/><span>View Result</span>
                                </button>
                              );
                            }
                            if(isQuizEnded(test)){
                              return (
                                <span style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#dc2626",fontWeight:700,background:"#fee2e2",padding:"6px 14px",borderRadius:"9999px",whiteSpace:"nowrap"}}>
                                  Quiz Ended
                                </span>
                              );
                            }
                            const endsAtLabel = formatEndsAt(test);
                            return (
                              <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                                {endsAtLabel && (
                                  <span style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"12px",color:"#b45309",fontWeight:600,background:"#fef3c7",padding:"4px 10px",borderRadius:"20px",whiteSpace:"nowrap"}}>
                                    <IconClock/> Ends {endsAtLabel}
                                  </span>
                                )}
                                <button className="pc-exam-btn" onClick={() => handleStartQuiz(test._id)}>
                                  <IconPlay/><span>Start Quiz</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </article>
                    );
                  })}
                </>
              );
            })()}
          </>
        ) : (
          <>
            {(!subjectView.subSubjects || subjectView.subSubjects.length === 0) && !showAddSubSub && (
              <div className="sv-empty">
                <p>No subjects found.</p>
                {isAdmin && (
                  <button className="pc-primary-btn sv-empty-create" onClick={() => setShowAddSubSub(true)}>
                    <IconPlus/> Create Subject
                  </button>
                )}
              </div>
            )}
            {((subjectView.subSubjects && subjectView.subSubjects.length > 0) || showAddSubSub) && (
              <div className="subject-cards-container">
                {(subjectView.subSubjects || []).map(ss => (
                  <div
                    key={ss._id}
                    className="subject-card"
                    style={{ "--subject-color": ss.color }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSubSubjectView(ss)}
                    onKeyDown={(e) => e.key === 'Enter' && setSubSubjectView(ss)}
                  >
                    {isAdmin && (
                      <button
                        className="subj-del-btn"
                        onClick={e => { e.stopPropagation(); handleDeleteSubSubject(ss._id); }}
                        title="Delete subject"
                      >×</button>
                    )}
                    <span className="subject-card-icon">{ss.icon}</span>
                    <span className="subject-card-name">{ss.name}</span>
                    <span className="subject-card-count">
                      {tests.filter(t => t.subSubjectId?.toString() === ss._id?.toString()).length} mocks
                    </span>
                  </div>
                ))}
                {isAdmin && !showAddSubSub && (
                  <div
                    className="subject-card subj-add-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowAddSubSub(true)}
                    onKeyDown={(e) => e.key === 'Enter' && setShowAddSubSub(true)}
                    style={{ "--subject-color": "#64748b" }}
                  >
                    <span className="subject-card-icon">➕</span>
                    <span className="subject-card-name">Add Subject</span>
                  </div>
                )}
                {isAdmin && showAddSubSub && (
                  <div className="subj-inline-form">
                    <input className="cat-form-emoji" value={newSubSubIcon} onChange={e => setNewSubSubIcon(e.target.value)} maxLength={2} placeholder="📖" />
                    <input className="cat-form-input" placeholder="Subject name" value={newSubSubName} onChange={e => setNewSubSubName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSubSubject()} autoFocus />
                    <button className="cat-form-save" onClick={handleAddSubSubject} disabled={addSubSubLoading}>{addSubSubLoading ? "..." : "Add"}</button>
                    <button className="cat-form-cancel" onClick={() => { setShowAddSubSub(false); setNewSubSubName(""); }}>✕</button>
                  </div>
                )}
              </div>
            )}
          </>
        )
      ) : (
        (() => {
          const tabGroups = (subjectView.mockGroups || []).filter(g => (g.mockType || "full") === mockTab);
          if (mockGroupView) {
            const groupTests = tests
              .filter(t => t.mockGroupId?.toString() === mockGroupView._id?.toString())
              .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));
            return (
              <>
                <div className="sv-sub-header">
                  <button className="sv-back sv-sub-back" onClick={() => setMockGroupView(null)}>
                    ← {subjectView.icon} {subjectView.name}
                  </button>
                  <span className="sv-sub-title">{mockGroupView.icon} {mockGroupView.name}</span>
                </div>
                {groupTests.length === 0 && (
                  <div className="sv-empty">
                    <p>No mocks found.</p>
                    {isAdmin && (
                      <button
                        className="pc-primary-btn sv-empty-create"
                        onClick={() => navigate(
                          `/admin/create-quiz?subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}&mockGroupId=${mockGroupView._id}`,
                          { state: { categoryId: selectedCategory?._id, subjectId: subjectView._id, mockTab, mockGroupId: mockGroupView._id } }
                        )}
                      >
                        <IconPlus/> Create Mock
                      </button>
                    )}
                  </div>
                )}
                {groupTests.map(test => {
                  const status = getStatus(test);
                  return (
                    <article key={test._id} className="pc-test-card" style={{ position: 'relative' }}>
                      {isAdmin && (
                        <QuizSettingsDropdown
                          quiz={test}
                          onEdit={() => navigate(`/admin/create-quiz?edit=${test._id}&subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}&mockGroupId=${mockGroupView._id}`)}
                          onMove={() => openMoveModal(test)}
                          onDelete={() => handleDeleteQuiz(test._id)}
                          onResults={() => handleViewResults(test._id)}
                          onToggleFeedback={(enabled) => handleToggleFeedback(test._id, enabled)}
                          deleteLoading={deleteLoadingId === test._id}
                        />
                      )}
                      <div>
                        <div className={`pc-badge-live pc-badge-${status}`}>{status}</div>
                        <h2 className="pc-test-title">{test.title}</h2>
                        <p className="pc-test-desc">{test.scheduledAt ? formatDateTime(test.scheduledAt) : "Practice anytime"}</p>
                      </div>
                      <div className="pc-card-actions">
                        {status === "upcoming" ? (
                          <div className="pc-countdown"><IconClock/><span>{getRemainingTime(test.scheduledAt)}</span></div>
                        ) : (() => {
                          const subKey = `submitted_${user?.email}_${test._id}`;
                          const subData = localStorage.getItem(subKey);
                          if (subData) {
                            const parsed = JSON.parse(subData);
                            return (
                              <button className="pc-exam-btn pc-result-btn"
                                onClick={() => navigate("/result", { state: { quizId: test._id, score: parsed.score, sectionTitle: parsed.quizTitle, breakdown: parsed.breakdown ?? [], language: parsed.language ?? "en", sectionStats: parsed.sectionStats ?? [], rank: parsed.rank ?? null, totalUsers: parsed.totalUsers ?? null, percentile: parsed.percentile ?? null, rankInsight: parsed.rankInsight ?? null, endsAt: test.endsAt || null } })}>
                                <IconFile/><span>View Result</span>
                              </button>
                            );
                          }
                          if(isQuizEnded(test)){
                            return (
                              <span style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#dc2626",fontWeight:700,background:"#fee2e2",padding:"6px 14px",borderRadius:"9999px",whiteSpace:"nowrap"}}>
                                Quiz Ended
                              </span>
                            );
                          }
                          const endsAtLabel = formatEndsAt(test);
                          return (
                            <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                              {endsAtLabel && (
                                <span style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"12px",color:"#b45309",fontWeight:600,background:"#fef3c7",padding:"4px 10px",borderRadius:"20px",whiteSpace:"nowrap"}}>
                                  <IconClock/> Ends {endsAtLabel}
                                </span>
                              )}
                              <button className="pc-exam-btn" onClick={() => handleStartQuiz(test._id)}>
                                <IconPlay/><span>Start Quiz</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </article>
                  );
                })}
              </>
            );
          }
          const ungroupedTests = subjectTests
            .filter(t => (t.mockType || "full") === mockTab && !t.mockGroupId)
            .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

          return (
            <>
              {tabGroups.length === 0 && ungroupedTests.length === 0 && !showAddMockGroup && (
                <div className="sv-empty">
                  <p>No groups found.</p>
                  {isAdmin && (
                    <button className="pc-primary-btn sv-empty-create" onClick={() => setShowAddMockGroup(true)}>
                      <IconPlus/> Create Group
                    </button>
                  )}
                </div>
              )}
              {(tabGroups.length > 0 || showAddMockGroup) && (
                <div className="subject-cards-container">
                  {tabGroups.map(grp => (
                    <div
                      key={grp._id}
                      className="subject-card"
                      style={{ "--subject-color": grp.color }}
                      role="button"
                      tabIndex={0}
                      onClick={() => setMockGroupView(grp)}
                      onKeyDown={(e) => e.key === 'Enter' && setMockGroupView(grp)}
                    >
                      {isAdmin && (
                        <button
                          className="subj-del-btn"
                          onClick={e => { e.stopPropagation(); handleDeleteMockGroup(grp._id); }}
                          title="Delete group"
                        >×</button>
                      )}
                      <span className="subject-card-icon">{grp.icon}</span>
                      <span className="subject-card-name">{grp.name}</span>
                      <span className="subject-card-count">
                        {tests.filter(t => t.mockGroupId?.toString() === grp._id?.toString()).length} mocks
                      </span>
                    </div>
                  ))}
                  {isAdmin && !showAddMockGroup && (
                    <div
                      className="subject-card subj-add-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowAddMockGroup(true)}
                      onKeyDown={(e) => e.key === 'Enter' && setShowAddMockGroup(true)}
                      style={{ "--subject-color": "#64748b" }}
                    >
                      <span className="subject-card-icon">➕</span>
                      <span className="subject-card-name">Add Group</span>
                    </div>
                  )}
                  {isAdmin && showAddMockGroup && (
                    <div className="subj-inline-form">
                      <input className="cat-form-emoji" value={newMockGroupIcon} onChange={e => setNewMockGroupIcon(e.target.value)} maxLength={2} placeholder="📋" />
                      <input className="cat-form-input" placeholder="Group name" value={newMockGroupName} onChange={e => setNewMockGroupName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddMockGroup()} autoFocus />
                      <button className="cat-form-save" onClick={handleAddMockGroup} disabled={addMockGroupLoading}>{addMockGroupLoading ? "..." : "Add"}</button>
                      <button className="cat-form-cancel" onClick={() => { setShowAddMockGroup(false); setNewMockGroupName(""); }}>✕</button>
                    </div>
                  )}
                </div>
              )}
              {ungroupedTests.length > 0 && (
                <>
                  {tabGroups.length > 0 && <div className="pc-divider"/>}
                  {ungroupedTests.map(test => {
                    const status = getStatus(test);
                    return (
                      <article key={test._id} className="pc-test-card" style={{ position: 'relative' }}>
                        {isAdmin && (
                          <QuizSettingsDropdown
                            quiz={test}
                            onEdit={() => navigate(`/admin/create-quiz?edit=${test._id}&subjectId=${subjectView._id}&categoryId=${selectedCategory?._id}&mockTab=${mockTab}`)}
                            onMove={() => openMoveModal(test)}
                            onDelete={() => handleDeleteQuiz(test._id)}
                            onResults={() => handleViewResults(test._id)}
                            onToggleFeedback={(enabled) => handleToggleFeedback(test._id, enabled)}
                            deleteLoading={deleteLoadingId === test._id}
                          />
                        )}
                        <div>
                          <div className={`pc-badge-live pc-badge-${status}`}>{status}</div>
                          <h2 className="pc-test-title">{test.title}</h2>
                          <p className="pc-test-desc">{test.scheduledAt ? formatDateTime(test.scheduledAt) : "Practice anytime"}</p>
                        </div>
                        <div className="pc-card-actions">
                          {status === "upcoming" ? (
                            <div className="pc-countdown"><IconClock/><span>{getRemainingTime(test.scheduledAt)}</span></div>
                          ) : (() => {
                            const subKey = `submitted_${user?.email}_${test._id}`;
                            const subData = localStorage.getItem(subKey);
                            if (subData) {
                              const parsed = JSON.parse(subData);
                              return (
                                <button className="pc-exam-btn pc-result-btn"
                                  onClick={() => navigate("/result", { state: { quizId: test._id, score: parsed.score, sectionTitle: parsed.quizTitle, breakdown: parsed.breakdown ?? [], language: parsed.language ?? "en", sectionStats: parsed.sectionStats ?? [], rank: parsed.rank ?? null, totalUsers: parsed.totalUsers ?? null, percentile: parsed.percentile ?? null, rankInsight: parsed.rankInsight ?? null, endsAt: test.endsAt || null } })}>
                                  <IconFile/><span>View Result</span>
                                </button>
                              );
                            }
                            if(isQuizEnded(test)){
                              return (
                                <span style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",color:"#dc2626",fontWeight:700,background:"#fee2e2",padding:"6px 14px",borderRadius:"9999px",whiteSpace:"nowrap"}}>
                                  Quiz Ended
                                </span>
                              );
                            }
                            const endsAtLabel = formatEndsAt(test);
                            return (
                              <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                                {endsAtLabel && (
                                  <span style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"12px",color:"#b45309",fontWeight:600,background:"#fef3c7",padding:"4px 10px",borderRadius:"20px",whiteSpace:"nowrap"}}>
                                    <IconClock/> Ends {endsAtLabel}
                                  </span>
                                )}
                                <button className="pc-exam-btn" onClick={() => handleStartQuiz(test._id)}>
                                  <IconPlay/><span>Start Quiz</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </article>
                    );
                  })}
                </>
              )}
            </>
          );
        })()
      )}

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

      {/* Move quiz modal */}
      {moveQuiz && (
        <div className="pc-modal-backdrop" onClick={() => setMoveQuiz(null)}>
          <div className="pc-results-modal" onClick={e => e.stopPropagation()} style={{ minWidth: 340, maxWidth: 420 }}>
            <h2 style={{ marginBottom: 4 }}>Move Quiz</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, fontWeight: 500 }}>{moveQuiz.title}</p>

            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Category</label>
            <select
              style={{ width: "100%", marginBottom: 12, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}
              value={moveTargetCatId}
              onChange={e => { setMoveTargetCatId(e.target.value); setMoveTargetSubjId(""); setMoveTargetGroupId(""); }}
            >
              <option value="">Select category...</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>

            {moveTargetCatId && (() => {
              const cat = categories.find(c => c._id === moveTargetCatId);
              if (!cat) return null;
              return (
                <>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Subject</label>
                  <select
                    style={{ width: "100%", marginBottom: 12, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}
                    value={moveTargetSubjId}
                    onChange={e => { setMoveTargetSubjId(e.target.value); setMoveTargetGroupId(""); }}
                  >
                    <option value="">Select subject...</option>
                    {cat.subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                  </select>
                </>
              );
            })()}

            {moveTargetSubjId && (moveQuiz.mockType || "full") !== "subject_wise" && (() => {
              const cat = categories.find(c => c._id === moveTargetCatId);
              const subj = cat?.subjects?.find(s => s._id === moveTargetSubjId);
              const groups = (subj?.mockGroups || []).filter(g => (g.mockType || "full") === (moveQuiz.mockType || "full"));
              if (!groups.length) return null;
              return (
                <>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Mock Group <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
                  <select
                    style={{ width: "100%", marginBottom: 12, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}
                    value={moveTargetGroupId}
                    onChange={e => setMoveTargetGroupId(e.target.value)}
                  >
                    <option value="">No group (ungrouped)</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.icon} {g.name}</option>)}
                  </select>
                </>
              );
            })()}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="pc-admin-btn" onClick={() => setMoveQuiz(null)}>Cancel</button>
              <button
                className="pc-primary-btn"
                style={{ fontSize: 13, padding: "6px 18px" }}
                onClick={handleMoveQuiz}
                disabled={!moveTargetSubjId || !moveTargetCatId || moveLoading}
              >
                {moveLoading ? "Moving..." : "Move"}
              </button>
            </div>
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

<div>
  <span style={{ display: "inline-block", marginBottom: 10, padding: "3px 14px", borderRadius: 9999, fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "#fff7ed", color: "#F77F00" }}>
    Mock Tests
  </span>
  <h1 className="pc-title">
    Practice &amp; <span>Compete.</span>
  </h1>
</div>


<div className="pc-toolbar">

<div className="pc-chips">

<div className="pc-chip">
<IconFile/>
<span>{tests.length} total</span>
</div>

<div className="pc-chip">
<IconPlay/>
<span>{liveCount} live</span>
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

{false && (
  <button
    className="pc-primary-btn"
    style={{ fontSize: 13, padding: "6px 14px" }}
    onClick={() => navigate("/admin/subject-cards")}
  >
    🖼 Home Cards
  </button>
)}

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
        role="button"
        tabIndex={0}
        onClick={() => { setSelectedCategory(cat); setSelectedSubject("all"); }}
        onKeyDown={(e) => e.key === 'Enter' && (setSelectedCategory(cat), setSelectedSubject("all"))}
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
        role="button"
        tabIndex={0}
        onClick={() => setShowAddCat(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShowAddCat(true)}
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
        role="button"
        tabIndex={0}
        onClick={() => { setSubjectView(subj); setMockTab("full"); setSearchQuery(""); }}
        onKeyDown={(e) => e.key === 'Enter' && (setSubjectView(subj), setMockTab("full"), setSearchQuery(""))}
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
        role="button"
        tabIndex={0}
        onClick={() => setShowAddSubj(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShowAddSubj(true)}
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
