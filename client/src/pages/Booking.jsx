import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { apiRequest } from "../services/api.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { FARE_TYPES, calculateFareBreakdown } from "../utils/fareTypes.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";

export const Booking = () => {
  const { flightId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateData = location.state || {};
  const [flight, setFlight] = useState(stateData.flight || null);
  const selectedSeats = stateData.selectedSeats || [];
  const [loadingFlight, setLoadingFlight] = useState(!stateData.flight);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fare Category Selection (Regular, Student, Armed Forces, Senior Citizen)
  const [selectedFareType, setSelectedFareType] = useState("Regular");

  // Passenger forms initialized per seat
  const [passengers, setPassengers] = useState(() => {
    return selectedSeats.map((seat, index) => ({
      name: index === 0 && user ? user.name : "",
      age: "",
      gender: "Male",
      email: index === 0 && user ? user.email : "",
      phone: index === 0 && user ? user.phone || "" : "",
      idNumber: "",
      concessionId: "",
      seatNumber: seat,
    }));
  });

  useEffect(() => {
    if (!flight && flightId) {
      apiRequest(`/flights/${flightId}`)
        .then((data) => {
          if (data && data.flight) setFlight(data.flight);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoadingFlight(false));
    }
  }, [flight, flightId]);

  // Fallback if accessed directly without choosing seats
  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0) {
      navigate(`/flights/${flightId || ""}`, { replace: true });
    }
  }, [selectedSeats, flightId, navigate]);

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Compute live concession fare breakdown
  const fareBreakdown = flight
    ? calculateFareBreakdown(flight.price, selectedSeats.length, selectedFareType)
    : { baseFare: 0, discountPercent: 0, discountAmount: 0, subtotal: 0, taxAmount: 0, totalAmount: 0 };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    // Client-side validation
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        setError(`Passenger #${i + 1} name is required.`);
        return;
      }
      if (!p.age || isNaN(p.age) || Number(p.age) < 1) {
        setError(`Please provide a valid age for Passenger #${i + 1}.`);
        return;
      }
      if (!p.idNumber.trim()) {
        setError(`Government ID / Passport # is required for Passenger #${i + 1}.`);
        return;
      }

      // Check concession verification requirements
      const categoryConfig = FARE_TYPES[selectedFareType];
      if (categoryConfig && categoryConfig.requiresVerification) {
        if (!p.concessionId.trim()) {
          setError(
            `${categoryConfig.verificationLabel} is required for Passenger #${i + 1} to claim the ${selectedFareType} concession.`
          );
          return;
        }
      }

      // Senior citizen age check
      if (selectedFareType === "Senior Citizen" && Number(p.age) < 60) {
        setError(`Passenger #${i + 1} must be at least 60 years old to claim the Senior Citizen concession.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        flightId: flight._id,
        seats: selectedSeats,
        fareType: selectedFareType,
        passengers: passengers.map((p) => ({
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
          email: p.email.trim(),
          phone: p.phone.trim(),
          idNumber: p.idNumber.trim(),
          concessionId: p.concessionId.trim(),
          seatNumber: p.seatNumber,
        })),
      };

      const res = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.booking) {
        navigate(`/booking-confirmation/${res.booking._id}`, {
          state: { booking: res.booking, paymentReceipt: res.paymentReceipt },
        });
      } else {
        throw new Error("Invalid booking response returned by airline reservation service.");
      }
    } catch (err) {
      setError(err.message || "Failed to complete reservation. Selected seat may have been taken.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFlight) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F0F4F8]">
        <Loading message="Validating flight and seat reservation..." />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center text-slate-800 bg-[#F0F4F8]">
        <p className="text-rose-600 font-bold mb-4">Flight details could not be found.</p>
        <Button onClick={() => navigate("/flights")}>Browse Scheduled Flights</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 text-slate-900 bg-[#EAEEF3]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="text-sky-600">1. Select Flight</span>
            <span>→</span>
            <span className="text-sky-600">2. Choose Seats</span>
            <span>→</span>
            <span className="text-white bg-sky-600 px-3 py-1 rounded-full font-bold shadow-xs">
              3. Passenger & Concession
            </span>
            <span>→</span>
            <span>4. Boarding Pass</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Passenger Credentials & Concessions
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Section: Fare Category Cards & Passenger Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. FARE CATEGORY / CONCESSION SELECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    Select Fare Category & Concession
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose an applicable concession category to instantly apply verified discounts.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                  Verified Concessions
                </span>
              </div>

              {/* Concession Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(FARE_TYPES).map((category) => {
                  const isSelected = selectedFareType === category.name;
                  return (
                    <div
                      key={category.name}
                      onClick={() => setSelectedFareType(category.name)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? "border-sky-600 bg-sky-50/60 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{category.icon}</span>
                          <span className="font-bold text-sm text-slate-900">
                            {category.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            category.discountPercent > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium">Applied Concession:</span>
                        <span className="font-bold text-sky-700">
                          {category.discountPercent > 0 ? `${category.discountPercent}% OFF Base` : "Standard Rate"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. PASSENGER FORMS FOR EACH ASSIGNED SEAT */}
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Passenger #{index + 1} Credentials
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Seat {selectedSeats[index]} • {selectedFareType} Tier
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                      Seat {selectedSeats[index]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Full Legal Name (as on Passport/ID) *
                      </label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                        placeholder="e.g. Captain Sarah Jenkins"
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900"
                        required
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                        placeholder="e.g. 28"
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900"
                        required
                      />
                      {selectedFareType === "Senior Citizen" && (
                        <span className="text-[10px] text-amber-600 font-bold mt-1 block">
                          * Must be 60+ for Senior Citizen concession
                        </span>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Gender *
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Government ID / Passport Number */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Government ID / Passport # *
                      </label>
                      <input
                        type="text"
                        value={passenger.idNumber}
                        onChange={(e) => handlePassengerChange(index, "idNumber", e.target.value)}
                        placeholder="e.g. IND987654321 / Passport #"
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900 font-mono"
                        required
                      />
                    </div>

                    {/* Concession Verification ID */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        {FARE_TYPES[selectedFareType].requiresVerification
                          ? `${FARE_TYPES[selectedFareType].verificationLabel} *`
                          : "Frequent Flyer / Loyalty Code (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={passenger.concessionId}
                        onChange={(e) => handlePassengerChange(index, "concessionId", e.target.value)}
                        placeholder={
                          FARE_TYPES[selectedFareType].placeholder || "Optional loyalty code"
                        }
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900 font-mono"
                        required={FARE_TYPES[selectedFareType].requiresVerification}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Email Address (e-Ticket Delivery)
                      </label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, "email", e.target.value)}
                        placeholder="passenger@example.com"
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                        Phone Number (SMS Alert Updates)
                      </label>
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, "phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-base shadow-xs transition-all"
              >
                Confirm & Issue Boarding Pass ({formatCurrency(fareBreakdown.totalAmount)})
              </Button>
            </form>
          </div>

          {/* Right Column: Order Summary & Live Fare Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Reservation Summary</span>
                <span className="text-xs font-mono text-sky-600">{flight.flightNumber}</span>
              </h3>

              {/* Mini Flight Details */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier:</span>
                  <span className="font-bold text-slate-900">{flight.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-bold text-slate-900">{flight.source} ➔ {flight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Departure:</span>
                  <span className="font-bold text-slate-900">{flight.departureTime} ({formatDate(flight.departureDate)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cabin Tier:</span>
                  <span className="font-bold text-sky-600">{flight.travelClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Seats:</span>
                  <span className="font-mono font-bold text-sky-600">{selectedSeats.join(", ")}</span>
                </div>
              </div>

              {/* Live Fare Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Base Fare ({selectedSeats.length} × {formatCurrency(flight.price)}):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(fareBreakdown.baseFare)}</span>
                </div>

                {fareBreakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                    <span>{selectedFareType} Concession ({fareBreakdown.discountPercent}%):</span>
                    <span>- {formatCurrency(fareBreakdown.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal after Concession:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(fareBreakdown.subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Aviation Taxes & GST (12%):</span>
                  <span>{formatCurrency(fareBreakdown.taxAmount)}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Total Billed:</span>
                  <span className="font-black text-2xl text-slate-900">
                    {formatCurrency(fareBreakdown.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Guaranteed Confirmation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-700 font-bold">
                  <span>🔒</span>
                  <span>Guaranteed Seat Reservation</span>
                </div>
                <p>
                  Zero ghost seats. Your seat allocation is reserved atomically upon confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
