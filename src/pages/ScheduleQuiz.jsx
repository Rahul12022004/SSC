import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/schedule.css";
import { BASE_URL } from "../context/AuthContext.jsx";

function ScheduleQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isToday = date === todayStr;

  const handleSchedule = async () => {
    if (!date || !time) {
      alert("⚠️ Please select date and time");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/quiz/schedule-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileName: id,
          scheduledAt: `${date}T${time}`, // ✅ FUTURE READY
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Quiz Scheduled Successfully!");
        navigate("/tests");
      } else {
        alert(data.message || "Failed to schedule");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedulePage">
      <h1>Schedule Quiz</h1>

      <div className="card">
        <div className="field">
          <label>Select Date</label>
          <input
            type="date"
            min={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Select Time</label>
          <input
            type="time"
            min={isToday ? today.toTimeString().slice(0, 5) : "00:00"}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <button onClick={handleSchedule} disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Quiz"}
        </button>
      </div>
    </div>
  );
}

export default ScheduleQuiz;