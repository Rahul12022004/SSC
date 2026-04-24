import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, useAuth } from "../context/AuthContext.jsx";
import "../styles/tests.css";

const IconFile = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M8 3v5h5" />
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="8,6 18,12 8,18 8,6" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12a9 9 0 0 1-15.5 6.36L3 16" />
    <path d="M3 12A9 9 0 0 1 18.5 5.64L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M3 21v-5h5" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const Tests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchTests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/quiz/all`);
      const data = await res.json();

      if (data.success) {
        setTests(data.quizzes || []);
        setMessage(data.quizzes?.length ? "" : data.message || "No quiz data found");
      } else {
        setTests([]);
        setMessage(data.message || "Unable to load quizzes");
      }
    } catch (err) {
      console.error(err);
      setTests([]);
      setMessage("Unable to connect to the quiz server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatus = (quiz) => {
    if (!quiz.scheduledAt) return "draft";

    return new Date() < new Date(quiz.scheduledAt) ? "upcoming" : "live";
  };

  const getRemainingTime = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return null;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  const formatSchedule = (date) => (date ? formatDateTime(date) : "Practice anytime");

  const handleStartQuiz = (quizId = null) => {
    const redirectUrl = quizId ? `/testQuiz/${quizId}` : "/exam";

    if (!user) {
      navigate("/login", {
        state: { redirectTo: redirectUrl },
      });
      return;
    }

    localStorage.removeItem("examSections");
    navigate(redirectUrl);
  };

  const handleCreateQuiz = () => {
    if (!user) {
      navigate("/login", {
        state: { redirectTo: "/create-quiz" },
      });
      return;
    }

    navigate("/create-quiz");
  };

  const handleDeleteQuiz = async (quizId) => {
    const shouldDelete = window.confirm(
      "Delete this quiz and all student submissions?",
    );

    if (!shouldDelete) return;

    setDeleteLoadingId(quizId);

    try {
      const res = await fetch(`${BASE_URL}/quiz/${quizId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to delete quiz");
        return;
      }

      await fetchTests();
    } catch (err) {
      console.error(err);
      alert("Failed to delete quiz");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleViewResults = async (quizId) => {
    setResultsLoading(true);
    setResultsData(null);

    try {
      const res = await fetch(`${BASE_URL}/quiz/${quizId}/submissions`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to load results");
        return;
      }

      setResultsData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load results");
    } finally {
      setResultsLoading(false);
    }
  };

  const liveCount = tests.filter((test) => getStatus(test) === "live").length;
  const upcomingCount = tests.filter(
    (test) => getStatus(test) === "upcoming",
  ).length;
  const isAdmin = user?.role === "admin" || user?.roleLevel >= 3;

  return (
    <main className="pc-page">
      <section aria-labelledby="pc-page-title">
        <div className="pc-topbar">
          <h1 id="pc-page-title" className="pc-title">
            Tests
          </h1>

          <div className="pc-toolbar">
            <div className="pc-chips" aria-label="Test summary">
              <div className="pc-chip">
                <IconFile />
                <span>{tests.length + 1} total</span>
              </div>

              <div className="pc-chip">
                <IconPlay />
                <span>{liveCount + 1} live</span>
              </div>

              <div className="pc-chip">
                <IconClock />
                <span>{upcomingCount} upcoming</span>
              </div>
            </div>

            <div className="pc-actions">
              <button
                className="pc-icon-btn"
                type="button"
                onClick={fetchTests}
                disabled={loading}
                aria-label="Refresh tests"
              >
                <IconRefresh />
              </button>

              <button
                className="pc-primary-btn"
                type="button"
                onClick={handleCreateQuiz}
              >
                <IconPlus />
                <span>Create Test</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pc-divider" aria-hidden="true" />

        <article className="pc-test-card">
          <div>
            <div className="pc-badge-live">Live</div>
            <h2 className="pc-test-title">Mock Test 1</h2>
            <p className="pc-test-desc">Practice anytime</p>
          </div>

          <button
            className="pc-exam-btn"
            type="button"
            onClick={() => handleStartQuiz()}
          >
            <IconPlay />
            <span>Start Exam</span>
          </button>
        </article>

        {loading && (
          <section className="pc-empty-card" aria-label="Loading quizzes">
            <div>
              <div className="pc-empty-icon">...</div>
              <p className="pc-empty-text">Loading quizzes...</p>
            </div>
          </section>
        )}

        {!loading && message && tests.length === 0 && (
          <section className="pc-empty-card" aria-label="Empty quiz state">
            <div>
              <div className="pc-empty-icon">!</div>
              <p className="pc-empty-text">{message}</p>
            </div>
          </section>
        )}

        {!loading && tests.length > 0 && (
          <div className="pc-quiz-list">
            {tests.map((test) => {
              const status = getStatus(test);

              return (
                <article className="pc-test-card" key={test._id}>
                  <div>
                    <div className={`pc-badge-live pc-badge-${status}`}>
                      {status}
                    </div>
                    <h2 className="pc-test-title">
                      {test.title || "Untitled Quiz"}
                    </h2>
                    <p className="pc-test-desc">
                      {formatSchedule(test.scheduledAt)}
                    </p>
                  </div>

                  <div className="pc-card-actions">
                    {isAdmin && (
                      <div className="pc-admin-actions">
                        <button
                          className="pc-admin-btn"
                          type="button"
                          onClick={() => navigate(`/create-quiz?edit=${test._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="pc-admin-btn danger"
                          type="button"
                          onClick={() => handleDeleteQuiz(test._id)}
                          disabled={deleteLoadingId === test._id}
                        >
                          {deleteLoadingId === test._id ? "Deleting" : "Delete"}
                        </button>
                        <button
                          className="pc-admin-btn"
                          type="button"
                          onClick={() => handleViewResults(test._id)}
                        >
                          Results
                        </button>
                      </div>
                    )}

                    {status === "upcoming" ? (
                      <div className="pc-countdown">
                        <IconClock />
                        <span>{getRemainingTime(test.scheduledAt)}</span>
                      </div>
                    ) : (
                      <button
                        className="pc-exam-btn"
                        type="button"
                        onClick={() => handleStartQuiz(test._id)}
                      >
                        <IconPlay />
                        <span>Start Quiz</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {(resultsLoading || resultsData) && (
          <div className="pc-modal-backdrop" onClick={() => setResultsData(null)}>
            <div className="pc-results-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pc-results-head">
                <div>
                  <h2>Student Results</h2>
                  <p>{resultsData?.quiz?.title || "Loading results..."}</p>
                </div>
                <button type="button" onClick={() => setResultsData(null)}>
                  Close
                </button>
              </div>

              {resultsLoading && <p className="pc-results-empty">Loading...</p>}

              {!resultsLoading && resultsData?.submissions?.length === 0 && (
                <p className="pc-results-empty">No students have appeared yet.</p>
              )}

              {!resultsLoading && resultsData?.submissions?.length > 0 && (
                <div className="pc-results-table-wrap">
                  <table className="pc-results-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Marks</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.submissions.map((submission) => (
                        <tr key={submission._id}>
                          <td>{submission.email}</td>
                          <td>
                            {submission.score} / {resultsData.quiz.totalMarks}
                          </td>
                          <td>{formatDateTime(submission.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Tests;
