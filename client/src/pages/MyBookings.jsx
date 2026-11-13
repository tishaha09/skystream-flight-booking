import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api.js";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../utils/formatters.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/bookings/my");
      if (data && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    try {
      setCancelling(true);
      await apiRequest(`/bookings/${selectedBookingToCancel._id}`, {
        method: "DELETE",
      });
      setCancelModalOpen(false);
      setSelectedBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F0F4F8]">
        <Loading message="Loading your flight reservations & boarding passes..." />
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => b.bookingStatus === "confirmed");
  const pastOrCancelledBookings = bookings.filter((b) => b.bookingStatus !== "confirmed");

  return (
    <div className="min-h-screen py-6 sm:py-8 text-slate-900 bg-[#F0F4F8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
              <span>Customer Travel Records</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">{bookings.length} reservations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Flight Bookings & Boarding Passes
            </h1>
          </div>

          <Link to="/flights">
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full px-5 shadow-xs transition-all">
              + Search New Flight
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              ✈️
            </div>
            <h3 className="text-lg font-bold text-slate-900">No flight reservations found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              You haven't booked any commercial flights with SkyStream yet.
            </p>
            <Link to="/flights">
              <Button>Explore Scheduled Flights</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Upcoming Flights */}
            {activeBookings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Upcoming Confirmed Flights ({activeBookings.length})
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {activeBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-slate-900">
                            {b.flight?.airline || "Commercial Airline"}
                          </span>
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                            {b.flight?.flightNumber}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Confirmed
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {b.fareType || "Regular"}
                          </span>
                        </div>

                        {/* Route Summary */}
                        <div className="grid grid-cols-3 items-center max-w-sm text-center">
                          <div className="text-left">
                            <span className="text-2xl font-black text-slate-900 block leading-tight">
                              {b.flight?.sourceCode || b.flight?.source?.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {b.flight?.source}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {b.flight?.duration}
                            </span>
                            <div className="relative flex items-center justify-center my-1">
                              <div className="w-12 border-t border-slate-300"></div>
                              <span className="text-[10px] text-sky-600 px-1 bg-white">✈</span>
                            </div>
                            <span className="text-[9px] text-emerald-600 font-bold uppercase">
                              {b.flight?.stops === 0 || b.flight?.stops === "0" ? "Non-stop" : `${b.flight?.stops} Stop`}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black text-slate-900 block leading-tight">
                              {b.flight?.destinationCode || b.flight?.destination?.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate ml-auto">
                              {b.flight?.destination}
                            </span>
                          </div>
                        </div>

                        {/* Booking Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1 font-semibold">
                          <span>📅 {formatDate(b.flight?.departureDate)} at {b.flight?.departureTime}</span>
                          <span>•</span>
                          <span>💺 Seats: <strong className="text-sky-600">{b.selectedSeats?.join(", ")}</strong></span>
                          <span>•</span>
                          <span>👥 {b.passengers?.length || b.selectedSeats?.length} Passenger(s)</span>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                          <span className="text-xl font-black text-slate-900">{formatCurrency(b.totalPrice)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link to={`/booking-confirmation/${b._id}`}>
                            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white rounded-full">
                              🎫 Boarding Pass
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openCancelModal(b)}
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past or Cancelled Records */}
            {pastOrCancelledBookings.length > 0 && (
              <div className="space-y-4 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Past & Cancelled Bookings ({pastOrCancelledBookings.length})
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {pastOrCancelledBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white/70 rounded-3xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-800">
                            {b.flight?.airline} {b.flight?.flightNumber}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold capitalize">
                            {b.bookingStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {b.flight?.source} ➔ {b.flight?.destination} • {formatDate(b.flight?.departureDate)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold text-slate-700 font-mono">
                          {formatCurrency(b.totalPrice)}
                        </span>
                        <Link to={`/booking-confirmation/${b._id}`}>
                          <Button size="sm" variant="outline" className="rounded-full">
                            View Receipt
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalOpen && selectedBookingToCancel && (
          <Modal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            title="Confirm Reservation Cancellation"
          >
            <div className="space-y-4 text-xs text-slate-600">
              <p>
                Are you sure you want to cancel booking for flight{" "}
                <strong className="text-slate-900">{selectedBookingToCancel.flight?.flightNumber}</strong> (
                {selectedBookingToCancel.flight?.source} ➔ {selectedBookingToCancel.flight?.destination})?
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>Seats Released:</span>
                  <strong className="text-slate-900">{selectedBookingToCancel.selectedSeats?.join(", ")}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Refund Amount:</span>
                  <strong className="text-emerald-700">{formatCurrency(selectedBookingToCancel.totalPrice)}</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Seat availability will be released atomically back into the commercial flight pool.
              </p>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(false)}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={cancelling}
                  onClick={handleConfirmCancel}
                >
                  Yes, Cancel Booking
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
