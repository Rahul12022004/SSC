import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const [tests,setTests]=useState([]);
const [loading,setLoading]=useState(true);
const [message,setMessage]=useState("");

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
? `/testQuiz/${id}`
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



const liveCount=
tests.filter(t=>getStatus(t)==="live").length;

const upcomingCount=
tests.filter(t=>getStatus(t)==="upcoming").length;



return(

<main className="pc-page">

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


{isAdmin && (
<button
className="pc-primary-btn"
onClick={handleCreateQuiz}
>
<IconPlus/>
<span>Create Test</span>
</button>
)}

</div>

</div>

</div>



<div className="pc-divider"/>



<article className="pc-test-card">

<div>
<div className="pc-badge-live">
Live
</div>

<h2 className="pc-test-title">
Mock Test 1
</h2>

<p className="pc-test-desc">
Practice anytime
</p>
</div>

<button
className="pc-exam-btn"
onClick={()=>handleStartQuiz()}
>
<IconPlay/>
<span>Start Exam</span>
</button>

</article>



{loading && (
<p>Loading quizzes...</p>
)}


{!loading && tests.map(test=>{

const status=getStatus(test);

return(

<article
key={test._id}
className="pc-test-card"
>

<div>

<div className={`pc-badge-live pc-badge-${status}`}>
{status}
</div>

<h2 className="pc-test-title">
{test.title}
</h2>

<p className="pc-test-desc">
{test.scheduledAt
? formatDateTime(test.scheduledAt)
: "Practice anytime"}
</p>

</div>


<div className="pc-card-actions">

{isAdmin && (

<div className="pc-admin-actions">

<button
className="pc-admin-btn"
onClick={()=>
navigate(`/create-quiz?edit=${test._id}`)
}
>
Edit
</button>


<button
className="pc-admin-btn danger"
onClick={()=>
handleDeleteQuiz(test._id)
}
>
{deleteLoadingId===test._id
? "Deleting"
: "Delete"}
</button>


<button
className="pc-admin-btn"
onClick={()=>
handleViewResults(test._id)
}
>
Results
</button>

</div>

)}


{status==="upcoming" ? (

<div className="pc-countdown">
<IconClock/>
<span>
{getRemainingTime(test.scheduledAt)}
</span>
</div>

):(

<button
className="pc-exam-btn"
onClick={()=>
handleStartQuiz(test._id)
}
>
<IconPlay/>
<span>Start Quiz</span>
</button>

)}

</div>

</article>

);

})}



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