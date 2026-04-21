import { useEffect, useState, useRef } from "react";

export default function useAntiCheat(started, onForceSubmit) {
  const [violationCount, setViolationCount] = useState(0);
  const [showViolation, setShowViolation] = useState(false);

  const restoringRef = useRef(false);
  const intervalRef = useRef(null);

  const triggerViolation = (source = "unknown") => {
    console.log("🚨 Violation triggered from:", source);

    setViolationCount((prev) => {
      const newCount = prev + 1;

      console.log("❗ Total violations:", newCount);

      setShowViolation(true);
      setTimeout(() => setShowViolation(false), 1200);

      if (newCount >= 4) {
        console.log("⛔ Force submitting quiz");
        onForceSubmit(true);
      }

      return newCount;
    });
  };

  // ✅ ESC detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!started) return;

      if (e.key === "Escape") {
        console.log("⌨️ ESC pressed");
        triggerViolation("ESC");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started]);

  // ✅ FULLSCREEN CHANGE DETECTION
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!started) return;

      if (!document.fullscreenElement) {
        console.log("🟥 Exited fullscreen");
        triggerViolation("fullscreen-exit");
      } else {
        console.log("🟩 Entered fullscreen");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, [started]);

  // ✅ 🔥 CONTINUOUS WATCHDOG (THIS IS THE REAL FIX)
  useEffect(() => {
    if (!started) return;

    intervalRef.current = setInterval(() => {
      if (!document.fullscreenElement && !restoringRef.current) {
        restoringRef.current = true;

        console.log("⚡ Forcing fullscreen back...");

        document.documentElement.requestFullscreen().catch((err) => {
          console.log("❌ Fullscreen failed:", err);
        });

        setTimeout(() => {
          restoringRef.current = false;
        }, 150);
      }
    }, 300); // 🔥 check every 300ms

    return () => clearInterval(intervalRef.current);
  }, [started]);

  return {
    violationCount,
    showViolation,
  };
}