import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

/**
 * LoginCharacter - Animated SVG character for login page
 * 
 * Props:
 * - state: 'default' | 'happy' | 'angry' | 'hiding'
 * - onPasswordFocus: boolean - triggers hand covering eyes
 */
export default function LoginCharacter({ state = "default", onPasswordFocus = false }) {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!svgRef.current || onPasswordFocus) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 300;
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      
      const eyeX = (dx / distance) * normalizedDistance * 5;
      const eyeY = (dy / distance) * normalizedDistance * 5;
      
      setEyePosition({ x: eyeX || 0, y: eyeY || 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [onPasswordFocus]);

  // Expression configurations
  const expressions = {
    default: {
      leftBrow: { y: 72, rotate: 0 },
      rightBrow: { y: 72, rotate: 0 },
      mouth: "M135 145 Q160 165 185 145",
      eyeScale: 1,
    },
    happy: {
      leftBrow: { y: 68, rotate: -5 },
      rightBrow: { y: 68, rotate: 5 },
      mouth: "M130 140 Q160 170 190 140",
      eyeScale: 1.1,
    },
    angry: {
      leftBrow: { y: 78, rotate: 15 },
      rightBrow: { y: 78, rotate: -15 },
      mouth: "M135 155 Q160 145 185 155",
      eyeScale: 0.9,
    },
    hiding: {
      leftBrow: { y: 72, rotate: 0 },
      rightBrow: { y: 72, rotate: 0 },
      mouth: "M140 150 Q160 155 180 150",
      eyeScale: 0.3,
    },
  };

  const currentExpression = expressions[state] || expressions.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "inline-block" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          ref={svgRef}
          id="character"
          width="320"
          height="320"
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5B8CFF" />
              <stop offset="100%" stopColor="#4f7cff" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD4A3" />
              <stop offset="100%" stopColor="#f5c88f" />
            </linearGradient>
            <filter id="softShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="160" cy="280" rx="70" ry="18" fill="#d9d9d9" opacity="0.4" />

          {/* Body */}
          <rect
            x="110"
            y="150"
            width="100"
            height="100"
            rx="30"
            fill="url(#bodyGrad)"
            filter="url(#softShadow)"
          />

          {/* Neck */}
          <rect x="145" y="130" width="30" height="30" rx="10" fill="#f1c27d" />

          {/* Head */}
          <circle cx="160" cy="100" r="70" fill="url(#skinGrad)" filter="url(#softShadow)" />

          {/* Hair */}
          <path
            d="M95 95 C100 30 220 30 225 95 L225 85 C220 40 100 40 95 85 Z"
            fill="#1f2937"
          />
          <ellipse cx="160" cy="60" rx="60" ry="45" fill="#1f2937" />

          {/* Left Ear */}
          <circle cx="92" cy="105" r="12" fill="#f1c27d" />
          <circle cx="92" cy="108" r="6" fill="#E8A97A" opacity="0.5" />

          {/* Right Ear */}
          <circle cx="228" cy="105" r="12" fill="#f1c27d" />
          <circle cx="228" cy="108" r="6" fill="#E8A97A" opacity="0.5" />

          {/* Eyebrows */}
          <motion.g
            animate={{
              y: currentExpression.leftBrow.y,
              rotate: currentExpression.leftBrow.rotate,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformOrigin: "135px 75px" }}
          >
            <rect x="120" y="72" width="30" height="6" rx="3" fill="#222" />
          </motion.g>

          <motion.g
            animate={{
              y: currentExpression.rightBrow.y,
              rotate: currentExpression.rightBrow.rotate,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformOrigin: "185px 75px" }}
          >
            <rect x="170" y="72" width="30" height="6" rx="3" fill="#222" />
          </motion.g>

          {/* Eyes */}
          <g id="eyes">
            {/* Left Eye */}
            <circle cx="135" cy="100" r="18" fill="white" />
            <motion.g
              animate={{
                x: onPasswordFocus ? 0 : eyePosition.x,
                y: onPasswordFocus ? 0 : eyePosition.y,
                scale: currentExpression.eyeScale,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <circle cx="135" cy="100" r="9" fill="#3B82F6" />
              <circle cx="135" cy="100" r="7" fill="#111" />
              <circle cx="137" cy="98" r="3" fill="white" opacity="0.9" />
            </motion.g>

            {/* Right Eye */}
            <circle cx="185" cy="100" r="18" fill="white" />
            <motion.g
              animate={{
                x: onPasswordFocus ? 0 : eyePosition.x,
                y: onPasswordFocus ? 0 : eyePosition.y,
                scale: currentExpression.eyeScale,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <circle cx="185" cy="100" r="9" fill="#3B82F6" />
              <circle cx="185" cy="100" r="7" fill="#111" />
              <circle cx="187" cy="98" r="3" fill="white" opacity="0.9" />
            </motion.g>
          </g>

          {/* Mouth */}
          <motion.path
            d={currentExpression.mouth}
            stroke="#222"
            strokeWidth="5"
            fill="transparent"
            strokeLinecap="round"
            animate={{ d: currentExpression.mouth }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          {/* Cheeks */}
          <motion.ellipse
            cx="110"
            cy="120"
            rx="15"
            ry="10"
            fill="#FFB3A0"
            opacity={state === "happy" ? 0.6 : 0.3}
            animate={{ opacity: state === "happy" ? 0.6 : 0.3 }}
          />
          <motion.ellipse
            cx="210"
            cy="120"
            rx="15"
            ry="10"
            fill="#FFB3A0"
            opacity={state === "happy" ? 0.6 : 0.3}
            animate={{ opacity: state === "happy" ? 0.6 : 0.3 }}
          />

          {/* Left Arm */}
          <motion.g
            animate={{
              rotate: state === "happy" ? [0, -15, 0] : 0,
              x: onPasswordFocus ? 30 : 0,
              y: onPasswordFocus ? -80 : 0,
            }}
            transition={{
              rotate: { duration: 0.6, repeat: state === "happy" ? Infinity : 0 },
              x: { type: "spring", stiffness: 150, damping: 15 },
              y: { type: "spring", stiffness: 150, damping: 15 },
            }}
            style={{ transformOrigin: "97px 173px" }}
          >
            <rect
              x="80"
              y="165"
              width="35"
              height="16"
              rx="8"
              fill="url(#skinGrad)"
              transform="rotate(-15 97 173)"
            />
            {/* Fingers */}
            {onPasswordFocus && (
              <g>
                <rect x="108" y="88" width="4" height="12" rx="2" fill="url(#skinGrad)" />
                <rect x="114" y="86" width="4" height="14" rx="2" fill="url(#skinGrad)" />
                <rect x="120" y="87" width="4" height="13" rx="2" fill="url(#skinGrad)" />
              </g>
            )}
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={{
              rotate: state === "happy" ? [0, 15, 0] : 0,
              x: onPasswordFocus ? -30 : 0,
              y: onPasswordFocus ? -80 : 0,
            }}
            transition={{
              rotate: { duration: 0.6, repeat: state === "happy" ? Infinity : 0, delay: 0.1 },
              x: { type: "spring", stiffness: 150, damping: 15 },
              y: { type: "spring", stiffness: 150, damping: 15 },
            }}
            style={{ transformOrigin: "222px 173px" }}
          >
            <rect
              x="205"
              y="165"
              width="35"
              height="16"
              rx="8"
              fill="url(#skinGrad)"
              transform="rotate(15 222 173)"
            />
            {/* Fingers */}
            {onPasswordFocus && (
              <g>
                <rect x="196" y="88" width="4" height="12" rx="2" fill="url(#skinGrad)" />
                <rect x="190" y="86" width="4" height="14" rx="2" fill="url(#skinGrad)" />
                <rect x="184" y="87" width="4" height="13" rx="2" fill="url(#skinGrad)" />
              </g>
            )}
          </motion.g>

          {/* Angry sweat drops */}
          {state === "angry" && (
            <>
              <motion.ellipse
                cx="105"
                cy="85"
                rx="4"
                ry="6"
                fill="#4f7cff"
                opacity="0.6"
                animate={{ y: [0, 10, 0], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.ellipse
                cx="215"
                cy="85"
                rx="4"
                ry="6"
                fill="#4f7cff"
                opacity="0.6"
                animate={{ y: [0, 10, 0], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Happy sparkles */}
          {state === "happy" && (
            <>
              <motion.g
                animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  d="M100 70 L102 75 L107 77 L102 79 L100 84 L98 79 L93 77 L98 75 Z"
                  fill="#FFD700"
                />
              </motion.g>
              <motion.g
                animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                <path
                  d="M220 70 L222 75 L227 77 L222 79 L220 84 L218 79 L213 77 L218 75 Z"
                  fill="#FFD700"
                />
              </motion.g>
            </>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}
