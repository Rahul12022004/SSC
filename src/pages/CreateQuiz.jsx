import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  FiPlus,
  FiUpload,
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import "../styles/createQuiz.css";
import { BASE_URL } from "../context/AuthContext.jsx";

function CreateQuiz() {
  const [searchParams] = useSearchParams();
  const editQuizId = searchParams.get("edit");
  const isEditMode = Boolean(editQuizId);
  const location = useLocation();
  const stateData = location.state || {};
  const [subjectId,  setSubjectId]  = useState(searchParams.get("subjectId")  || stateData.subjectId  || null);
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || stateData.categoryId || null);
  const [mockTab,    setMockTab]    = useState(searchParams.get("mockTab")    || stateData.mockTab    || "full");

  const titleRef = useRef(null);
  const questionRefs = useRef([]);

  const [showRefreshModal, setShowRefreshModal] = useState(false);

  const [quiz, setQuiz] = useState({
    title: "",
    duration: 5,
    questions: [],
  });

  // Tracks any in-flight image uploads keyed by a string id (e.g. "q-3" or
  // "opt-3-1") so we can disable inputs and surface progress in the UI.
  const [uploadingMap, setUploadingMap] = useState({});
  const isUploading = Object.values(uploadingMap).some(Boolean);

  const confirmRefresh = () => {
    window.location.reload();
  };

  const [errors, setErrors] = useState({
    title: "",
    duration: "",
    questions: [],
  });

  useEffect(() => {
    if (!errors) return;

    const hasAnyError =
      errors.title ||
      errors.duration ||
      errors.questions.some((q) => q?.question || q?.options || q?.correct);

    if (!hasAnyError) return;

    const timer = setTimeout(() => {
      setErrors({
        title: "",
        duration: "",
        questions: [],
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [errors]);

  const handleRefreshClick = () => {
    setShowRefreshModal(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasData =
        quiz.title ||
        quiz.questions.some(
          (q) =>
            q.question ||
            q.questionImage ||
            q.options.some((opt) => opt.text || opt.image),
        );

      if (!hasData) return;

      e.preventDefault();
      e.returnValue = "Changes you made may not be saved."; // 🔥 better support
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quiz]);

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [errorIndex, setErrorIndex] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hindiOpen, setHindiOpen] = useState([]);

  const toggleHindi = (qIndex) => {
    setHindiOpen((prev) => {
      const updated = [...prev];
      updated[qIndex] = !updated[qIndex];
      return updated;
    });
  };

  const updateOptionHi = (qIndex, oIndex, value) => {
    const updated = [...quiz.questions];
    if (!updated[qIndex].optionsHi) {
      updated[qIndex].optionsHi = [{ text: "" }, { text: "" }, { text: "" }, { text: "" }];
    }
    updated[qIndex].optionsHi[oIndex] = { text: value };
    setQuiz({ ...quiz, questions: updated });
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfInputRef = useRef(null);

  const handlePdfUpload = async (file) => {
    if (!file) return;
    const name = file.name?.toLowerCase() || "";
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    const isDocx = name.endsWith(".docx");
    if (!isPdf && !isDocx) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch(`${BASE_URL}/quiz/pdf-generate`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to generate questions");
        return;
      }
      setQuiz((prev) => ({ ...prev, questions: [...prev.questions, ...data.questions] }));
    } catch (err) {
      alert("Error processing file");
      console.error(err);
    } finally {
      setPdfLoading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const [negativeMarking, setNegativeMarking] = useState(true);
  const [negativeValue, setNegativeValue] = useState(-0.5);

  const [eachMarks, setEachMarks] = useState(1);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setDeleteIndex(null);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      titleRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && !isEditMode) {
      hasInitialized.current = true;
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!editQuizId) return;

    const fetchQuizForEdit = async () => {
      try {
        const res = await fetch(`${BASE_URL}/quiz/${editQuizId}/admin`);
        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Failed to load quiz");
          return;
        }

        setQuiz({
          title: data.quiz.title || "",
          duration: data.quiz.duration || 5,
          questions: (data.quiz.questions || []).map((question) => ({
            ...question,
            type: question.type || "text",
            answerType: question.answerType || "single",
            questionHi: question.questionHi || "",
            options: question.options?.length
              ? question.options
              : [
                  { text: "", image: "" },
                  { text: "", image: "" },
                  { text: "", image: "" },
                  { text: "", image: "" },
                ],
            optionsHi: question.optionsHi?.length
              ? question.optionsHi
              : [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
            correctAnswer:
              question.answerType === "multiple" && !Array.isArray(question.correctAnswer)
                ? question.correctAnswer
                  ? [question.correctAnswer]
                  : []
                : question.correctAnswer ?? "",
          })),
        });
        setNegativeMarking(Boolean(data.quiz.negativeMarking));
        setNegativeValue(data.quiz.negativeValue ?? -0.5);
        setEachMarks(data.quiz.eachMarks || 1);
        if (data.quiz.subject    || searchParams.get("subjectId"))  setSubjectId(data.quiz.subject    || searchParams.get("subjectId"));
        if (data.quiz.categoryId || searchParams.get("categoryId")) setCategoryId(data.quiz.categoryId || searchParams.get("categoryId"));
        if (data.quiz.mockType   || searchParams.get("mockTab"))    setMockTab(data.quiz.mockType     || searchParams.get("mockTab"));
        hasInitialized.current = true;
      } catch (err) {
        console.error(err);
        alert("Failed to load quiz");
      }
    };

    fetchQuizForEdit();
  }, [editQuizId]);

  const addSection = () => {
    setQuiz((prev) => {
      const newQuestions = [
        ...prev.questions,
        {
          type: "section",
          question: "",
          questionHi: "",
          questionImage: "",
          options: [{ text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }],
          optionsHi: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
          correctAnswer: "",
          answerType: "single",
        },
      ];
      setTimeout(() => scrollToQuestion(newQuestions.length - 1), 100);
      return { ...prev, questions: newQuestions };
    });
  };

  const newBlankQuestion = () => ({
    type: "text",
    answerType: "single",
    question: "",
    questionHi: "",
    questionImage: "",
    options: [{ text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }],
    optionsHi: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctAnswer: "",
  });

  const addQuestion = (shouldScroll = true) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions, newBlankQuestion()];
      if (shouldScroll) setTimeout(() => scrollToQuestion(newQuestions.length - 1), 100);
      return { ...prev, questions: newQuestions };
    });
  };

  const addQuestionAt = (insertIndex) => {
    setQuiz((prev) => {
      const updated = [...prev.questions];
      updated.splice(insertIndex, 0, newBlankQuestion());
      setTimeout(() => scrollToQuestion(insertIndex), 100);
      return { ...prev, questions: updated };
    });
  };

  const updateQuestion = (qIndex, field, value) => {
    const updated = [...quiz.questions];

    if (field === "type") {
      updated[qIndex] = {
        ...updated[qIndex],
        type: value,
      };
    } else if (field === "answerType") {
      updated[qIndex] = {
        ...updated[qIndex],
        answerType: value,
        correctAnswer: value === "multiple" ? [] : "",
      };
    } else {
      updated[qIndex][field] = value;
    }

    setQuiz({ ...quiz, questions: updated });
  };

  // ---------------------------------------------------------------------------
  // Image upload helper
  //
  // Replaces the previous FileReader.readAsDataURL flow which embedded a
  // base64 data URI directly into the question/option object. That approach
  // pushed the eventual create-quiz JSON payload past Vercel's hard ~4.5 MB
  // serverless body limit and triggered 413 errors.
  //
  // Now: we POST the raw file as multipart/form-data to /api/upload-image,
  // which uploads to Vercel Blob and returns a public URL. We store ONLY the
  // URL string. Quiz JSON stays tiny.
  // ---------------------------------------------------------------------------
  const uploadImageFile = async (file) => {
    // Keep this list in sync with the backend allowlist in api/routes/upload.js
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error("Only PNG, JPEG, WEBP, and GIF images are allowed.");
    }

    // Hard cap matches multer config on the server (10 MB).
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error("Image exceeds 10 MB limit.");
    }

    const formData = new FormData();
    // Field name MUST stay "file" — multer.single("file") on the server.
    formData.append("file", file);

    // IMPORTANT: do NOT set Content-Type manually. The browser must set the
    // multipart boundary itself — overriding it breaks parsing on the server.
    const res = await fetch(`${BASE_URL}/upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    // Read as text first so we never crash on HTML error pages from the edge
    // (Vercel/proxy 404/413/502 returns text/html, not JSON).
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      // non-JSON (likely HTML error page)
    }

    if (!res.ok || !data?.success || !data?.url) {
      const msg =
        data?.message ||
        `Upload failed (HTTP ${res.status}). ${raw?.slice(0, 200) || ""}`;
      throw new Error(msg);
    }

    return data.url;
  };

  // Run an upload while tracking it under `key` so the UI can disable the
  // associated input and surface progress. Errors bubble up to the caller.
  const runTrackedUpload = async (key, file) => {
    setUploadingMap((prev) => ({ ...prev, [key]: true }));
    try {
      return await uploadImageFile(file);
    } finally {
      setUploadingMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleQuestionImageChange = async (qIndex, file) => {
    if (!file) return;
    try {
      const url = await runTrackedUpload(`q-${qIndex}`, file);
      updateQuestion(qIndex, "questionImage", url);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to upload image");
    }
  };

  const handleOptionImageChange = async (qIndex, oIndex, file) => {
    if (!file) return;
    try {
      const url = await runTrackedUpload(`opt-${qIndex}-${oIndex}`, file);
      updateOption(qIndex, oIndex, "image", url);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to upload image");
    }
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updated = [...quiz.questions];
    updated[qIndex].options[oIndex][field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const moveQuestion = (index, direction) => {
    const updated = [...quiz.questions];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= updated.length) return;

    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    setQuiz({ ...quiz, questions: updated });

    // 🔥 scroll after reorder
    setTimeout(() => {
      scrollToQuestion(swapIndex);
    }, 100);
  };

  const scrollToQuestion = (index) => {
    const el = questionRefs.current[index];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const confirmDelete = () => {
    const total = quiz.questions.length;
    const newQuestions = quiz.questions.filter((_, i) => i !== deleteIndex);

    setQuiz({ ...quiz, questions: newQuestions });
    setDeleteIndex(null);

    setTimeout(() => {
      if (newQuestions.length === 0) return;

      if (deleteIndex === 0) {
        scrollToQuestion(0);
        return;
      }

      if (deleteIndex === total - 1) {
        scrollToQuestion(newQuestions.length - 1);
        return;
      }
    }, 120);
  };

  const handleSave = () => {
    if (isUploading) {
      alert("Please wait for image uploads to finish before saving.");
      return;
    }

    const newErrors = {
      title: "",
      duration: "",
      questions: [],
    };

    let hasError = false;
    let firstErrorIndex = null;

    // ✅ Title
    if (!quiz.title.trim()) {
      newErrors.title = "Title is required";
      hasError = true;

      // 🔥 focus title immediately
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
    }

    // ✅ Duration
    if (!quiz.duration || quiz.duration < 1) {
      newErrors.duration = "Minimum duration is 1 minute";
      hasError = true;

      // 🔥 scroll to top (duration area)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }

    // ✅ Questions
    quiz.questions.forEach((q, i) => {
      if (q.type === "section") return;

      const qError = {
        question: "",
        options: "",
        correct: "",
      };

      const hasQuestion = (q.question || "").trim() !== "" || q.questionImage !== "";

      if (!hasQuestion) {
        qError.question = "Enter question or upload image";
        hasError = true;
        if (firstErrorIndex === null) firstErrorIndex = i;
      }

      if (q.answerType !== "descriptive") {
        const hasEmptyOption = q.options.some(
          (opt) => (opt.text || "").trim() === "" && opt.image === "",
        );

        if (hasEmptyOption) {
          qError.options = "All options are required";
          hasError = true;
          if (firstErrorIndex === null) firstErrorIndex = i;
        }

        if (
          q.answerType === "multiple"
            ? !Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0
            : q.correctAnswer === ""
        ) {
          qError.correct = "Select correct answer";
          hasError = true;
          if (firstErrorIndex === null) firstErrorIndex = i;
        }
      }

      newErrors.questions[i] = qError;
    });

    setErrors(newErrors);

    // 🔥 SCROLL TO FIRST ERROR QUESTION
    if (firstErrorIndex !== null) {
      setTimeout(() => {
        scrollToQuestion(firstErrorIndex);
      }, 150);
    }

    if (hasError) return;

    setShowSaveModal(true);
  };

  // Safely parse a fetch Response — never crash on HTML error pages
  // (Vercel/proxy 413 / 502 returns text/html, not JSON, which causes
  // "Unexpected token '<' is not valid JSON" if you call res.json() blindly).
  const safeParseResponse = async (res) => {
    const text = await res.text();
    try {
      return { data: JSON.parse(text), raw: text };
    } catch {
      return { data: null, raw: text };
    }
  };

  const handleSubmit = async () => {
    if (quiz.duration < 1) {
      alert("Duration must be at least 1 minute");
      return;
    }

    if (negativeMarking && (!negativeValue || negativeValue >= 0)) {
      alert("Invalid negative marking");
      return;
    }

    const payload = {
      title: quiz.title,
      duration: quiz.duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      questions: quiz.questions,
      subject:    subjectId  || null,
      categoryId: categoryId || null,
      mockType:   mockTab    || "full",
    };

    try {
      const res = await fetch(
        isEditMode
          ? `${BASE_URL}/quiz/${editQuizId}`
          : `${BASE_URL}/quiz/create-quiz`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 🔐 session support
          body: JSON.stringify(payload),
        }
      );

      // Read body as text first; only then attempt JSON parse, to survive
      // HTML error pages returned by the edge layer.
      const { data, raw } = await safeParseResponse(res);

      if (!res.ok) {
        if (res.status === 413) {
          alert(
            (data && data.message) ||
              "Payload Too Large (413). The quiz exceeds the server upload limit.\n\n" +
                "Images should be uploaded via the image picker (which stores them on Vercel Blob) — they should never be embedded inline."
          );
          return;
        }
        const msg =
          (data && data.message) ||
          `Failed to save quiz (HTTP ${res.status}). ${raw?.slice(0, 200) || ""}`;
        alert(msg);
        return;
      }

      if (data && data.success) {
        window.location.href = `/schedule/${data.fileName}`;
      } else {
        alert((data && data.message) || "Failed to save quiz");
      }
    } catch (err) {
      console.error(err);
      alert(
        err?.message
          ? `Failed to save quiz: ${err.message}`
          : "Failed to save quiz"
      );
    }
  };

  const renderQuestionCard = (qIndex) => {
    const q = quiz.questions[qIndex];
    let secNum = 0;
    let qInSec = 0;
    for (let i = 0; i <= qIndex; i++) {
      if (quiz.questions[i].type === "section") { secNum++; qInSec = 0; }
      else qInSec++;
    }
    const qLabel = secNum > 0 ? `${secNum}.${qInSec}` : `${qInSec}`;
    const qImageUploading = Boolean(uploadingMap[`q-${qIndex}`]);
    return (
      <div
        key={qIndex}
        className={`questionCard ${
          errors.questions[qIndex]?.question ||
          errors.questions[qIndex]?.options ||
          errors.questions[qIndex]?.correct
            ? "errorCard"
            : ""
        }`}
        ref={(el) => (questionRefs.current[qIndex] = el)}
      >
        {/* HEADER */}
        <div className="questionHeader">
          <h3>Q {qLabel}</h3>
          <div className="rightControls">
            <div className="typeSelector">
              {["text", "image", "mixed"].map((type) => (
                <label key={type} className={q.type === type ? "active" : ""}>
                  <input
                    type="radio"
                    name={`type-${qIndex}`}
                    value={type}
                    checked={q.type === type}
                    onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div className="moveBtns">
              <FiArrowUp onClick={() => moveQuestion(qIndex, -1)} />
              <FiArrowDown onClick={() => moveQuestion(qIndex, 1)} />
            </div>
          </div>
        </div>
        <div className="answerTypeSelector">
          <label>Answer Type</label>
          <div>
            {[
              ["single", "Single Choice"],
              ["multiple", "Multiple Choice"],
              ["descriptive", "Descriptive"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={(q.answerType || "single") === value ? "active" : ""}
                onClick={() => updateQuestion(qIndex, "answerType", value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* QUESTION */}
        {(q.type === "text" || q.type === "mixed") && (
          <div className="questionInputWrapper">
            <span className="qPrefix">Q{qLabel}.</span>
            <input
              className="questionInput"
              placeholder="Enter question"
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
            />
          </div>
        )}
        {(q.type === "image" || q.type === "mixed") && (
          <div className="questionImageBox">
            <label>
              <FiUpload />{" "}
              {qImageUploading ? "Uploading..." : "Upload Question Image"}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                hidden
                disabled={qImageUploading}
                onChange={(e) =>
                  handleQuestionImageChange(qIndex, e.target.files[0])
                }
              />
            </label>
            {q.questionImage && <img src={q.questionImage} className="previewImage" />}
          </div>
        )}
        {errors.questions[qIndex]?.question && (
          <p className="errorText questionError">{errors.questions[qIndex].question}</p>
        )}
        {/* HINDI TOGGLE */}
        <button
          type="button"
          className={`hindiToggleBtn ${hindiOpen[qIndex] ? "active" : ""}`}
          onClick={() => toggleHindi(qIndex)}
        >
          {hindiOpen[qIndex] ? "▲ Hide Hindi" : "▼ Add Hindi Translation"}
        </button>
        {hindiOpen[qIndex] && (
          <div className="hindiSection">
            {(q.type === "text" || q.type === "mixed") && (
              <div className="questionInputWrapper">
                <span className="qPrefix hi">HI</span>
                <input
                  className="questionInput"
                  placeholder="प्रश्न हिंदी में लिखें"
                  value={q.questionHi || ""}
                  onChange={(e) => updateQuestion(qIndex, "questionHi", e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        {/* OPTIONS */}
        {q.answerType !== "descriptive" && (
          <>
            <div className="optionsGrid">
              {q.options.map((opt, i) => {
                const optUploading = Boolean(uploadingMap[`opt-${qIndex}-${i}`]);
                return (
                  <div key={i} className="optionBox">
                    {(q.type === "text" || q.type === "mixed") && (
                      <>
                        <input
                          placeholder={`Option ${i + 1}`}
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, i, "text", e.target.value)}
                        />
                        {hindiOpen[qIndex] && (
                          <input
                            className="hindiOptionInput"
                            placeholder={`विकल्प ${i + 1} (Hindi)`}
                            value={q.optionsHi?.[i]?.text || ""}
                            onChange={(e) => updateOptionHi(qIndex, i, e.target.value)}
                          />
                        )}
                      </>
                    )}
                    {(q.type === "image" || q.type === "mixed") && (
                      <div className="optionUpload">
                        <label>
                          <FiUpload />
                          {optUploading && <span> Uploading...</span>}
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            hidden
                            disabled={optUploading}
                            onChange={(e) =>
                              handleOptionImageChange(qIndex, i, e.target.files[0])
                            }
                          />
                        </label>
                        {opt.image && <img src={opt.image} className="optionPreview" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.questions[qIndex]?.options && (
              <p className="errorText questionError">{errors.questions[qIndex].options}</p>
            )}
          </>
        )}
        {/* CORRECT ANSWER */}
        {q.answerType === "multiple" ? (
          <div className="correctMulti">
            <span>Select correct options</span>
            {[0, 1, 2, 3].map((optionIndex) => (
              <label key={optionIndex}>
                <input
                  type="checkbox"
                  checked={Array.isArray(q.correctAnswer) && q.correctAnswer.includes(String(optionIndex))}
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                    const nextAnswers = e.target.checked
                      ? [...currentAnswers, String(optionIndex)]
                      : currentAnswers.filter((value) => value !== String(optionIndex));
                    updateQuestion(qIndex, "correctAnswer", nextAnswers);
                  }}
                />
                Option {optionIndex + 1}
              </label>
            ))}
          </div>
        ) : q.answerType === "descriptive" ? (
          <textarea
            className="descriptiveAnswer"
            placeholder="Expected answer for auto-checking (optional)"
            value={q.correctAnswer || ""}
            onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
          />
        ) : (
          <select
            className="correctSelect"
            value={q.correctAnswer}
            onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
          >
            <option value="" disabled>Select Correct Option</option>
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        )}
        <div className="deleteBtn">
          <FiTrash2 onClick={() => setDeleteIndex(qIndex)} />
        </div>
        {errors.questions[qIndex]?.correct && (
          <p className="errorText questionError">{errors.questions[qIndex].correct}</p>
        )}
      </div>
    );
  };

  return (
    <div className="createQuiz">
      <div className="header">
        <h1>{isEditMode ? "Edit Quiz" : "Create Quiz"}</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="saveBtn"
            onClick={handleSave}
            disabled={isUploading}
            title={isUploading ? "Waiting for image upload to finish" : ""}
          >
            {isUploading
              ? "Uploading..."
              : isEditMode
                ? "Update Quiz"
                : "Save Quiz"}
          </button>

          {/* 🔥 ADD THIS */}
          <button className="refreshBtn" onClick={handleRefreshClick}>
            Refresh
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="quizFormNew">
        {/* TITLE */}
        <div className="field full">
          <label>Quiz Title</label>
          <input
            ref={titleRef}
            placeholder="Enter quiz title"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          />
          {errors.title && <p className="errorText">{errors.title}</p>}
        </div>

        {/* DURATION */}
        <div className="field small">
          <label>Duration (minutes)</label>
          <input
            type="number"
            value={quiz.duration ?? ""}
            min="1"
            max="600"
            onChange={(e) => {
              const val = e.target.value;

              if (val === "") {
                setQuiz({ ...quiz, duration: "" });
                return;
              }

              let num = Number(val);
              if (isNaN(num)) return;

              // 🔥 clamp value
              if (num < 1) num = 1;
              if (num > 600) num = 600;

              setQuiz({ ...quiz, duration: num });
            }}
            onBlur={() => {
              if (!quiz.duration || quiz.duration < 1) {
                setQuiz({ ...quiz, duration: 5 });
              }
            }}
          />
          {errors.duration && <p className="errorText">{errors.duration}</p>}
        </div>

        {/* EACH MARKS */}
        <div className="field small">
          <label>Each Question Mark</label>
          <input
            type="number"
            value={eachMarks ?? ""}
            min="1"
            max="100"
            onChange={(e) => {
              const val = e.target.value;

              if (val === "") {
                setEachMarks("");
                return;
              }

              let num = Number(val);
              if (isNaN(num)) return;

              // clamp
              if (num < 1) num = 1;
              if (num > 100) num = 100;

              setEachMarks(num);
            }}
            onBlur={() => {
              if (!eachMarks || eachMarks < 1) {
                setEachMarks(1);
              }
            }}
          />
        </div>

        {/* NEGATIVE */}
        <div className="field negative">
          <label>Negative Marking</label>

          <div className="negRow">
            <span>{negativeMarking ? "ON" : "OFF"}</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={negativeMarking}
                onChange={() => {
                  const newState = !negativeMarking;
                  setNegativeMarking(newState);

                  if (newState) {
                    setNegativeValue(-0.5); // ✅ always reset to 0.5
                  }
                }}
              />
              <span className="slider"></span>
            </label>

            {negativeMarking && (
              <input
                type="number"
                step="0.01"
                className="negInput"
                value={negativeValue ?? ""}
                min="-10"
                max="-0.5"
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === "") {
                    setNegativeValue("");
                    return;
                  }

                  let num = Number(val);
                  if (isNaN(num)) return;

                  if (num > 0) num = -num;
                  if (num > -0.5) num = -0.5;
                  if (num < -10) num = -10;

                  // limit to 2 decimal places
                  num = Math.round(num * 100) / 100;

                  setNegativeValue(num);
                }}
                onBlur={() => {
                  if (!negativeValue || negativeValue >= 0) {
                    setNegativeValue(-0.5);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* QUESTIONS */}
      <div className="questionsSection">
        {(() => {
          const groups = [];
          let current = null;
          quiz.questions.forEach((q, i) => {
            if (q.type === "section") {
              if (current) groups.push(current);
              current = { sectionIdx: i, questionIndices: [] };
            } else {
              if (!current) current = { sectionIdx: null, questionIndices: [] };
              current.questionIndices.push(i);
            }
          });
          if (current) groups.push(current);

          return groups.map((group, gIdx) => {
            if (group.sectionIdx === null) {
              return (
                <div key={`ug-${gIdx}`} className="ungroupedQuestions">
                  {group.questionIndices.map((qIndex) => renderQuestionCard(qIndex))}
                </div>
              );
            }
            const secQ = quiz.questions[group.sectionIdx];
            const lastIdx = group.questionIndices.length > 0
              ? group.questionIndices[group.questionIndices.length - 1]
              : group.sectionIdx;
            const insertAt = lastIdx + 1;
            return (
              <div key={`sg-${gIdx}`} className="sectionGroup">
                <div className="sectionGroupHeader" ref={(el) => (questionRefs.current[group.sectionIdx] = el)}>
                  <div className="sectionGroupLeft">
                    <span className="sectionPill">SECTION</span>
                    <input
                      className="sectionNameInput"
                      placeholder="Section name (e.g. General Awareness)"
                      value={secQ.question}
                      onChange={(e) => updateQuestion(group.sectionIdx, "question", e.target.value)}
                    />
                  </div>
                  <div className="sectionGroupActions">
                    <button type="button" className="secMoveBtn" onClick={() => moveQuestion(group.sectionIdx, -1)}><FiArrowUp /></button>
                    <button type="button" className="secMoveBtn" onClick={() => moveQuestion(group.sectionIdx, 1)}><FiArrowDown /></button>
                    <button type="button" className="secDeleteBtn" onClick={() => setDeleteIndex(group.sectionIdx)}><FiTrash2 /></button>
                  </div>
                </div>
                <div className="sectionQuestions">
                  {group.questionIndices.length === 0 && (
                    <p className="sectionEmpty">No questions yet. Add one below.</p>
                  )}
                  {group.questionIndices.map((qIndex) => renderQuestionCard(qIndex))}
                </div>
                <div className="addQInSectionRow">
                  <button type="button" className="addQInSectionBtn" onClick={() => addQuestionAt(insertAt)}>
                    <FiPlus /> Add Question to this Section
                  </button>
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className="addQuestionWrapper">
        <button className="addBtn" onClick={addQuestion}>
          <FiPlus /> Add Question
        </button>
        <button className="addSectionBtn" onClick={addSection}>
          <FiPlus /> Add Section
        </button>

        <label className={`addPdfBtn ${pdfLoading ? "loading" : ""}`}>
          {pdfLoading ? "Processing..." : <><FiUpload /> Upload PDF</>}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            disabled={pdfLoading}
            onChange={(e) => handlePdfUpload(e.target.files[0])}
          />
        </label>
      </div>

      {deleteIndex !== null && (
        <div className="modalOverlay" onClick={() => setDeleteIndex(null)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            {/* CLOSE */}
            <div className="modalClose">
              <FiX onClick={() => setDeleteIndex(null)} />
            </div>

            <h3>Delete Question</h3>
            <p>Do you want to delete Q{deleteIndex + 1}?</p>

            <div className="modalActions">
              <button
                className="cancelBtn"
                onClick={() => setDeleteIndex(null)}
              >
                No
              </button>

              <button className="deleteConfirmBtn" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="modalOverlay" onClick={() => setShowSaveModal(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <div className="modalClose">
              <FiX onClick={() => setShowSaveModal(false)} />
            </div>

            <h3>Confirm Save</h3>
            <p>Are you sure you want to save the quiz?</p>

            <div className="negativePreview">
              Negative Marking:{" "}
              {negativeMarking ? `ON (${negativeValue})` : "OFF"}
            </div>

            <div className="modalActions">
              <button
                className="cancelBtn"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>

              <button className="deleteConfirmBtn" onClick={handleSubmit}>
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefreshModal && (
        <div
          className="modalOverlay"
          onClick={() => setShowRefreshModal(false)}
        >
          <div className="refreshModal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to refresh?</h3>
            <p>
              If you refresh this page, your current data will be lost. Do you
              want to continue?
            </p>

            <div className="modalActions">
              <button
                className="cancelBtn"
                onClick={() => setShowRefreshModal(false)}
              >
                No
              </button>

              <button className="confirmBtn" onClick={confirmRefresh}>
                Yes, Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;
