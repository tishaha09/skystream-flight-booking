import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/formatters.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";

export const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requiredPassengers = Math.max(1, parseInt(searchParams.get("passengers") || "1", 10));

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFlightAndSeats = async () => {
      try {
        setLoading(true);
        setError("");

        const [flightRes, seatsRes] = await Promise.all([
          apiRequest(`/flights/${id}`),
          apiRequest(`/flights/${id}/seats`),
        ]);

        if (flightRes && flightRes.flight) {
          setFlight(flightRes.flight);
        }
        if (seatsRes && seatsRes.seats) {
          setSeats(seatsRes.seats);
        }
      } catch (err) {
        setError(err.message || "Failed to load flight and seat configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightAndSeats();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") return;

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= requiredPassengers) {
        setSelectedSeats([...selectedSeats.slice(1), seat.seatNumber]);
      } else {
        setSelectedSeats([...selectedSeats, seat.seatNumber]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length !== requiredPassengers) {
      alert(`Please choose exactly ${requiredPassengers} seat(s) for your passengers.`);
      return;
    }

    navigate(`/booking/${id}`, {
      state: {
        flight,
        selectedSeats,
        passengersCount: requiredPassengers,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F0F4F8]">
        <Loading message="Configuring aircraft cabin & seat layout..." />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F0F4F8] px-4">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-sm text-center max-w-md">
          <p className="text-rose-600 font-bold mb-4">{error || "Flight not found"}</p>
          <Button onClick={() => navigate("/flights")}>Back to Flights</Button>
        </div>
      </div>
    );
  }

  // Group seats by row number
  const seatRows = {};
  seats.forEach((seat) => {
    const match = seat.seatNumber.match(/^(\d+)([A-Z]+)$/);
    if (match) {
      const rowNum = parseInt(match[1], 10);
      if (!seatRows[rowNum]) seatRows[rowNum] = {};
      seatRows[rowNum][match[2]] = seat;
    }
  });

  const rowNumbers = Object.keys(seatRows).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return (
    <div className="min-h-screen py-6 sm:py-8 text-slate-900 bg-[#EAEEF3]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Bar */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <button type="button" onClick={() => navigate("/flights")} className="hover:text-sky-600">
            Flights
          </button>
          <span>/</span>
          <span className="font-mono text-slate-800">{flight.flightNumber}</span>
          <span>/</span>
          <span className="text-sky-600 font-bold">Select Seats</span>
        </div>

        {/* Top Flight Overview Card (Clean Velox style) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-black text-slate-900">{flight.airline}</span>
                <span className="font-mono text-xs bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1 rounded-full font-bold">
                  {flight.flightNumber}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {flight.status}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xl sm:text-2xl font-black text-slate-900">
                <span>{flight.source}</span>
                <span className="text-slate-400">⇄</span>
                <span>{flight.destination}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
                <span>📅 {formatDate(flight.departureDate)}</span>
                <span>•</span>
                <span>⏱ {flight.duration} ({flight.stops === 0 || flight.stops === "0" ? "Non-stop" : `${flight.stops} Stop`})</span>
                <span>•</span>
                <span>✈ {flight.aircraft}</span>
                <span>•</span>
                <span>🏢 Terminal {flight.terminal}</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Fare</span>
                <span className="text-3xl font-black text-slate-900">{formatCurrency(flight.price)}</span>
                <span className="text-[10px] text-slate-500 block font-medium">per passenger</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available</span>
                <span className="text-3xl font-black text-emerald-600">{flight.availableSeats}</span>
                <span className="text-[10px] text-slate-500 block font-medium">seats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Details + Seat Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Amenities & Booking Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Included Flight Amenities
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start space-x-3">
                  <span className="text-base">🧳</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Baggage Allowance</span>
                    <span>{flight.baggageInformation || "Cabin: 7kg, Check-in: 15kg"}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-base">🍽️</span>
                  <div>
                    <span className="font-bold text-slate-800 block">In-Flight Service</span>
                    <span>Complimentary dining, beverages & Wi-Fi connectivity.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-base">🛡️</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Easy Cancellation</span>
                    <span>Self-service cancellation with instantaneous seat release and refund telemetry.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Required Seats:</span>
                <span className="font-black text-slate-900">{requiredPassengers} Passenger(s)</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Selected Seats:</span>
                <span className="font-mono font-black text-sky-600">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None chosen"}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Estimated Total:
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(flight.price * selectedSeats.length)}
                </span>
              </div>

              <Button
                onClick={handleContinue}
                disabled={selectedSeats.length !== requiredPassengers}
                className="w-full py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-all"
              >
                {selectedSeats.length === requiredPassengers
                  ? "Continue to Passenger Details →"
                  : `Select ${requiredPassengers - selectedSeats.length} more seat(s)`}
              </Button>
            </div>
          </div>

          {/* Right Column: Sleek Aircraft Nose Graphic Seat Map (Velox Inspiration) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {/* Header & Seat Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Seats</h3>
                <p className="text-xs text-slate-500">
                  Choose <span className="font-bold text-sky-600">{requiredPassengers} seat(s)</span> for your reservation
                </p>
              </div>

              {/* Legend (Velox Style) */}
              <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded-md border border-slate-300 bg-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-emerald-700 font-bold">Selected</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px]">
                    ✕
                  </div>
                  <span className="text-slate-400">Occupied</span>
                </div>
              </div>
            </div>

            {/* Aircraft Nose Graphic Container (Velox Inspiration) */}
            <div className="max-w-md mx-auto bg-slate-50 rounded-t-[100px] rounded-b-3xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden shadow-inner">
              
              {/* Radial Cockpit Glow */}
              <div className="w-44 h-20 bg-gradient-to-b from-sky-200/50 via-sky-100/30 to-transparent rounded-t-full mx-auto mb-6 flex flex-col items-center justify-center border-t-2 border-x-2 border-sky-300/60 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
                  Flight Cockpit
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Front of Aircraft</span>
              </div>

              {/* Cabin Class Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-0.5 rounded-full shadow-xs">
                  {flight.travelClass || "Main Cabin"}
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Column Letter Headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase mb-3">
                <span>A</span>
                <span>B</span>
                <span>C</span>
                <span className="text-[9px] text-slate-400 font-mono">Aisle</span>
                <span>D</span>
                <span>E</span>
                <span>F</span>
              </div>

              {/* Seat Matrix Rows */}
              <div className="space-y-2">
                {rowNumbers.map((row) => (
                  <div key={row} className="grid grid-cols-7 gap-2 items-center">
                    {/* Left 3 Seats: A, B, C */}
                    {["A", "B", "C"].map((col) => {
                      const seat = seatRows[row]?.[col];
                      if (!seat) return <div key={col} className="w-9 h-9"></div>;

                      const isBooked = seat.status === "booked";
                      const isSelected = selectedSeats.includes(seat.seatNumber);

                      let seatClass =
                        "w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-150 select-none ";
                      if (isBooked) {
                        seatClass += "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200";
                      } else if (isSelected) {
                        seatClass +=
                          "bg-emerald-500 text-white shadow-xs scale-105 border border-emerald-600 font-black";
                      } else {
                        seatClass +=
                          "bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50 border border-slate-200 cursor-pointer shadow-xs active:scale-95";
                      }

                      return (
                        <button
                          key={col}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={seatClass}
                          title={`${seat.seatNumber} — ${seat.seatClass} (${seat.status})`}
                        >
                          {isSelected ? "✓" : isBooked ? "✕" : col}
                        </button>
                      );
                    })}

                    {/* Aisle Row Number */}
                    <div className="text-center text-[10px] font-mono font-bold text-slate-400">
                      {row}
                    </div>

                    {/* Right 3 Seats: D, E, F */}
                    {["D", "E", "F"].map((col) => {
                      const seat = seatRows[row]?.[col];
                      if (!seat) return <div key={col} className="w-9 h-9"></div>;

                      const isBooked = seat.status === "booked";
                      const isSelected = selectedSeats.includes(seat.seatNumber);

                      let seatClass =
                        "w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-150 select-none ";
                      if (isBooked) {
                        seatClass += "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200";
                      } else if (isSelected) {
                        seatClass +=
                          "bg-emerald-500 text-white shadow-xs scale-105 border border-emerald-600 font-black";
                      } else {
                        seatClass +=
                          "bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50 border border-slate-200 cursor-pointer shadow-xs active:scale-95";
                      }

                      return (
                        <button
                          key={col}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={seatClass}
                          title={`${seat.seatNumber} — ${seat.seatClass} (${seat.status})`}
                        >
                          {isSelected ? "✓" : isBooked ? "✕" : col}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Rear Aircraft Tail Section */}
              <div className="w-28 h-5 bg-slate-200 rounded-b-xl mx-auto mt-6 flex items-center justify-center text-[9px] font-bold text-slate-500">
                Rear Galley
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
