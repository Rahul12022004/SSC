/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// In dev: VITE_API_URL is empty → falls back to "/api" → Vite proxy forwards to local backend
// In prod: VITE_API_URL is the Railway URL → direct request
export const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "token";
const getToken = () => localStorage.getItem(TOKEN_KEY);
const saveToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);
const bearerHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const parseJsonResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const cleanName = (v) => (v && v !== "undefined" ? v : "");

const getUserFromAuthResult = (result) => ({
  email: result.email,
  role: result.role,
  roleLevel: result.roleLevel,
  firstName: cleanName(result.firstName),
  lastName: cleanName(result.lastName),
  profileImage: result.profileImage || "",
  phone: result.phone || "",
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        return { success: false, message: result.message || "Server error" };
      }

      return result;
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        return {
          ...result,
          success: false,
          status: res.status,
          message: result.message || "Server error",
        };
      }

      if (result.success) {
        if (result.token) saveToken(result.token);
        setUser(getUserFromAuthResult(result));
      } else {
        setUser(null);
      }

      return result;
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const validateUser = async (signal) => {
    if (!getToken()) {
      setUser(null);
      return false;
    }

    try {
      const options = { headers: bearerHeader() };
      if (signal) options.signal = signal;

      const res = await fetch(`${BASE_URL}/auth/validate`, options);

      if (res.status === 401) {
        clearToken();
        setUser(null);
        return false;
      }

      const result = await parseJsonResponse(res);

      if (!res.ok || !result.success) {
        clearToken();
        setUser(null);
        return false;
      }

      setUser(result.user ? result.user : getUserFromAuthResult(result));
      return true;
    } catch (err) {
      if (err?.name !== "AbortError") {
        // only clear user on non-network errors
        if (err?.message !== "Failed to fetch") setUser(null);
      }
      return false;
    }
  };

  const verifyOtp = async ({ email, otp }) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await parseJsonResponse(res);
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const resendOtp = async ({ email }) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await parseJsonResponse(res);
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...bearerHeader() },
        body: JSON.stringify(data),
      });
      const result = await parseJsonResponse(res);
      if (result.success) {
        if (result.token) saveToken(result.token);
        setUser(getUserFromAuthResult(result));
      }
      return result;
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const changePassword = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...bearerHeader() },
        body: JSON.stringify(data),
      });
      return await parseJsonResponse(res);
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${BASE_URL}/upload-image/avatar`, {
        method: "POST",
        headers: bearerHeader(),
        body: formData,
      });
      return await parseJsonResponse(res);
    } catch {
      return { success: false, message: "Upload failed. Please try again." };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: bearerHeader(),
      });
    } catch {
      // clear state even if request fails
    }

    clearToken();
    setUser(null);
    window.location.replace("/");
  };

  // AbortController prevents React Strict Mode double-call from leaving stale state
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const initAuth = async () => {
      await validateUser(controller.signal);
      if (active) setLoading(false);
    };

    initAuth();

    return () => {
      active = false;
      controller.abort();
    };
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
        verifyOtp,
        resendOtp,
        updateProfile,
        changePassword,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    // Return a default object instead of throwing error to prevent crashes
    return {
      user: null,
      loading: true,
      registerUser: async () => ({ success: false, message: "Auth not initialized" }),
      loginUser: async () => ({ success: false, message: "Auth not initialized" }),
      validateUser: async () => false,
      logoutUser: async () => {},
      verifyOtp: async () => ({ success: false, message: "Auth not initialized" }),
      resendOtp: async () => ({ success: false, message: "Auth not initialized" }),
      updateProfile: async () => ({ success: false, message: "Auth not initialized" }),
      changePassword: async () => ({ success: false, message: "Auth not initialized" }),
      uploadAvatar: async () => ({ success: false, message: "Auth not initialized" }),
    };
  }
  return context;
};
