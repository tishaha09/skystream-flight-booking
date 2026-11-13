import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../components/Button.jsx";

export const AuthPage = ({ initialMode = "login" }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus refs
  const loginEmailRef = useRef(null);
  const registerNameRef = useRef(null);

  const from = location.state?.from?.pathname || "/";

  // Sync mode with route if navigating between /login and /register
  useEffect(() => {
    if (location.pathname === "/register" && mode !== "register") {
      switchMode("register");
    } else if (location.pathname === "/login" && mode !== "login") {
      switchMode("login");
    }
  }, [location.pathname]);

  // Mode switcher with focus transfer and error clearing
  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");

    // Update URL smoothly
    if (newMode === "login" && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    } else if (newMode === "register" && location.pathname !== "/register") {
      navigate("/register", { replace: true });
    }

    // Transfer focus to the first input of the active form
    setTimeout(() => {
      if (newMode === "login") {
        loginEmailRef.current?.focus();
      } else {
        registerNameRef.current?.focus();
      }
    }, 60);
  };

  // Input change handlers
  const handleLoginChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // One-click demo credentials filler
  const fillDemo = (role) => {
    if (role === "admin") {
      setLoginData({
        email: "admin@skystream.com",
        password: "admin123",
      });
    } else {
      setLoginData({
        email: "john@example.com",
        password: "password123",
      });
    }
    setError("");
    if (mode !== "login") switchMode("login");
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError("Please provide both email address and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(loginData.email, loginData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError("Name, email address, and password are required.");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the SkyStream Terms of Carriage and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register(registerData.name, registerData.email, registerData.password, registerData.phone);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. This email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength score
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { score, label: "Moderate", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(registerData.password);

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#EAEEF3]">
      <div className="w-full max-w-lg bg-white rounded-3xl sm:rounded-[32px] border border-slate-200 shadow-sm p-6 sm:p-10 transition-all">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-full bg-[#113B7A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0B2545] transition-colors">
              <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#113B7A]">
              Sky<span className="text-sky-500">Stream</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Sign In to Your Account" : "Create Your Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "login"
              ? "Enter your credentials to access your flights and reservations."
              : "Enter your details to create an account for booking flights."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 mb-6 max-w-xs mx-auto w-full">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
              mode === "login"
                ? "bg-[#113B7A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
              mode === "register"
                ? "bg-[#113B7A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error & Success Feedback */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
            <svg className="w-4 h-4 shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
            <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SIGN IN FORM                                             */}
        {/* ======================================================== */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                ref={loginEmailRef}
                type="email"
                name="email"
                autoComplete="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="e.g. passenger@skystream.airline"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-[#113B7A] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#113B7A] focus:ring-0"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="navy"
                loading={loading}
                className="w-full h-11 text-white font-bold rounded-xl shadow-xs transition-all"
              >
                Sign In to SkyStream
              </Button>
            </div>
          </form>
        ) : (
          /* ======================================================== */
          /* REGISTER FORM                                            */
          /* ======================================================== */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                ref={registerNameRef}
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                placeholder="e.g. Captain Sarah Jenkins"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="sarah@airline.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Strength Meter */}
              {registerData.password && (
                <div className="mt-1.5 flex items-center space-x-2">
                  <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#113B7A] focus:bg-white focus:outline-none transition-all font-medium text-slate-900 placeholder-slate-400 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#113B7A] focus:ring-0"
                />
                <span>
                  I accept the Conditions of Carriage and Privacy Policy.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="navy"
                loading={loading}
                className="w-full h-11 text-white font-bold rounded-xl shadow-xs transition-all"
              >
                Create SkyStream Account
              </Button>
            </div>
          </form>
        )}

        {/* Bottom Switcher Link */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-bold text-[#113B7A] hover:underline"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-[#113B7A] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Login in Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
            One-Click Demo Login:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillDemo("user")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all shadow-xs"
            >
              👤 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-[#113B7A] border border-sky-200 hover:bg-sky-100 transition-all shadow-xs"
            >
              ⚡ Fleet Admin
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Password Reset</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Enter your registered email address and we will dispatch password recovery verification link to your inbox.
            </p>
            <input
              type="email"
              placeholder="e.g. passenger@skystream.airline"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 mb-4"
            />
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setForgotModalOpen(false);
                  setSuccessMsg("Password reset dispatched. Please check your inbox.");
                }}
              >
                Send Instructions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
