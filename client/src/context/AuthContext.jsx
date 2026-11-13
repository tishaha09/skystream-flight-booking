import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../services/api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("skystream_token"));
  const [loading, setLoading] = useState(true);

  // Load current user profile on app startup if token exists
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem("skystream_token");
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/auth/me");
      if (data && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn("Session expired or token invalid:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // User Login
  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (data.token && data.user) {
      localStorage.setItem("skystream_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // User Registration
  const register = async (userData) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: userData,
    });

    if (data.token && data.user) {
      localStorage.setItem("skystream_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("skystream_token");
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const data = await apiRequest("/auth/profile", {
      method: "PUT",
      body: profileData,
    });

    if (data.token) {
      localStorage.setItem("skystream_token", data.token);
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
