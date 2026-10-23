
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();

        if (!cancelled) {
          setUser(normalizeUser(data.user));
        }
      } catch (error) {
        if (!cancelled) {
          sessionStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const register = async (userData) => {
    const data = await registerRequest(userData);

    if (data.token) {
      sessionStorage.setItem("token", data.token);
    }

    setUser(normalizeUser(data.user));

    return data;
  };

  const login = async (userData) => {
    const data = await loginRequest(userData);

    if (data.token) {
      sessionStorage.setItem("token", data.token);
    }

    setUser(normalizeUser(data.user));

    return data;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
