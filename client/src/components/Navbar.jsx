import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import NotificationBell from "./NotificationBell.jsx";

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navTabClass = ({ isActive }) =>
    `text-sm font-bold px-3 py-2 transition-all relative ${
      isActive
        ? "text-[#113B7A] after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-[#113B7A] after:rounded-full"
        : "text-slate-600 hover:text-[#113B7A]"
    }`;

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-6">
        
        {/* Brand Logo (Left) */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-full bg-[#113B7A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0B2545] transition-colors">
            <svg className="w-4.5 h-4.5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-[#113B7A]">
            Sky<span className="text-sky-500">Stream</span>
          </span>
        </Link>

        {/* Right Navigation & Actions */}
        <div className="hidden lg:flex items-center space-x-8 shrink-0">
          <nav className="flex items-center space-x-6">
            <NavLink to="/" end className={navTabClass}>
              Home
            </NavLink>
            <NavLink to="/flights" className={navTabClass}>
              Flights
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navTabClass}>
                <span className="inline-flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Admin</span>
                </span>
              </NavLink>
            )}
          </nav>

          {/* Decorative Dot Matrix on the far right */}
          <div className="flex items-center space-x-1.5 px-1 text-slate-300 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#113B7A]"></span>
          </div>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs font-semibold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-[#113B7A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[120px]">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-[#113B7A] px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-[#113B7A] hover:bg-[#0B2545] px-4 py-2 rounded-full shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center space-x-2">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#113B7A]"
            >
              Home
            </NavLink>
            <NavLink
              to="/flights"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#113B7A]"
            >
              Flights
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                Admin Console
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Passenger Profile ({user.name})
              </NavLink>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex w-full space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-[#113B7A] rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
