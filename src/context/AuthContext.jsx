import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

//  Local / Production switch
export const BASE_URL = "http://localhost:5000/api";

// export const BASE_URL = "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // REGISTER
  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      
      return result;
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // LOGIN 
  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setUser({
          role: result.role,
          roleLevel: result.roleLevel,
          email: result.email, // optional if backend sends
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  //  VALIDATE SESSION 
  const validateUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/validate`, {
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        setUser(result.user);
      } else {
        setUser(null);
      }

      return result.success;
    } catch (error) {
      setUser(null);
      return false;
    }
  };

  // LOGOUT
  const logoutUser = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network error on logout
    }

    setUser(null);
    window.location.href = "/";
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

// 🔗 Hook
export const useAuth = () => useContext(AuthContext);
