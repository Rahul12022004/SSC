/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Local / Production switch
// export const BASE_URL = "http://localhost:5000/api";
export const BASE_URL = "/api";

const parseJsonResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const getUserFromAuthResult = (result) => ({
  email: result.email,
  role: result.role,
  roleLevel: result.roleLevel,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        return {
          success: false,
          message: result.message || "Server error",
        };
      }

      return result;
    } catch {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await parseJsonResponse(res);

      if (!res.ok) {
        return {
          success: false,
          message: result.message || "Server error",
        };
      }

      if (result.success) {
        setUser(getUserFromAuthResult(result));
      } else {
        setUser(null);
      }

      return result;
    } catch {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  const validateUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/validate`, {
        credentials: "include",
      });

      const result = await parseJsonResponse(res);

      if (!res.ok || !result.success) {
        setUser(null);
        return false;
      }

      setUser(result.user);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Clear local auth state even if the logout request fails.
    }

    setUser(null);
    window.location.replace("/");
  };

  useEffect(() => {
    const initAuth = async () => {
      await validateUser();
      setLoading(false);
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

export const useAuth = () => useContext(AuthContext);
