import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiSkipBack,
  FiSkipForward,
  FiClock,
} from "react-icons/fi";
import { BASE_URL } from "../context/AuthContext.jsx";
import "../styles/quiz.css";
import { FiLoader } from "react-icons/fi";

function QuizPage() {
  const [started, setStarted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showSubmit, setShowSubmit] = useState(false);

  const [cameraAllowed, setCameraAllowed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const quiz = {
    title: "General Aptitude Quiz",
    questions: [
      // MATH
      {
        question: "5 + 7 = ?",
        options: ["10", "11", "12", "13"],
      },
      {
        question: "15 × 2 = ?",
        options: ["20", "25", "30", "35"],
      },
      {
        question: "Square root of 81?",
        options: ["7", "8", "9", "10"],
      },
      {
        question: "12 ÷ 4 = ?",
        options: ["2", "3", "4", "5"],
      },
      {
        question: "What is 10% of 200?",
        options: ["10", "20", "30", "40"],
      },

      // ENGLISH
      {
        question: "Synonym of 'Happy'?",
        options: ["Sad", "Joyful", "Angry", "Tired"],
      },
      {
        question: "Antonym of 'Big'?",
        options: ["Large", "Huge", "Small", "Wide"],
      },
      {
        question: "Choose correct spelling:",
        options: ["Recieve", "Receive", "Recive", "Receve"],
      },
      {
        question: "Fill in the blank: She ___ going to school.",
        options: ["is", "are", "am", "be"],
      },
      {
        question: "Plural of 'Child'?",
        options: ["Childs", "Children", "Childes", "Childer"],
      },

      // SCIENCE
      {
        question: "Water freezes at?",
        options: ["0°C", "10°C", "50°C", "100°C"],
      },
      {
        question: "Sun is a?",
        options: ["Planet", "Star", "Satellite", "Asteroid"],
      },
      {
        question: "Human body has how many lungs?",
        options: ["1", "2", "3", "4"],
      },
      {
        question: "Which gas do plants take in?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      },
      {
        question: "Earth revolves around?",
        options: ["Moon", "Mars", "Sun", "Venus"],
      },

      // MIXED
      {
        question: "Which is a vowel?",
        options: ["B", "C", "A", "D"],
      },
      {
        question: "What is 9 x 9?",
        options: ["72", "81", "90", "99"],
      },
      {
        question: "Which part of plant makes food?",
        options: ["Root", "Stem", "Leaf", "Flower"],
      },
      {
        question: "Opposite of 'Fast'?",
        options: ["Quick", "Slow", "Rapid", "Speed"],
      },
      {
        question: "What is H2O?",
        options: ["Oxygen", "Hydrogen", "Water", "Salt"],
      },
    ],
  };

  useEffect(() => {
    const askCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraAllowed(true);
      } catch (err) {
        alert("Camera permission is required to continue!");
        setTimeout(askCamera, 1000);
      }
    };

    askCamera();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();

        alert("ESC key is disabled during the quiz!");

        // Re-enter fullscreen
        const el = document.documentElement;
        if (!document.fullscreenElement) {
          if (el.requestFullscreen) {
            el.requestFullscreen();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const disable = (e) => {
      if (e.type === "contextmenu") e.preventDefault();

      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.startsWith("F") ||
        e.key === "Escape"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disable);
    document.addEventListener("keydown", disable);

    return () => {
      document.removeEventListener("contextmenu", disable);
      document.removeEventListener("keydown", disable);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && started) {
        alert("Fullscreen mode is required!");

        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started]);

  // TIMER
  useEffect(() => {
    if (!started) return;

    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [started]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // 🔥 remove audio tracks if any (extra safety)
      stream.getAudioTracks().forEach((track) => track.stop());

      streamRef.current = stream;
      // 🎥 MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
      });
      chunksRef.current = []; // 🔥 important fix
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // 🔥 record in chunks every 1 sec

      setCameraAllowed(true);
    } catch {
      alert("Camera permission required!");
    }
  };
  const handleStart = async () => {
    try {
      await startCamera();

      const el = document.documentElement;

      if (el.requestFullscreen) {
        await el.requestFullscreen();
      }

      setStarted(true);
    } catch {
      alert("Camera permission required!");
    }
  };

  const formatTime = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (i) => {
    const updated = [...answers];
    updated[current] = i;
    setAnswers(updated);

    const stat = [...status];
    stat[current] = "answered";
    setStatus(stat);
  };

  const handleNext = () => {
    if (answers[current] === undefined) {
      const stat = [...status];
      stat[current] = "skipped";
      setStatus(stat);
    }
    setCurrent((c) => Math.min(c + 1, quiz.questions.length - 1));
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
  };

  const handleLast = () => {
    setCurrent(quiz.questions.length - 1);
  };

  const total = quiz.questions.length;

  const handleSubmitQuiz = () => {
    if (!mediaRecorderRef.current || isSubmitting) return;

    setIsSubmitting(true); // 🔥 start loading

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });

        const formData = new FormData();
        formData.append("video", blob, `recording_${Date.now()}.webm`);

        await fetch(`${BASE_URL}/camera/upload-video`, {
          method: "POST",
          body: formData,
        });

        alert("Quiz Submitted!");
        window.close();
      } catch (err) {
        console.error("Upload failed:", err);
        setIsSubmitting(false); // ❗ reset if failed
      }
    };

    recorder.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  // ✅ SUBMIT SCREEN
  if (showSubmit) {
    const total = quiz.questions.length;
    const attempted = answers.filter((a) => a !== undefined).length;
    const skipped = total - attempted;

    return (
      <div className="quizPage centerScreen">
        <div className="submitCard">
          <h2>Submit Quiz?</h2>

          <div className="submitStats">
            <div>
              <span>Total Questions</span>
              <strong>{total}</strong>
            </div>

            <div>
              <span>Attempted</span>
              <strong className="greenText">{attempted}</strong>
            </div>

            <div>
              <span>Skipped</span>
              <strong className="yellowText">{skipped}</strong>
            </div>
          </div>

          <p className="submitWarning">
            Once submitted, you cannot change your answers.
          </p>

          <div className="submitActions">
            <button
              className="cancelBtn"
              disabled={isSubmitting}
              onClick={() => setShowSubmit(false)}
            >
              Go Back
            </button>

            <button
              className="submitBtn"
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
            >
              {isSubmitting ? (
                <span className="loaderWrapper">
                  <FiLoader className="spinIcon" />
                  Submitting...
                </span>
              ) : (
                "Submit Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ INSTRUCTION PAGE
  if (!started) {
    return (
      <div className="quizPage">
        <div className="instructionCard">
          <h2>Quiz Instructions</h2>

          <ul>
            <li>Camera access is required</li>
            <li>Do not switch tabs</li>
            <li>Timer will auto submit</li>
            <li>Each question must be answered carefully</li>
          </ul>

          <div className="legendRow">
            <div className="legendItem">
              <span className="box gray"></span> Not Visited
            </div>
            <div className="legendItem">
              <span className="box green"></span> Answered
            </div>
            <div className="legendItem">
              <span className="box yellow"></span> Skipped
            </div>
          </div>

          <p style={{ color: cameraAllowed ? "green" : "red" }}>
            {cameraAllowed
              ? "Camera access granted"
              : " Waiting for camera permission..."}
          </p>

          <div className="agreeBox">
            <input
              type="checkbox"
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label>I agree to all instructions</label>
          </div>

          <button disabled={!agree} onClick={handleStart}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[current];

  return (
    <div className="quizPage">
      {/* HEADER */}
      <div className="quizHeader">
        <h1>{quiz.title}</h1>
        <div className="timerBox">
          <div className="timer">
            <FiClock /> {formatTime()}
          </div>

          <div className="negativeMarking">
            Negative Marking: <span>OFF</span>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* TRACKER */}
      <div className="tracker">
        {quiz.questions.map((_, i) => (
          <div
            key={i}
            className={`box 
            ${status[i] === "answered" ? "green" : ""}
            ${status[i] === "skipped" ? "yellow" : ""}
            ${i === current ? "active" : ""}`}
          />
        ))}
      </div>

      {/* QUESTION */}

      <div className="questionCard">
        <h2>
          Q{current + 1}. {q.question}
        </h2>

        <div className="optionsGrid">
          {q.options.map((opt, i) => (
            <label key={i} className="optionItem">
              <input
                type="radio"
                checked={answers[current] === i}
                onChange={() => handleAnswer(i)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="navBar">
        <div className="navLeft">
          <button onClick={handlePrev}>
            <FiArrowLeft /> Previous
          </button>

          {current > 0 && (
            <button onClick={() => setCurrent(0)}>
              <FiSkipBack /> First
            </button>
          )}

          {current > 0 && (
            <button onClick={handleLast}>
              <FiSkipForward /> Last
            </button>
          )}
        </div>

        <div className="navRight">
          {current === total - 1 ? (
            <button onClick={() => setShowSubmit(true)}>Submit</button>
          ) : (
            <button onClick={handleNext}>
              Next <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
