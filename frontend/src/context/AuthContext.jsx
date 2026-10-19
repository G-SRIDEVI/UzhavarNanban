import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("uzhavar_token"));
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const accounts = await api.getDemoAccounts();
        setDemoAccounts(accounts);
      } catch (err) {
        console.error("Failed to load demo accounts", err);
      }
    };
    fetchDemo();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Session expired or invalid", err);
          logout();
        }
      }
      setLoading(false);
    };
    loadCurrentUser();
  }, [token]);

  const login = async (mobileOrEmail, password) => {
    try {
      const data = await api.login({
        mobile_or_email: mobileOrEmail,
        password: password,
      });
      localStorage.setItem("uzhavar_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data;
    } catch (err) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (registerData) => {
    try {
      const data = await api.register(registerData);
      localStorage.setItem("uzhavar_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      toast.success(`Account created successfully! Welcome, ${data.user.name}`);
      return data;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("uzhavar_token");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
  };

  const quickLoginAs = async (account) => {
    try {
      await login(account.mobile, account.password);
    } catch (e) {
      toast.error(`Quick login failed: ${e.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoAccounts,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
