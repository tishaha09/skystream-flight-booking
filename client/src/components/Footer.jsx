import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full bg-white text-slate-600 mt-16 border-t border-slate-200">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-xs">
                <svg className="w-4 h-4 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Sky<span className="text-sky-600">Stream</span> Airlines
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Global commercial flight operations, automated seat assignment, and digital boarding pass generation. Elevated air travel engineered for modern journeys.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a href="#twitter" aria-label="SkyStream on X" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center text-slate-500 transition-colors">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#instagram" aria-label="SkyStream on Instagram" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center text-slate-500 transition-colors">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#linkedin" aria-label="SkyStream on LinkedIn" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-center text-slate-500 transition-colors">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Flight Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Flight Search
                </Link>
              </li>
              <li>
                <Link to="/flights" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Commercial Schedules
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Manage Reservations
                </Link>
              </li>
              <li>
                <Link to="/flights?travelClass=Business" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Business & First Class
                </Link>
              </li>
              <li>
                <Link to="/flights?stops=0" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Direct Routes
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Hubs */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Popular Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/flights?destination=Tokyo" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Tokyo (HND)
                </Link>
              </li>
              <li>
                <Link to="/flights?destination=London" className="text-slate-500 hover:text-sky-600 transition-colors">
                  London Heathrow (LHR)
                </Link>
              </li>
              <li>
                <Link to="/flights?destination=Dubai" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Dubai (DXB)
                </Link>
              </li>
              <li>
                <Link to="/flights?destination=Singapore" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Singapore Changi (SIN)
                </Link>
              </li>
              <li>
                <Link to="/flights?destination=Mumbai" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Mumbai (BOM)
                </Link>
              </li>
            </ul>
          </div>

          {/* Airline Support */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-500">
                <span className="block text-[11px] font-semibold text-slate-700">24/7 Helpline:</span>
                +1 (800) 597-8732
              </li>
              <li className="text-slate-500">
                <span className="block text-[11px] font-semibold text-slate-700">Support Desk:</span>
                concierge@skystream.aero
              </li>
              <li>
                <a href="#baggage" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Baggage & Cargo Allowances
                </a>
              </li>
              <li>
                <a href="#safety" className="text-slate-500 hover:text-sky-600 transition-colors">
                  Aviation Safety Standards
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkyStream Airlines Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-3 sm:mt-0">
            <a href="#privacy" className="hover:text-sky-600 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-sky-600 transition-colors">Conditions of Carriage</a>
            <a href="#security" className="hover:text-sky-600 transition-colors">Security & Passenger Rights</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
