import { createContext, useContext, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import authService from "../services/authService";
import storage from "../utils/storage";

const AuthContext = createContext(null);

/**
 * Holds the signed-in user for the whole app.
 * Wrapped around <App /> in main.jsx.
 */
export const AuthProvider = ({ children }) => {
  // Read once on first render so a page refresh keeps the session.
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(async (credentials) => {
    setIsSubmitting(true);
    try {
      const result = await authService.login(credentials);
      const nextUser = result.user || authService.getCurrentUser();
      storage.setUser(nextUser);
      setUser(nextUser);
      toast.success(`Welcome back, ${nextUser?.fullName || "there"}.`);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const forgotPassword = useCallback(async (identifier) => {
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword({ identifier });
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (values) => {
    setIsSubmitting(true);
    try {
      const created = await authService.register(values);
      toast.success("Account created. Sign in to continue.");
      return created;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success("Signed out.");
  }, []);

  /** Keeps context and storage in step after a profile edit. */
  const updateUser = useCallback((partial) => {
    setUser((current) => {
      const next = { ...(current || {}), ...partial };
      storage.setUser(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(storage.getToken()),
      isAdmin: user?.role === "ADMIN",
      isSubmitting,
      login,
      forgotPassword,
      register,
      logout,
      updateUser,
    }),
    [user, isSubmitting, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
};

export default useAuth;
