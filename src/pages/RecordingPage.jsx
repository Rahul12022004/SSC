import { useEffect, useState } from "react";
import { FiPlay } from "react-icons/fi";
import "../styles/recording.css";
import { BASE_URL } from "../context/AuthContext.jsx";

function RecordingPage() {
  const [recordings, setRecordings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/camera/recordings`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecordings(data.recordings);
          setTotal(data.total);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="recordingPage">
      <div className="recordingPage__header">
        <h1> Recordings</h1>
        <p>Total: {total}</p>
      </div>

      {loading ? (
        <div className="recordingPage__loading">
          Loading recordings...
        </div>
      ) : recordings.length === 0 ? (
        <div className="recordingPage__empty">
          No recordings found
        </div>
      ) : (
        <div className="recordingPage__grid">
          {recordings.map((rec, index) => (
            <div key={rec.id} className="recordingPage__card">
              <div className="recordingPage__info">
                <h3>{rec.title}</h3>
                <p>#{index + 1}</p>
              </div>

              <button
                className="recordingPage__playBtn"
                onClick={() => handlePlay(rec.url)}
              >
                <FiPlay />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecordingPage;