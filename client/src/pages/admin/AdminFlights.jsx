import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters.js";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";
import Modal from "../../components/Modal.jsx";

export const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Flight Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    airline: "Air India",
    flightNumber: "",
    source: "",
    sourceCode: "DEL",
    destination: "",
    destinationCode: "BOM",
    departureDate: "2026-11-20",
    departureTime: "08:00 AM",
    arrivalTime: "10:30 AM",
    duration: "2h 30m",
    stops: "Non-stop",
    aircraft: "Airbus A320neo",
    terminal: "T3",
    gate: "14A",
    price: 4500,
    totalSeats: 60,
    travelClass: "Economy",
    status: "scheduled",
    baggageInformation: "Cabin: 7kg, Check-in: 15kg",
  });

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/admin/flights");
      if (res && res.flights) {
        setFlights(res.flights);
      }
    } catch (err) {
      setError(err.message || "Failed to load flights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const openAddModal = () => {
    setEditingFlight(null);
    setFormData({
      airline: "Air India",
      flightNumber: `AI-${Math.floor(100 + Math.random() * 900)}`,
      source: "Delhi (DEL)",
      sourceCode: "DEL",
      destination: "Mumbai (BOM)",
      destinationCode: "BOM",
      departureDate: "2026-11-20",
      departureTime: "08:00 AM",
      arrivalTime: "10:15 AM",
      duration: "2h 15m",
      stops: "Non-stop",
      aircraft: "Airbus A320neo",
      terminal: "T3",
      gate: "14A",
      price: 4850,
      totalSeats: 60,
      travelClass: "Economy",
      status: "scheduled",
      baggageInformation: "Cabin: 7kg, Check-in: 15kg",
    });
    setModalOpen(true);
  };

  const openEditModal = (flight) => {
    setEditingFlight(flight);
    setFormData({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      source: flight.source,
      sourceCode: flight.sourceCode || "DEL",
      destination: flight.destination,
      destinationCode: flight.destinationCode || "BOM",
      departureDate: flight.departureDate ? flight.departureDate.slice(0, 10) : "2026-11-20",
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      stops: flight.stops || "Non-stop",
      aircraft: flight.aircraft || "Airbus A320neo",
      terminal: flight.terminal || "T3",
      gate: flight.gate || "14A",
      price: flight.price,
      totalSeats: flight.totalSeats || 60,
      travelClass: flight.travelClass || "Economy",
      status: flight.status || "scheduled",
      baggageInformation: flight.baggageInformation || "Cabin: 7kg, Check-in: 15kg",
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "totalSeats" ? Number(value) : value,
    }));
  };

  const handleSaveFlight = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingFlight) {
        await apiRequest(`/flights/${editingFlight._id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await apiRequest("/flights", {
          method: "POST",
          body: formData,
        });
      }
      setModalOpen(false);
      fetchFlights();
    } catch (err) {
      alert(err.message || "Failed to save flight details");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId, flightNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete flight ${flightNumber}? This will also delete all associated seats.`)) {
      return;
    }

    try {
      await apiRequest(`/flights/${flightId}`, {
        method: "DELETE",
      });
      fetchFlights();
    } catch (err) {
      alert(err.message || "Failed to delete flight");
    }
  };

  const handleQuickStatusChange = async (flightId, newStatus) => {
    try {
      await apiRequest(`/flights/${flightId}`, {
        method: "PUT",
        body: { status: newStatus },
      });
      fetchFlights();
    } catch (err) {
      alert(err.message || "Failed to update flight status");
    }
  };

  const filteredFlights = flights.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.airline?.toLowerCase().includes(term) ||
      f.flightNumber?.toLowerCase().includes(term) ||
      f.source?.toLowerCase().includes(term) ||
      f.destination?.toLowerCase().includes(term)
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
              <span className="font-bold text-slate-900">Fleet Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Commercial Fleet & Schedule Manager
            </h1>
          </div>

          <Button onClick={openAddModal} className="bg-sky-600 hover:bg-sky-700 text-white rounded-full font-bold px-5 shadow-xs">
            + Add New Flight Service
          </Button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search 58+ flights by Airline, Flight Number, Origin, Destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-medium"
            />
            <span className="absolute left-3.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredFlights.length} of {flights.length} flights
          </span>
        </div>

        {/* Flights Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12">
            <Loading message="Loading commercial fleet records from MongoDB..." />
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
                    <th className="py-4 px-5">Flight Service</th>
                    <th className="py-4 px-5">Route & Codes</th>
                    <th className="py-4 px-5">Schedule</th>
                    <th className="py-4 px-5">Aircraft / Gate</th>
                    <th className="py-4 px-5">Fare</th>
                    <th className="py-4 px-5">Seats Open</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredFlights.map((flight) => (
                    <tr key={flight._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{flight.airline}</div>
                        <div className="font-mono text-xs text-sky-700 font-bold">{flight.flightNumber}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800">
                          {flight.source} ✈ {flight.destination}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {flight.sourceCode || "DEL"} → {flight.destinationCode || "BOM"}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800">
                          {flight.departureTime} — {flight.arrivalTime}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(flight.departureDate)} ({flight.duration})
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="text-slate-800 font-semibold">{flight.aircraft || "Airbus A320neo"}</div>
                        <div className="text-[11px] text-slate-500">Gate {flight.gate || "12A"} (T{flight.terminal || "3"})</div>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                        {formatCurrency(flight.price)}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`font-bold ${flight.availableSeats > 10 ? "text-emerald-700" : "text-amber-700"}`}>
                          {flight.availableSeats}
                        </span>
                        <span className="text-slate-400 text-[11px]"> / {flight.totalSeats}</span>
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={flight.status}
                          onChange={(e) => handleQuickStatusChange(flight._id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 focus:outline-none bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <option value="scheduled">scheduled</option>
                          <option value="delayed">delayed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="completed">completed</option>
                        </select>
                      </td>

                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(flight)}
                          className="text-sky-600 hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFlight(flight._id, flight.flightNumber)}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Flight Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFlight ? `Edit Flight ${editingFlight.flightNumber}` : "Add Commercial Flight Route"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveFlight} className="space-y-4 text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Airline Name
              </label>
              <input
                type="text"
                name="airline"
                value={formData.airline}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Flight Number
              </label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Source Airport
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Destination Airport
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Departure Time
              </label>
              <input
                type="text"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Arrival Time
              </label>
              <input
                type="text"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Base Fare (INR)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={formLoading}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold"
            >
              {editingFlight ? "Update Flight" : "Create Flight Service"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFlights;
