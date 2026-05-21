import { useState } from "react";
import LoginCharacter from "@/common/components/LoginCharacter";

/**
 * Example usage of LoginCharacter component
 * This shows how to integrate it into your login page
 */
export default function LoginCharacterDemo() {
  const [characterState, setCharacterState] = useState("default");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simulate login validation
    if (password === "correct") {
      setCharacterState("happy");
      setTimeout(() => {
        alert("Login successful! 🎉");
        setCharacterState("default");
      }, 2000);
    } else {
      setCharacterState("angry");
      setTimeout(() => {
        setCharacterState("default");
      }, 2000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Inter', sans-serif",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "48px",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        
        {/* Character */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <LoginCharacter 
            state={characterState} 
            onPasswordFocus={isPasswordFocused}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1f2937",
          textAlign: "center",
          marginBottom: "8px"
        }}>
          Welcome Back!
        </h1>
        <p style={{
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "32px"
        }}>
          Sign in to continue to your account
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setCharacterState("default")}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.2s",
                fontFamily: "inherit"
              }}
              onFocusCapture={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlurCapture={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.2s",
                fontFamily: "inherit"
              }}
              onFocusCapture={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlurCapture={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
            <p style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "6px"
            }}>
              Hint: Try "correct" or any other password
            </p>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
          >
            Sign In
          </button>
        </form>

        {/* Demo Controls */}
        <div style={{
          marginTop: "32px",
          padding: "20px",
          background: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb"
        }}>
          <p style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Demo Controls
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setCharacterState("default")}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                background: characterState === "default" ? "#667eea" : "white",
                color: characterState === "default" ? "white" : "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Default
            </button>
            <button
              onClick={() => setCharacterState("happy")}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                background: characterState === "happy" ? "#10b981" : "white",
                color: characterState === "happy" ? "white" : "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Happy
            </button>
            <button
              onClick={() => setCharacterState("angry")}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                background: characterState === "angry" ? "#ef4444" : "white",
                color: characterState === "angry" ? "white" : "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Angry
            </button>
            <button
              onClick={() => setIsPasswordFocused(!isPasswordFocused)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                background: isPasswordFocused ? "#f59e0b" : "white",
                color: isPasswordFocused ? "white" : "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {isPasswordFocused ? "Show Eyes" : "Hide Eyes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
