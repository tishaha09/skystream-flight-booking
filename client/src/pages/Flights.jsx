import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";

// Airport list for autocomplete suggestions
const AIRPORT_SUGGESTIONS = [
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj" },
  { city: "Abu Dhabi", code: "AUH", airport: "Zayed International" },
  { city: "Chennai", code: "MAA", airport: "Chennai International" },
  { city: "Athens", code: "ATH", airport: "Athens International" },
  { city: "Bengaluru", code: "BLR", airport: "Kempegowda International" },
  { city: "Dubai", code: "DXB", airport: "Dubai International" },
  { city: "London", code: "LHR", airport: "London Heathrow" },
  { city: "Singapore", code: "SIN", airport: "Singapore Changi" },
  { city: "Tokyo", code: "HND", airport: "Tokyo Haneda" },
  { city: "Goa", code: "GOI", airport: "Dabolim / Manohar International" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhash Chandra Bose" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International" },
  { city: "Paris", code: "CDG", airport: "Charles de Gaulle" },
  { city: "New York", code: "JFK", airport: "John F. Kennedy International" },
];

export const Flights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params
  const sourceParam = searchParams.get("source") || "";
  const destParam = searchParams.get("destination") || "";
  const departureDateParam = searchParams.get("departureDate") || "";
  const passengers = searchParams.get("passengers") || "1";
  const travelClassParam = searchParams.get("travelClass") || "";
  const searchParam = searchParams.get("search") || "";

  // Search input state
  const [sourceInput, setSourceInput] = useState(sourceParam);
  const [destInput, setDestInput] = useState(destParam);
  const [dateInput, setDateInput] = useState(departureDateParam);

  // Autocomplete state
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const sourceInputRef = useRef(null);
  const destInputRef = useRef(null);

  // Flights State
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [stopsFilter, setStopsFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState(80000);
  const [departureTimeFilter, setDepartureTimeFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState(travelClassParam || "all");
  const [fareCategory, setFareCategory] = useState("all");
  const [sortBy, setSortBy] = useState("cheapest");

  // Mobile drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync inputs when URL query changes
  useEffect(() => {
    setSourceInput(sourceParam);
    setDestInput(destParam);
    setDateInput(departureDateParam);
  }, [sourceParam, destParam, departureDateParam]);

  // Click outside listener for autocomplete dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sourceInputRef.current && !sourceInputRef.current.contains(e.target)) {
        setShowSourceDropdown(false);
      }
      if (destInputRef.current && !destInputRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute active filters count
  const activeFiltersCount = [
    selectedAirline !== "all",
    stopsFilter !== "all",
    maxPrice < 80000,
    departureTimeFilter !== "all",
    selectedClass !== "all",
    fareCategory !== "all",
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSelectedAirline("all");
    setStopsFilter("all");
    setMaxPrice(80000);
    setDepartureTimeFilter("all");
    setSelectedClass("all");
    setFareCategory("all");
  };

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();
      if (sourceParam) query.set("source", sourceParam);
      if (destParam) query.set("destination", destParam);
      if (departureDateParam) query.set("departureDate", departureDateParam);
      if (passengers) query.set("passengers", passengers);
      if (selectedClass && selectedClass !== "all") query.set("travelClass", selectedClass);
      if (selectedAirline && selectedAirline !== "all") query.set("airline", selectedAirline);
      if (stopsFilter && stopsFilter !== "all") query.set("stops", stopsFilter);
      if (maxPrice) query.set("maxPrice", maxPrice);
      if (departureTimeFilter && departureTimeFilter !== "all") query.set("departureTime", departureTimeFilter);
      if (searchParam) query.set("search", searchParam);
      if (sortBy) query.set("sort", sortBy);
      query.set("limit", "60");

      const data = await apiRequest(`/flights?${query.toString()}`);
      if (data && data.flights) {
        setFlights(data.flights);
      } else {
        setFlights([]);
      }
    } catch (err) {
      setError(err.message || "Failed to retrieve scheduled flights");
    } finally {
      setLoading(false);
    }
  }, [sourceParam, destParam, departureDateParam, passengers, selectedClass, selectedAirline, stopsFilter, maxPrice, departureTimeFilter, searchParam, sortBy]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleBookNow = (flightId) => {
    navigate(`/flights/${flightId}?passengers=${passengers}`);
  };

  // Top search bar submit handler
  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(searchParams);
    if (sourceInput.trim()) query.set("source", sourceInput.trim());
    else query.delete("source");

    if (destInput.trim()) query.set("destination", destInput.trim());
    else query.delete("destination");

    if (dateInput.trim()) query.set("departureDate", dateInput.trim());
    else query.delete("departureDate");

    setSearchParams(query);
  };

  // Autocomplete typing handlers
  const handleSourceType = (val) => {
    setSourceInput(val);
    if (val.trim().length > 0) {
      const q = val.toLowerCase().trim();
      const matches = AIRPORT_SUGGESTIONS.filter(
        (a) => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)
      );
      setSourceSuggestions(matches);
      setShowSourceDropdown(matches.length > 0);
    } else {
      setShowSourceDropdown(false);
    }
  };

  const handleDestType = (val) => {
    setDestInput(val);
    if (val.trim().length > 0) {
      const q = val.toLowerCase().trim();
      const matches = AIRPORT_SUGGESTIONS.filter(
        (a) => a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)
      );
      setDestSuggestions(matches);
      setShowDestDropdown(matches.length > 0);
    } else {
      setShowDestDropdown(false);
    }
  };

  // Swap button
  const handleSwapInputs = () => {
    const temp = sourceInput;
    setSourceInput(destInput);
    setDestInput(temp);
  };

  // Reusable Filter Controls (Used in Desktop Sidebar & Mobile Drawer)
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Stops Filter */}
      <div>
        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          Stops
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: "all", label: "All" },
            { id: "0", label: "Non-stop" },
            { id: "1", label: "1 Stop" },
          ].map((stop) => (
            <button
              key={stop.id}
              type="button"
              onClick={() => setStopsFilter(stop.id)}
              className={`py-2 px-2 rounded-xl text-center font-bold transition-all border ${
                stopsFilter === stop.id
                  ? "bg-[#113B7A] text-white border-[#113B7A] shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </div>

      {/* Airlines / Carrier */}
      <div>
        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          Carrier / Airline
        </label>
        <select
          value={selectedAirline}
          onChange={(e) => setSelectedAirline(e.target.value)}
          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-[#113B7A] cursor-pointer"
        >
          <option value="all">All Carriers</option>
          <option value="Air India">Air India</option>
          <option value="IndiGo">IndiGo</option>
          <option value="Etihad Airways">Etihad Airways</option>
          <option value="SkyStream Air">SkyStream Air</option>
          <option value="Vistara">Vistara</option>
          <option value="Akasa Air">Akasa Air</option>
          <option value="SpiceJet">SpiceJet</option>
          <option value="Emirates">Emirates</option>
          <option value="Singapore Airlines">Singapore Airlines</option>
          <option value="British Airways">British Airways</option>
          <option value="Qatar Airways">Qatar Airways</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
          <span>Max Ticket Fare</span>
          <span className="text-[#113B7A] font-extrabold">{formatCurrency(maxPrice)}</span>
        </div>
        <input
          type="range"
          min="2500"
          max="80000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#113B7A] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>₹2,500</span>
          <span>₹80,000</span>
        </div>
      </div>

      {/* Cabin Tier */}
      <div>
        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          Cabin Class
        </label>
        <div className="space-y-1.5 text-xs">
          {[
            { id: "all", label: "All Classes" },
            { id: "Economy", label: "Economy" },
            { id: "Premium Economy", label: "Premium Economy" },
            { id: "Business", label: "Business" },
            { id: "First Class", label: "First Class" },
          ].map((cls) => (
            <label
              key={cls.id}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border cursor-pointer font-medium transition-colors ${
                selectedClass === cls.id
                  ? "bg-sky-50 border-sky-300 text-[#113B7A] font-bold"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="cabinTierFilter"
                checked={selectedClass === cls.id}
                onChange={() => setSelectedClass(cls.id)}
                className="text-[#113B7A] focus:ring-0"
              />
              <span>{cls.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Window */}
      <div>
        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          Departure Window
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { id: "all", label: "Any Time" },
            { id: "morning", label: "Morning (05-12)" },
            { id: "afternoon", label: "Afternoon (12-17)" },
            { id: "evening", label: "Evening (17-24)" },
          ].map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setDepartureTimeFilter(slot.id)}
              className={`p-2 rounded-xl text-center text-[11px] font-bold border transition-all ${
                departureTimeFilter === slot.id
                  ? "bg-sky-50 border-sky-400 text-[#113B7A]"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special Fare Concession */}
      <div>
        <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-2">
          Special Fare Concession
        </label>
        <div className="space-y-1.5 text-xs">
          {[
            { id: "all", label: "Regular Standard Fare" },
            { id: "student", label: "Student Concession (10% Off)" },
            { id: "armed", label: "Armed Forces (15% Off)" },
            { id: "senior", label: "Senior Citizen (12% Off)" },
          ].map((fare) => (
            <label
              key={fare.id}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border cursor-pointer font-medium transition-colors ${
                fareCategory === fare.id
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="fareConcessionRadio"
                checked={fareCategory === fare.id}
                onChange={() => setFareCategory(fare.id)}
                className="text-emerald-600 focus:ring-0"
              />
              <span>{fare.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Action Button at the end of filters */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            fetchFlights();
            if (mobileFilterOpen) setMobileFilterOpen(false);
          }}
          className="w-full py-2.5 rounded-full bg-[#113B7A] hover:bg-[#0A254E] text-white text-xs font-bold shadow-xs transition-colors"
        >
          Apply Filters ({flights.length} flights)
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-6 sm:py-8 text-slate-900 bg-[#EAEEF3]">
      {/* Expansive Full-Width Outer Container (No narrow box) */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ======================================================== */}
        {/* TOP SEARCH BAR WITH TEXT INPUTS & SWAP BUTTON           */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200">
          <form onSubmit={handleTopSearchSubmit} className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#113B7A]">
                  <span className="w-2 h-2 rounded-full bg-[#113B7A] animate-pulse" />
                  <span>Commercial Flight Schedules</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-semibold">{flights.length} flights active</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Available Scheduled Flights
                </h1>
              </div>

              {/* Quick Sort Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-full border border-slate-200 self-start lg:self-auto">
                {[
                  { id: "cheapest", label: "Cheapest Fare", icon: "💰" },
                  { id: "fastest", label: "Shortest Duration", icon: "⚡" },
                  { id: "recommended", label: "Recommended", icon: "⭐" },
                ].map((sortOption) => (
                  <button
                    key={sortOption.id}
                    type="button"
                    onClick={() => setSortBy(sortOption.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      sortBy === sortOption.id
                        ? "bg-white text-[#113B7A] border border-slate-200 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {sortOption.icon} {sortOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Row: Source Text Input, Swap, Dest Text Input, Date, Search Button */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              
              {/* Source Text Input */}
              <div ref={sourceInputRef} className="relative md:col-span-4 bg-slate-50 rounded-2xl p-2.5 border border-slate-200 focus-within:border-[#113B7A] transition-colors">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Departure City / Airport
                </span>
                <input
                  type="text"
                  value={sourceInput}
                  onChange={(e) => handleSourceType(e.target.value)}
                  onFocus={() => {
                    if (sourceInput.trim().length > 0) setShowSourceDropdown(true);
                  }}
                  placeholder="Enter departure city (e.g. Delhi, DEL)"
                  className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none placeholder-slate-400 mt-0.5"
                  autoComplete="off"
                />

                {showSourceDropdown && sourceSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 border-b border-slate-100">
                      Airport Suggestions
                    </div>
                    {sourceSuggestions.map((apt) => (
                      <div
                        key={`src-sug-${apt.code}`}
                        onClick={() => {
                          setSourceInput(`${apt.city} (${apt.code})`);
                          setShowSourceDropdown(false);
                        }}
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

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapInputs}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#113B7A] flex items-center justify-center transition-all shadow-xs"
                  title="Swap Origin and Destination"
                >
                  ⇆
                </button>
              </div>

              {/* Destination Text Input */}
              <div ref={destInputRef} className="relative md:col-span-4 bg-slate-50 rounded-2xl p-2.5 border border-slate-200 focus-within:border-[#113B7A] transition-colors">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Destination City / Airport
                </span>
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => handleDestType(e.target.value)}
                  onFocus={() => {
                    if (destInput.trim().length > 0) setShowDestDropdown(true);
                  }}
                  placeholder="Enter destination city (e.g. Abu Dhabi, AUH)"
                  className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none placeholder-slate-400 mt-0.5"
                  autoComplete="off"
                />

                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 border-b border-slate-100">
                      Airport Suggestions
                    </div>
                    {destSuggestions.map((apt) => (
                      <div
                        key={`dst-sug-${apt.code}`}
                        onClick={() => {
                          setDestInput(`${apt.city} (${apt.code})`);
                          setShowDestDropdown(false);
                        }}
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

              {/* Departure Date */}
              <div className="md:col-span-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Departure Date
                </span>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none cursor-pointer mt-0.5"
                />
              </div>

              {/* Search Submit Button */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#113B7A] hover:bg-[#0A254E] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Mobile / Tablet Filter Button */}
        <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center space-x-2 text-xs font-bold text-[#113B7A] bg-sky-50 px-4 py-2 rounded-xl border border-sky-200 hover:bg-sky-100 transition-colors"
          >
            <span>Filter Flights</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#113B7A] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs font-semibold text-slate-500">
            {flights.length} flights available
          </span>
        </div>

        {/* ======================================================== */}
        {/* MOBILE SLIDE-OVER DRAWER (Full-Height, Non-Trapping)    */}
        {/* ======================================================== */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden">
            <div className="w-full max-w-md bg-white h-[100dvh] shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-base">Filter Airspace</h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                      {activeFiltersCount} Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {renderFilterControls()}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#113B7A] rounded-xl hover:bg-[#0A254E] shadow-xs"
                >
                  Apply Filters ({flights.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN RESULTS LAYOUT: FILTER SIDEBAR + EXPANSIVE RESULTS  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* DESKTOP FILTER SIDEBAR (Fully Accessible & Scrollable)   */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-3 custom-scrollbar">
              
              {/* Sticky Top Header inside Sidebar */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm tracking-wide">
                    Filter Airspace
                  </h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-[#113B7A] hover:underline font-bold"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Scrollable Filters */}
              {renderFilterControls()}
            </div>
          </div>

          {/* ======================================================== */}
          {/* EXPANSIVE FLIGHT RESULTS COLUMN (Uses Available Width)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 shadow-sm">
                <Loading message="Retrieving commercial flight schedules from MongoDB..." />
              </div>
            ) : error ? (
              <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center text-rose-600 shadow-sm">
                <p className="font-bold text-sm mb-4">{error}</p>
                <Button onClick={fetchFlights} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : flights.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-sky-50 text-[#113B7A] flex items-center justify-center mx-auto mb-3 text-2xl">
                  ✈️
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No commercial flights match your search criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Try adjusting departure/destination cities or clearing the active filters to browse all flights.
                </p>
                <Button onClick={handleResetFilters} variant="outline" size="sm">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              flights.map((flight, idx) => {
                const isBestValue = idx === 0 && sortBy === "cheapest";

                return (
                  <div
                    key={flight._id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 relative hover:border-slate-300"
                  >
                    {isBestValue && (
                      <span className="absolute -top-2.5 left-6 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-xs">
                        ★ Best Value
                      </span>
                    )}

                    {/* Flight Info & Airline */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-xs">
                          ✈️
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {flight.airline}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-[#113B7A] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                              {flight.flightNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {flight.aircraft || "Commercial Jetliner"} • Terminal {flight.terminal || "T3"}
                          </span>
                        </div>
                      </div>

                      {/* Route Timings */}
                      <div className="grid grid-cols-3 items-center max-w-md text-center">
                        <div className="text-left">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                            {flight.departureTime}
                          </span>
                          <span className="text-xs font-bold text-[#113B7A]">
                            {flight.sourceCode || flight.source.split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                            {flight.source}
                          </span>
                        </div>

                        <div className="px-2">
                          <span className="text-[11px] text-slate-500 font-bold block">{flight.duration}</span>
                          <div className="relative flex items-center justify-center my-1">
                            <div className="w-full border-t border-slate-300"></div>
                            <span className="text-[10px] text-[#113B7A] px-1 bg-white">✈</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            {flight.stops === 0 || flight.stops === "0" ? "Non-stop" : `${flight.stops} Stop`}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                            {flight.arrivalTime}
                          </span>
                          <span className="text-xs font-bold text-[#113B7A]">
                            {flight.destinationCode || flight.destination.split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[130px] ml-auto">
                            {flight.destination}
                          </span>
                        </div>
                      </div>

                      {/* Footer tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                          {flight.travelClass}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                          🧳 {flight.baggageInformation}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold ${
                            flight.availableSeats > 10
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {flight.availableSeats} seats left
                        </span>
                      </div>
                    </div>

                    {/* Price & Book Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Per Passenger
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          {formatCurrency(flight.price)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          ✓ Concessions apply
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          onClick={() => handleBookNow(flight._id)}
                          disabled={flight.availableSeats === 0 || flight.status === "cancelled"}
                          className="bg-[#113B7A] hover:bg-[#0A254E] text-white font-bold rounded-full px-6 py-2.5 shadow-xs transition-all hover:scale-102"
                        >
                          {flight.availableSeats === 0 ? "Sold Out" : "Select Flight →"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
