import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters.js";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Passenger inspection modal
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [selectedBookingForPassengers, setSelectedBookingForPassengers] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/admin/bookings");
      if (res && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await apiRequest(`/bookings/${bookingId}/status`, {
        method: "PUT",
        body: { status: newStatus },
      });
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to update booking status");
    }
  };

  const openPassengerModal = (booking) => {
    setSelectedBookingForPassengers(booking);
    setPassengerModalOpen(true);
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b._id?.toLowerCase().includes(term) ||
      b.user?.name?.toLowerCase().includes(term) ||
      b.user?.email?.toLowerCase().includes(term) ||
      b.flight?.flightNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen py-8 text-slate-900 bg-[#EAEEF3]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <Link to="/admin" className="hover:text-sky-600">Admin Dashboard</Link>
              <span>/</span>
              <span className="font-bold text-slate-900">Reservation Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Bookings & Ticketing Log
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by PNR, Customer Name, Email, Flight Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-medium"
            />
            <span className="absolute left-3.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredBookings.length} of {bookings.length} reservations
          </span>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12">
            <Loading message="Loading customer reservation records from MongoDB..." />
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center text-rose-600 font-bold">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-5">Booking PNR</th>
                    <th className="py-4 px-5">Passenger Account</th>
                    <th className="py-4 px-5">Flight Service</th>
                    <th className="py-4 px-5">Fare Category</th>
                    <th className="py-4 px-5">Allocated Seats</th>
                    <th className="py-4 px-5">Total Billed</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-sky-700">
                        {b._id}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{b.user?.name || "Customer"}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{b.user?.email}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800">
                          {b.flight?.airline} ({b.flight?.flightNumber})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.flight?.source} ✈ {b.flight?.destination}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                          {b.fareType || "Regular"}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-sky-700">
                        {b.selectedSeats?.join(", ")}
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                        {formatCurrency(b.totalAmount)}
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 focus:outline-none bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="pending">pending</option>
                        </select>
                      </td>

                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openPassengerModal(b)}
                          className="text-sky-600 hover:underline font-bold"
                        >
                          Manifest ({b.passengers?.length || b.selectedSeats?.length})
                        </button>
                        <Link
                          to={`/booking-confirmation/${b._id}`}
                          className="text-slate-500 hover:text-slate-800 font-bold hover:underline"
                        >
                          Pass →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Passenger Manifest Inspection Modal */}
        {passengerModalOpen && selectedBookingForPassengers && (
          <Modal
            isOpen={passengerModalOpen}
            onClose={() => setPassengerModalOpen(false)}
            title={`Passenger Manifest — PNR: ${selectedBookingForPassengers._id}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Flight Service</span>
                  <span className="font-bold text-sm text-slate-900">
                    {selectedBookingForPassengers.flight?.airline} {selectedBookingForPassengers.flight?.flightNumber}
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  {selectedBookingForPassengers.fareType} Tier
                </span>
              </div>

              <div className="space-y-3">
                {selectedBookingForPassengers.passengers?.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold text-sky-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-xs">
                        Seat {p.seatNumber || selectedBookingForPassengers.selectedSeats?.[idx]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-1">
                      <div>
                        <span className="block text-slate-400">Age & Gender</span>
                        <span className="font-semibold text-slate-800">{p.age} yrs • {p.gender}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Govt ID / Passport</span>
                        <span className="font-mono font-semibold text-slate-800">{p.idNumber || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Concession ID</span>
                        <span className="font-mono font-semibold text-slate-800">{p.concessionId || "None (Regular)"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Contact</span>
                        <span className="font-semibold text-slate-800 truncate block">{p.phone || p.email || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-100">
                <Button size="sm" onClick={() => setPassengerModalOpen(false)}>
                  Close Manifest
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
