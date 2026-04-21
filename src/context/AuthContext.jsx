import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

//  Local / Production switch
// export const BASE_URL = "http://localhost:5000/api";

export const BASE_URL = "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= REGISTER =================
  const registerUser = async (data) => {
    console.log("📌 [REGISTER] Request Data:", data);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("📌 [REGISTER] Response Status:", res.status);

      const result = await res.json();
      console.log("📌 [REGISTER] Response Data:", result);

      if (!res.ok) {
        throw new Error(result.message || "Server error");
      }

      return result;
    } catch (error) {
      console.error("❌ [REGISTER] Error:", error.message);

      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // ================= LOGIN =================
  const loginUser = async (data) => {
    console.log("📌 [LOGIN] Request Data:", data);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("📌 [LOGIN] Response Status:", res.status);

      const result = await res.json();
      console.log("📌 [LOGIN] Response Data:", result);

      if (!res.ok) {
        throw new Error(result.message || "Server error");
      }

      if (result.success) {
        console.log("✅ [LOGIN] Setting user:", {
          role: result.role,
          roleLevel: result.roleLevel,
        });

        setUser({
          role: result.role,
          roleLevel: result.roleLevel,
        });
      }

      return result;
    } catch (error) {
      console.error("[LOGIN] Error:", error.message);

      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // ================= VALIDATE =================
  const validateUser = async () => {
    console.log("📌 [VALIDATE] Checking user session...");

    try {
      const res = await fetch(`${BASE_URL}/auth/validate`, {
        credentials: "include",
      });

      console.log("📌 [VALIDATE] Response Status:", res.status);

      const result = await res.json();
      console.log("📌 [VALIDATE] Response Data:", result);

      if (!res.ok) {
        throw new Error(result.message || "Server error");
      }

      if (result.success) {
        console.log("✅ [VALIDATE] User valid:", result.user);
        setUser(result.user);
        return true;
      } else {
        console.log("⚠️ [VALIDATE] Invalid user");
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("❌ [VALIDATE] Error:", error.message);
      setUser(null);
      return false;
    }
  };

  // ================= LOGOUT =================
  const logoutUser = async () => {
    console.log("📌 [LOGOUT] Logging out user...");

    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      console.log("📌 [LOGOUT] Response Status:", res.status);
    } catch (error) {
      console.error("❌ [LOGOUT] Error:", error.message);
    }

    setUser(null);
    console.log("✅ [LOGOUT] User cleared from state");

    // better than full reload
    window.location.replace("/");
  };

  // ================= INIT =================
  useEffect(() => {
    console.log("📌 [INIT] Initializing auth...");

    const initAuth = async () => {
      const isValid = await validateUser();
      console.log("📌 [INIT] Validation result:", isValid);

      setLoading(false);
      console.log("📌 [INIT] Loading set to false");
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registerUser,
        loginUser,
        validateUser,
        logoutUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ================= HOOK =================
export const useAuth = () => useContext(AuthContext);