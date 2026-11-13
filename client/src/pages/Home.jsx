import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { formatCurrency } from "../utils/formatters.js";

// Comprehensive airport catalog for intelligent auto-suggestions
const AIRPORTS = [
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International", country: "India" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj", country: "India" },
  { city: "Abu Dhabi", code: "AUH", airport: "Zayed International", country: "United Arab Emirates" },
  { city: "Chennai", code: "MAA", airport: "Chennai International", country: "India" },
  { city: "Athens", code: "ATH", airport: "Athens International", country: "Greece" },
  { city: "Bengaluru", code: "BLR", airport: "Kempegowda International", country: "India" },
  { city: "Dubai", code: "DXB", airport: "Dubai International", country: "United Arab Emirates" },
  { city: "London", code: "LHR", airport: "London Heathrow", country: "United Kingdom" },
  { city: "Singapore", code: "SIN", airport: "Singapore Changi", country: "Singapore" },
  { city: "Tokyo", code: "HND", airport: "Tokyo Haneda", country: "Japan" },
  { city: "Goa", code: "GOI", airport: "Dabolim Airport", country: "India" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhash Chandra Bose", country: "India" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International", country: "India" },
  { city: "Paris", code: "CDG", airport: "Charles de Gaulle", country: "France" },
  { city: "New York", code: "JFK", airport: "John F. Kennedy International", country: "United States" },
  { city: "Frankfurt", code: "FRA", airport: "Frankfurt am Main", country: "Germany" },
  { city: "Doha", code: "DOH", airport: "Hamad International", country: "Qatar" },
  { city: "Bangkok", code: "BKK", airport: "Suvarnabhumi Airport", country: "Thailand" },
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search input states (Text inputs matching prompt specification)
  const [source, setSource] = useState("Delhi (DEL)");
  const [destination, setDestination] = useState("Abu Dhabi (AUH)");
  const [departureDate, setDepartureDate] = useState("2026-11-20");
  const [validationError, setValidationError] = useState("");

  // Autocomplete UI states
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(-1);
  const [activeDestIndex, setActiveDestIndex] = useState(-1);

  const sourceRef = useRef(null);
  const destRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Source typing & autocomplete filtering
  const handleSourceChange = (val) => {
    setSource(val);
    setValidationError("");
    if (val.trim().length > 0) {
      const query = val.toLowerCase().trim();
      const filtered = AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(query) ||
          a.code.toLowerCase().includes(query) ||
          a.airport.toLowerCase().includes(query)
      );
      setSourceSuggestions(filtered);
      setShowSourceDropdown(filtered.length > 0);
      setActiveSourceIndex(-1);
    } else {
      setSourceSuggestions([]);
      setShowSourceDropdown(false);
    }
  };

  // Handle Destination typing & autocomplete filtering
  const handleDestChange = (val) => {
    setDestination(val);
    setValidationError("");
    if (val.trim().length > 0) {
      const query = val.toLowerCase().trim();
      const filtered = AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(query) ||
          a.code.toLowerCase().includes(query) ||
          a.airport.toLowerCase().includes(query)
      );
      setDestSuggestions(filtered);
      setShowDestDropdown(filtered.length > 0);
      setActiveDestIndex(-1);
    } else {
      setDestSuggestions([]);
      setShowDestDropdown(false);
    }
  };

  // Select source suggestion
  const selectSource = (apt) => {
    setSource(`${apt.city} (${apt.code})`);
    setShowSourceDropdown(false);
    setValidationError("");
  };

  // Select destination suggestion
  const selectDestination = (apt) => {
    setDestination(`${apt.city} (${apt.code})`);
    setShowDestDropdown(false);
    setValidationError("");
  };

  // Swap Source and Destination
  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setValidationError("");
  };

  // Search submission with rigorous input validation
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const cleanSource = source.trim();
    const cleanDest = destination.trim();

    if (!cleanSource) {
      setValidationError("Please enter your departure city or airport code.");
      return;
    }
    if (!cleanDest) {
      setValidationError("Please enter your destination city or airport code.");
      return;
    }

    // Check if source and destination are the same
    const extractCodeOrCity = (str) => {
      const match = str.match(/\(([A-Z]{3})\)/i);
      return match ? match[1].toUpperCase() : str.toLowerCase();
    };

    if (extractCodeOrCity(cleanSource) === extractCodeOrCity(cleanDest)) {
      setValidationError("Departure and Destination airports cannot be the same.");
      return;
    }

    const query = new URLSearchParams();
    query.set("source", cleanSource);
    query.set("destination", cleanDest);
    if (departureDate) query.set("departureDate", departureDate);

    navigate(`/flights?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#EAEEF3] py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
      {/* ======================================================== */}
      {/* MAIN EXPANSIVE CONTAINER (Matches Reference Image)      */}
      {/* ======================================================== */}
      <div className="w-full max-w-[1720px] mx-auto bg-white rounded-3xl sm:rounded-[36px] shadow-[0_15px_50px_-10px_rgba(15,23,42,0.08)] border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row">
        
        {/* ======================================================== */}
        {/* LEFT VERTICAL NAVIGATION RAIL (From Reference Image)    */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-28 xl:w-32 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-slate-200/90 py-4 lg:py-8 flex flex-row lg:flex-col justify-between items-center px-4 shrink-0 overflow-x-auto lg:overflow-visible">
          
          {/* Top Rail Navigation Icons */}
          <div className="flex flex-row lg:flex-col items-center space-x-3 lg:space-x-0 lg:space-y-6 w-full">
            
            {/* Active Book Tickets Item (with active left blue bar indicator) */}
            <Link
              to="/"
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group cursor-pointer"
            >
              <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#113B7A] rounded-r-full" />
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#113B7A] mb-1">
                <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[#113B7A] leading-tight">
                Book Tickets
              </span>
            </Link>

            {/* Manage Bookings Item */}
            <Link
              to="/my-bookings"
              className="flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group hover:bg-slate-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl text-slate-500 group-hover:text-[#113B7A] flex items-center justify-center mb-1 text-base">
                ⚙️
              </div>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 leading-tight">
                Manage Bookings
              </span>
            </Link>

            {/* Check-in Item */}
            <Link
              to="/my-bookings"
              className="flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group hover:bg-slate-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl text-slate-500 group-hover:text-[#113B7A] flex items-center justify-center mb-1 text-base">
                ✓
              </div>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 leading-tight">
                Check-in
              </span>
            </Link>

            {/* Passenger Details */}
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group hover:bg-slate-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl text-slate-500 group-hover:text-[#113B7A] flex items-center justify-center mb-1 text-base">
                🪪
              </div>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 leading-tight">
                Passenger Details
              </span>
            </Link>

            {/* Update Contacts */}
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group hover:bg-slate-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl text-slate-500 group-hover:text-[#113B7A] flex items-center justify-center mb-1 text-base">
                ✉️
              </div>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 leading-tight">
                Update Contacts
              </span>
            </Link>

            {/* Flight Details */}
            <Link
              to="/flights"
              className="flex flex-col items-center justify-center p-2 rounded-2xl w-full text-center group hover:bg-slate-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl text-slate-500 group-hover:text-[#113B7A] flex items-center justify-center mb-1 text-base">
                📷
              </div>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 leading-tight">
                Flight Details
              </span>
            </Link>
          </div>

          {/* Bottom Profile Avatar in Rail (from Reference Image: Esther Green ...) */}
          <div className="hidden lg:flex flex-col items-center pt-6 border-t border-slate-200/90 w-full">
            <Link to="/profile" className="flex flex-col items-center group text-center">
              <div className="w-9 h-9 rounded-full bg-[#113B7A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs mb-1">
                {user?.name?.charAt(0) || "EG"}
              </div>
              <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                {user ? user.name.split(" ")[0] : "Esther"}
              </span>
              <span className="text-[9px] text-slate-400">•••</span>
            </Link>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN BODY AREA                                           */}
        {/* ======================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError("")}
                className="text-rose-500 hover:text-rose-700 font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. HERO SECTION BANNER (Matches Reference Image Exactly) */}
          {/* ======================================================== */}
          <div className="relative w-full rounded-3xl sm:rounded-[32px] overflow-hidden bg-gradient-to-r from-[#C7DCF1] via-[#D5E6F5] to-[#EAF2FA] p-6 sm:p-10 min-h-[300px] sm:min-h-[360px] flex flex-col justify-between border border-sky-100 shadow-sm">
            
            {/* Soft Cloud Layers and Horizon Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 left-10 w-96 h-36 bg-white/60 rounded-full blur-2xl" />
              <div className="absolute top-1/3 right-10 w-[500px] h-48 bg-white/70 rounded-full blur-3xl" />
              <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
            </div>

            {/* Top Row: "Plan Your Trip" title + Floating Search Capsule */}
            <div className="relative z-20 flex flex-col xl:flex-row xl:items-start justify-between gap-6">
              
              {/* Left Headline: "Plan Your Trip" with dot pattern */}
              <div className="flex items-start space-x-3 shrink-0">
                {/* Decorative Dot Matrix (As seen in Reference Image) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/90"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/90"></span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0B2545] leading-tight tracking-tight">
                    Plan Your <br /> Trip
                  </h1>
                </div>
              </div>

              {/* Floating Frosted Search Capsule (Matches Reference Image) */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white/85 backdrop-blur-md border border-white/90 rounded-full p-2 sm:p-2.5 shadow-md flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 max-w-4xl w-full"
              >
                {/* From Input Block */}
                <div ref={sourceRef} className="relative flex-1 min-w-[150px] px-3 py-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    From
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    onFocus={() => {
                      if (source.trim().length > 0) setShowSourceDropdown(true);
                    }}
                    placeholder="Enter departure city"
                    className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none placeholder-slate-400"
                    autoComplete="off"
                  />

                  {/* Dynamic Autocomplete Dropdown */}
                  {showSourceDropdown && sourceSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 border-b border-slate-100">
                        Matching Airports
                      </div>
                      {sourceSuggestions.map((apt) => (
                        <div
                          key={`src-${apt.code}`}
                          onClick={() => selectSource(apt)}
                          className="px-3 py-2 hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{apt.city}</span>
                            <span className="text-slate-400 text-[10px] block">{apt.airport}</span>
                          </div>
                          <span className="font-mono font-bold text-[#113B7A] bg-sky-50 px-2 py-0.5 rounded-full text-[11px]">
                            {apt.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button (⇆) */}
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-white text-slate-600 hover:text-[#113B7A] flex items-center justify-center transition-all shadow-xs shrink-0"
                  title="Swap Departure and Destination"
                >
                  ⇆
                </button>

                {/* To Input Block */}
                <div ref={destRef} className="relative flex-1 min-w-[150px] px-3 py-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    To
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={() => {
                      if (destination.trim().length > 0) setShowDestDropdown(true);
                    }}
                    placeholder="Enter destination city"
                    className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none placeholder-slate-400"
                    autoComplete="off"
                  />

                  {/* Dynamic Autocomplete Dropdown */}
                  {showDestDropdown && destSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 border-b border-slate-100">
                        Matching Airports
                      </div>
                      {destSuggestions.map((apt) => (
                        <div
                          key={`dst-${apt.code}`}
                          onClick={() => selectDestination(apt)}
                          className="px-3 py-2 hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{apt.city}</span>
                            <span className="text-slate-400 text-[10px] block">{apt.airport}</span>
                          </div>
                          <span className="font-mono font-bold text-[#113B7A] bg-sky-50 px-2 py-0.5 rounded-full text-[11px]">
                            {apt.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-8 bg-slate-300 mx-1" />

                {/* Date Input Block (On: Feb 23, 2026 📅) */}
                <div className="px-3 py-1 min-w-[130px]">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    On
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Search Button (Dark Navy Pill from Reference Image) */}
                <button
                  type="submit"
                  className="bg-[#113B7A] hover:bg-[#0A254E] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-xs transition-all hover:scale-102 shrink-0 ml-auto md:ml-0"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Jetliner Soaring through Clouds (Uncropped, Matching Reference Image Composition) */}
            <div className="relative z-10 w-full flex justify-end items-end pt-6 pointer-events-none">
              <div className="w-full max-w-xl sm:max-w-2xl drop-shadow-[0_15px_30px_rgba(17,59,122,0.25)]">
                <svg
                  viewBox="0 0 780 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto object-contain"
                >
                  {/* Stabilizer Fin / Tail in Livery */}
                  <path
                    d="M140 100 L40 10 L100 10 L200 95 Z"
                    fill="#113B7A"
                    stroke="#0A254E"
                    strokeWidth="1.5"
                  />
                  <path d="M45 15 L95 15 L175 88 L125 88 Z" fill="#0EA5E9" opacity="0.8" />
                  
                  {/* Fuselage Body */}
                  <path
                    d="M60 110 C80 98 160 92 340 92 L620 92 C680 92 740 102 760 118 C740 135 680 142 620 142 L160 142 C100 142 70 130 60 110 Z"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />

                  {/* Fuselage Blue Underbelly Stripe */}
                  <path
                    d="M60 110 C90 120 160 132 300 135 L620 135 C680 135 735 128 760 118 C740 135 680 142 620 142 L160 142 C100 142 70 130 60 110 Z"
                    fill="#113B7A"
                  />

                  {/* SkyStream Livery Wordmark */}
                  <text
                    x="480"
                    y="118"
                    fill="#113B7A"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="22"
                    letterSpacing="0.5"
                  >
                    SkyStream
                  </text>

                  {/* Cockpit Windshield */}
                  <path
                    d="M720 106 C735 106 745 110 750 114 L745 117 C735 114 725 112 715 112 Z"
                    fill="#113B7A"
                  />

                  {/* Passenger Windows Matrix */}
                  {[...Array(24)].map((_, i) => (
                    <circle key={i} cx={220 + i * 16} cy="112" r="2.2" fill="#113B7A" />
                  ))}

                  {/* Swept Wing & Turbofan Jet Engine */}
                  <path
                    d="M320 120 L400 175 L450 175 L390 120 Z"
                    fill="#E2E8F0"
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                  />
                  <ellipse cx="430" cy="155" rx="26" ry="12" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
                  <ellipse cx="452" cy="155" rx="5" ry="10" fill="#38BDF8" />
                </svg>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. BOTTOM SECTION: RECENT BOOKINGS & SEASONAL OFFERS     */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* LEFT: Recent Bookings Section (From Reference Image) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-800 tracking-tight">
                  Recent Bookings
                </h2>
                <Link to="/my-bookings" className="text-xs font-bold text-[#113B7A] hover:underline">
                  View All
                </Link>
              </div>

              {/* Cards Row: Chennai - Abu Dhabi, Mumbai - Athens, 86+ */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Card 1: Chennai - MAA ➔ Abu Dhabi - AUH */}
                <div
                  onClick={() => navigate("/flights?source=Chennai (MAA)&destination=Abu Dhabi (AUH)")}
                  className="sm:col-span-5 relative h-48 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80"
                    alt="Chennai to Abu Dhabi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white leading-snug">
                        Chennai - MAA ➔ <br /> Abu Dhabi - AUH
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#FACC15] text-slate-900 font-extrabold text-[10px]">
                        Nov 20, 2026
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#113B7A] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-[#0A254E] transition-colors">
                        ➔
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Mumbai - BOM ➔ Athens - ATH */}
                <div
                  onClick={() => navigate("/flights?source=Mumbai (BOM)&destination=Athens (ATH)")}
                  className="sm:col-span-5 relative h-48 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                    alt="Mumbai to Athens"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white leading-snug">
                        Mumbai - BOM ➔ <br /> Athens - ATH
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#FACC15] text-slate-900 font-extrabold text-[10px]">
                        Nov 20, 2026
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#113B7A] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-[#0A254E] transition-colors">
                        ➔
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pill 3: "86+" Circle Badge (From Reference Image) */}
                <div className="sm:col-span-2 flex sm:justify-center">
                  <Link
                    to="/flights"
                    className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black flex items-center justify-center text-sm shadow-xs transition-colors"
                    title="Explore all 60+ scheduled commercial flights"
                  >
                    86+
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Seasonal Offers (From Reference Image: Travel across World 80% off) */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                Seasonal Offers
              </h2>

              <div
                onClick={() => navigate("/flights?travelClass=Economy")}
                className="bg-[#113B7A] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between h-48 shadow-sm cursor-pointer hover:bg-[#0C2B59] transition-colors group"
              >
                {/* Background decorative pattern */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />

                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-sky-200 block">
                    Travel across
                  </span>
                  <span className="text-lg font-black block leading-tight">
                    World
                  </span>
                  <div className="mt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white block tracking-tight">
                      80%<span className="text-sm font-semibold">off</span>
                    </span>
                    <span className="text-[11px] text-sky-200 font-medium">
                      On All Trips & Special Concessions
                    </span>
                  </div>
                </div>

                {/* Silhouette skyline illustration at bottom */}
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-sky-300 group-hover:underline">
                    Claim Promotion →
                  </span>
                  <span className="text-2xl">🏙️</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. SCHEDULED COMMERCIAL FLIGHTS CATALOG OVERVIEW         */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Featured Commercial Airspace Schedules
                </h2>
                <p className="text-xs text-slate-500">
                  Daily scheduled non-stop services with real-time seat assignment.
                </p>
              </div>

              <Link
                to="/flights"
                className="text-xs font-bold text-[#113B7A] hover:underline flex items-center space-x-1"
              >
                <span>View all 60 scheduled flights</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: "1",
                  airline: "Etihad Airways",
                  flightNumber: "EY-217",
                  from: "DEL",
                  to: "AUH",
                  depTime: "04:50 AM",
                  arrTime: "07:25 AM",
                  duration: "4h 05m",
                  stops: "Non-stop",
                  price: 19800,
                },
                {
                  id: "2",
                  airline: "IndiGo",
                  flightNumber: "6E-1412",
                  from: "MAA",
                  to: "AUH",
                  depTime: "08:15 PM",
                  arrTime: "11:20 PM",
                  duration: "4h 35m",
                  stops: "Non-stop",
                  price: 14500,
                },
                {
                  id: "3",
                  airline: "SkyStream Air",
                  flightNumber: "SS-789",
                  from: "BOM",
                  to: "ATH",
                  depTime: "02:10 AM",
                  arrTime: "07:45 AM",
                  duration: "8h 05m",
                  stops: "1 Stop",
                  price: 36200,
                },
                {
                  id: "4",
                  airline: "Singapore Airlines",
                  flightNumber: "SQ-401",
                  from: "DEL",
                  to: "SIN",
                  depTime: "09:50 AM",
                  arrTime: "06:10 PM",
                  duration: "5h 50m",
                  stops: "Non-stop",
                  price: 26500,
                },
              ].map((flight) => (
                <div
                  key={flight.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">{flight.airline}</span>
                      <span className="font-mono text-[10px] font-bold text-[#113B7A] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                        {flight.flightNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between my-3 text-center">
                      <div>
                        <span className="text-xl font-black text-slate-900 block">{flight.from}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{flight.depTime}</span>
                      </div>

                      <div className="px-2">
                        <span className="text-[10px] text-slate-400 block font-medium">{flight.duration}</span>
                        <div className="relative flex items-center justify-center my-1">
                          <div className="w-10 border-t border-slate-300"></div>
                          <span className="text-[10px] text-[#113B7A] px-1">✈</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase">{flight.stops}</span>
                      </div>

                      <div>
                        <span className="text-xl font-black text-slate-900 block">{flight.to}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{flight.arrTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fare</span>
                      <span className="text-base font-black text-slate-900">{formatCurrency(flight.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/flights?source=${flight.from}&destination=${flight.to}`)}
                      className="px-4 py-1.5 rounded-full bg-[#113B7A] hover:bg-[#0A254E] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
