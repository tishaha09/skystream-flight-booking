import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { apiRequest } from "../services/api.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";

export const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState("");
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const boardingPassRef = useRef(null);

  useEffect(() => {
    if (!booking && id) {
      apiRequest(`/bookings/${id}`)
        .then((data) => {
          if (data && data.booking) setBooking(data.booking);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [booking, id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!boardingPassRef.current) return;
    try {
      setDownloadingPdf(true);
      const element = boardingPassRef.current;
      const opt = {
        margin: [0.3, 0.3],
        filename: `SkyStream_BoardingPass_${booking._id.slice(-6).toUpperCase()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download PDF. Please use the Print option to save as PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Retrieving your digital boarding pass..." />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center text-slate-800 bg-[#F0F4F8]">
        <p className="text-rose-600 font-bold mb-4">{error || "Reservation not found"}</p>
        <Link to="/my-bookings">
          <Button>Return to My Bookings</Button>
        </Link>
      </div>
    );
  }

  const {
    flight,
    passengers,
    selectedSeats,
    fareType = "Regular",
    fareBreakdown,
    bookingStatus,
    _id,
  } = booking;

  const currentPassenger = passengers?.[activePassengerIndex] || {
    name: "Passenger",
    age: 25,
    gender: "Adult",
    idNumber: "IND99999",
  };
  const currentSeat = currentPassenger.seatNumber || selectedSeats[activePassengerIndex] || selectedSeats[0];

  return (
    <div className="min-h-screen py-10 print:py-0 print:bg-white text-slate-900 bg-[#F0F4F8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Success Banner */}
        <div className="text-center mb-8 no-print animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs text-2xl font-bold">
            ✓
          </div>
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Reservation Confirmed & Boarding Pass Dispatched
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Your Boarding Pass is Ready
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Booking Reference / PNR: <span className="font-mono font-bold text-slate-900">{_id}</span>
          </p>
        </div>

        {/* Passenger Switcher Tabs if Multiple Passengers */}
        {passengers && passengers.length > 1 && (
          <div className="flex items-center justify-center space-x-2 mb-6 no-print">
            <span className="text-xs font-bold text-slate-500 mr-2">Passenger Ticket:</span>
            {passengers.map((p, idx) => (
              <button
                key={p._id || idx}
                type="button"
                onClick={() => setActivePassengerIndex(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activePassengerIndex === idx
                    ? "bg-sky-600 text-white shadow-xs font-bold"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p.name.split(" ")[0]} ({selectedSeats[idx]})
              </button>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* AIRLINE BOARDING PASS (Clean White Card Ticket)          */}
        {/* ======================================================== */}
        <div
          ref={boardingPassRef}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden boarding-pass-print"
        >
          {/* Top Brand Banner */}
          <div className="bg-slate-900 px-6 sm:px-8 py-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black shadow-xs">
                <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight block">SkyStream Airlines</span>
                <span className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                  Electronic Passenger Boarding Pass
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono bg-slate-800 text-sky-300 border border-slate-700 px-3 py-1 rounded-full uppercase">
                {flight?.travelClass || "Economy"}
              </span>
              <span className="text-xs font-bold font-mono bg-emerald-500 text-white px-3 py-1 rounded-full uppercase">
                {bookingStatus || "Confirmed"}
              </span>
            </div>
          </div>

          {/* Main Boarding Pass Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-dashed divide-slate-200 p-6 sm:p-8 bg-white">
            
            {/* Left Main Ticket Section (8 Cols) */}
            <div className="md:col-span-8 md:pr-8 space-y-6">
              {/* Route & Times */}
              <div className="grid grid-cols-3 items-center text-center pb-6 border-b border-slate-100">
                <div className="text-left">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 block tracking-tight">
                    {flight?.sourceCode || flight?.source?.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-600 block mt-0.5">
                    {flight?.source}
                  </span>
                  <span className="text-[11px] text-sky-700 font-bold block mt-1">
                    Dep: {flight?.departureTime}
                  </span>
                </div>

                <div className="px-2">
                  <span className="text-xs font-bold text-slate-800 font-mono block">
                    {flight?.flightNumber}
                  </span>
                  <div className="relative flex items-center justify-center my-1.5">
                    <div className="w-full border-t border-slate-300"></div>
                    <span className="text-xs text-sky-600 px-1 bg-white">✈</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                    {flight?.duration} (Non-stop)
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 block tracking-tight">
                    {flight?.destinationCode || flight?.destination?.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-600 block mt-0.5">
                    {flight?.destination}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold block mt-1">
                    Arr: {flight?.arrivalTime}
                  </span>
                </div>
              </div>

              {/* Passenger & Flight Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Passenger Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm block truncate">
                    {currentPassenger.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentPassenger.age} yrs • {currentPassenger.gender}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Allocated Seat
                  </span>
                  <span className="text-2xl font-black text-sky-600 font-mono block">
                    {currentSeat}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Departure Date
                  </span>
                  <span className="font-bold text-slate-900 text-xs block mt-1">
                    {formatDate(flight?.departureDate)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Gate / Terminal
                  </span>
                  <span className="font-bold text-slate-900 text-sm block">
                    Gate {flight?.gate || "12A"} (T{flight?.terminal || "3"})
                  </span>
                </div>
              </div>

              {/* Fare Type & Verification Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700">Fare Category:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                    {fareType} Tier
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700">Govt ID:</span>
                  <span className="font-mono text-slate-600">{currentPassenger.idNumber}</span>
                </div>
                {currentPassenger.concessionId && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700">Concession ID:</span>
                    <span className="font-mono text-slate-600">{currentPassenger.concessionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Perforated Stub (4 Cols) */}
            <div className="md:col-span-4 md:pl-8 pt-6 md:pt-0 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight Stub</span>
                <span className="text-base font-bold text-slate-900 block">{flight?.airline}</span>
                <span className="font-mono text-xs font-bold text-sky-700">{flight?.flightNumber}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pass:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[120px]">{currentPassenger.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seat:</span>
                  <span className="font-mono font-bold text-sky-600 text-sm">{currentSeat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class:</span>
                  <span className="font-semibold text-slate-800">{flight?.travelClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Boarding:</span>
                  <span className="font-bold text-slate-800">45m prior to dep</span>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="pt-2">
                <div className="h-10 w-full flex items-center justify-between px-2 bg-slate-100 rounded-lg overflow-hidden">
                  {[3, 1, 4, 1, 2, 5, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 h-8"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-400 text-center block mt-1">
                  *{_id.slice(-10).toUpperCase()}*
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls: PDF, Print, Return */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 no-print">
          <Button
            onClick={handleDownloadPdf}
            loading={downloadingPdf}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2.5 rounded-full shadow-xs"
          >
            📥 Download Official PDF Ticket
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="px-6 py-2.5 rounded-full"
          >
            🖨️ Print Boarding Pass
          </Button>
          <Link to="/my-bookings">
            <Button variant="secondary" className="px-6 py-2.5 rounded-full">
              View All Bookings →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
