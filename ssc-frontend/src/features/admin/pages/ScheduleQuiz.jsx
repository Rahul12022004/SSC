import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/context/AuthContext";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function ScheduleQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [solutionPdfUrl, setSolutionPdfUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing quiz data on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${BASE_URL}/quiz/${id}/admin`, {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await res.json();
        if (!data.success || !data.quiz) return;
        const q = data.quiz;
        if (q.scheduledAt) {
          const d = new Date(q.scheduledAt);
          setDate(d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
          setTime(d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
        }
        if (q.endsAt) {
          const d = new Date(q.endsAt);
          setEndDate(d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
          setEndTime(d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
        }
        if (q.solutionPdfUrl) {
          setSolutionPdfUrl(q.solutionPdfUrl);
        }
      } catch (err) {
        console.error("Failed to load quiz data", err);
      }
    };
    fetchQuiz();
  }, [id]);

  // safer local date (avoids UTC date shift bug)
  const todayStr = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const today = new Date();
  const isToday = date === todayStr;

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${BASE_URL}/upload-file`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success || !uploadData.url) {
        alert(uploadData.message || "Failed to upload PDF");
        return;
      }

      const pdfUrl = uploadData.url;
      setSolutionPdfUrl(pdfUrl);

      // Auto-save URL to quiz DB so it's immediately available in analysis
      const saveRes = await fetch(`${BASE_URL}/quiz/save-solution-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ quizId: id, solutionPdfUrl: pdfUrl }),
      });
      const saveData = await saveRes.json();

      if (saveData.success) {
        alert("✅ PDF uploaded and saved successfully!");
      } else {
        alert("PDF uploaded but failed to save to quiz: " + (saveData.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleSchedule = async () => {
    if (!date || !time) {
      alert("⚠️ Please select date and time");
      return;
    }

    setLoading(true);

    try {
      // Force Mumbai/IST scheduling
      const localDate = new Date(`${date}T${time}:00`);

      // Convert IST selection to UTC for Mongo/Vercel consistency
      const scheduledAt = new Date(
        localDate.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })
      ).toISOString();

      let endsAt = undefined;
      if (endDate && endTime) {
        endsAt = new Date(
          new Date(`${endDate}T${endTime}:00`).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })
        ).toISOString();
      }

      const payload = {
        fileName: id,
        scheduledAt,
        ...(endsAt && { endsAt }),
      };

      if (solutionPdfUrl) {
        payload.solutionPdfUrl = solutionPdfUrl;
      }

      const res = await fetch(`${BASE_URL}/quiz/schedule-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
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
    <div className="min-h-screen bg-[#f8fafc] pt-[100px] px-5 pb-10">
      <h1 className="text-[28px] font-bold text-[#0b2545] mb-8 text-center">Schedule Quiz</h1>

      <div className="flex gap-6 justify-center flex-wrap items-start">
        <div className="w-full max-w-[420px] bg-white p-5 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
        <h3 className="text-base font-bold text-[#0b2545] mb-3">Quiz Schedule</h3>
        
        <div className="flex flex-col mb-3">
          <label className="font-semibold text-[#0b2545] mb-1 text-xs">Select Date</label>
          <input
            type="date"
            min={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#0B2545] focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/10 transition-all text-xs"
          />
        </div>

        <div className="flex flex-col mb-3">
          <label className="font-semibold text-[#0b2545] mb-1 text-xs">Select Time</label>
          <input
            type="time"
            min={isToday ? today.toTimeString().slice(0, 5) : "00:00"}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#0B2545] focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/10 transition-all text-xs"
          />
        </div>

        <div className="flex flex-col mb-3">
          <label className="font-semibold text-[#0b2545] mb-1 text-xs">
            End Date <span style={{ fontWeight: 400, fontSize: 11, color: "#64748b" }}>(optional)</span>
          </label>
          <input
            type="date"
            min={date || todayStr}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#0B2545] focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/10 transition-all text-xs"
          />
        </div>

        <div className="flex flex-col mb-3">
          <label className="font-semibold text-[#0b2545] mb-1 text-xs">
            End Time <span style={{ fontWeight: 400, fontSize: 11, color: "#64748b" }}>(optional)</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#0B2545] focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/10 transition-all text-xs"
          />
        </div>

          <button
            onClick={handleSchedule}
            disabled={loading}
            className="w-full py-2 mt-2 bg-[#f77f00] text-white font-semibold text-sm rounded-lg border-none cursor-pointer transition-colors hover:bg-[#d96c00] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Scheduling..." : "Schedule Quiz"}
          </button>
        </div>

        {/* Solution PDF Card */}
        <div className="w-full max-w-[420px] bg-white p-5 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
        <h3 className="text-base font-bold text-[#0b2545] mb-3">Solution PDF (Optional)</h3>
        
        <div className="flex flex-col mb-3">
          <label className="font-semibold text-[#0b2545] mb-1 text-xs">Upload Solution PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            disabled={uploading}
            className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#0B2545] focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/10 transition-all text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#f77f00] file:text-white hover:file:bg-[#d96c00] file:cursor-pointer"
          />
          {uploading && <p className="text-xs text-[#f77f00] mt-1">Uploading...</p>}
          {solutionPdfUrl && <p className="text-xs text-green-600 mt-1">✓ PDF saved — upload new file to replace</p>}
        </div>

        {solutionPdfUrl && (
          <>
            <div className="mt-2">
              <p className="font-semibold text-[#0b2545] mb-1.5 text-xs">PDF Preview:</p>
              <iframe
                src={solutionPdfUrl}
                className="w-full h-[180px] border border-gray-200 rounded-lg"
                title="PDF Preview"
              />
            </div>

          </>
        )}

        </div>
      </div>
    </div>
  );
}

export default ScheduleQuiz;
