import { useReducer, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { api } from "../services/api";
import { supabase, isConfigured } from "../services/supabase";

const initialState = {
  user: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SESSION":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOGOUT":
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { user } = await api.auth.getSession();
        if (mounted) {
          dispatch({ type: "SET_SESSION", payload: user });
        }
      } catch (err) {
        if (mounted) {
          console.error("Session initialization failed:", err);
          dispatch({ type: "SET_SESSION", payload: null });
        }
      }
    }

    initSession();

    // Listen to real Supabase auth state change if configured
    let subscription = null;
    if (isConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          dispatch({
            type: "SET_SESSION",
            payload: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split("@")[0],
            },
          });
        } else {
          dispatch({ type: "SET_SESSION", payload: null });
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { user } = await api.auth.login({ email, password });
      dispatch({ type: "SET_SESSION", payload: user });
      return { success: true, user };
    } catch (err) {
      const message = err?.message || "Failed to log in. Please try again.";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, error: message };
    }
  }

  async function register(email, password, name) {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await api.auth.register({ email, password, name });
      if (result.user) {
        dispatch({ type: "SET_SESSION", payload: result.user });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
      return { success: true, ...result };
    } catch (err) {
      const message = err?.message || "Registration failed.";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, error: message };
    }
  }

  async function logout() {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }

  function clearError() {
    dispatch({ type: "SET_ERROR", payload: null });
  }

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
