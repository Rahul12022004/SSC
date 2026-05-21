import { useEffect, useState, useRef } from "react";

export default function useAntiCheat(started, onForceSubmit) {
  const [violationCount, setViolationCount] = useState(0);
  const [showViolation, setShowViolation] = useState(false);

  const restoringRef = useRef(false);
  const intervalRef = useRef(null);

  const triggerViolation = (source = "unknown") => {
    setViolationCount((prev) => {
      const newCount = prev + 1;

      setShowViolation(true);
      setTimeout(() => setShowViolation(false), 1200);

      if (newCount >= 4) {
        onForceSubmit(true);
      }

      return newCount;
    });
  };

  // ESC detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!started) return;

      if (e.key === "Escape") {
        triggerViolation("ESC");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!started) return;

      if (!document.fullscreenElement) {
        triggerViolation("fullscreen-exit");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, [started]);

  // Continuous watchdog: restore fullscreen if exited
  useEffect(() => {
    if (!started) return;

    intervalRef.current = setInterval(() => {
      if (!document.fullscreenElement && !restoringRef.current) {
        restoringRef.current = true;

        document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen restore failed — browser may have blocked it
        });

        setTimeout(() => {
          restoringRef.current = false;
        }, 150);
      }
    }, 300);

    return () => clearInterval(intervalRef.current);
  }, [started]);

  return {
    violationCount,
    showViolation,
  };
}
