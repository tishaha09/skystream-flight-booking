import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import { formatCurrency, formatDate, getStatusBadgeClass } from "../../utils/formatters.js";
import Loading from "../../components/Loading.jsx";

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/admin/dashboard");
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F0F4F8]">
        <Loading message="Aggregating live airline operational telemetry..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-rose-600 bg-[#F0F4F8]">
        <p className="font-bold">{error || "Could not retrieve admin telemetry"}</p>
      </div>
    );
  }

  const { stats, upcomingFlights, recentBookings } = data;

  return (
    <div className="min-h-screen py-8 text-slate-900 bg-[#EAEEF3]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                Aviation Command & Fleet Control
              </span>
              <span className="text-slate-500 font-mono text-[11px]">• Real-Time Telemetry Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Operations & Telemetry Dashboard
            </h1>
          </div>

          {/* Quick Sub-Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/flights"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 transition-all shadow-xs"
            >
              ✈️ Fleet & Schedules ({stats?.totalFlights || 0})
            </Link>
            <Link
              to="/admin/bookings"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 transition-all shadow-xs"
            >
              📑 Reservations ({stats?.totalBookings || 0})
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 transition-all shadow-xs"
            >
              👥 User Accounts ({stats?.totalUsers || 0})
            </Link>
          </div>
        </div>

        {/* 4 Telemetry KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shrink-0 border border-sky-100">
              ✈️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Fleet Flights
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalFlights || 0}
              </span>
              <span className="text-[10px] text-sky-600 font-bold block mt-0.5">
                58 Commercial Routes Active
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
              📑
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Customer Bookings
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalBookings || 0}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                Atomic Transactions
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
              👥
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Registered Accounts
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalUsers || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                RBAC Access Control
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 border border-amber-100">
              💰
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Gross Revenue
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                Confirmed Reservations
              </span>
            </div>
          </div>
        </div>

        {/* Tables Section: Scheduled Flights & Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upcoming Flights */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                Scheduled Flight Services
              </h2>
              <Link to="/admin/flights" className="text-xs font-bold text-sky-600 hover:underline">
                Manage Fleet (58+) →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {upcomingFlights?.length === 0 ? (
                <p className="py-4 text-center text-slate-400">No scheduled flights found</p>
              ) : (
                upcomingFlights?.map((flight) => (
                  <div key={flight._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {flight.airline}{" "}
                        <span className="font-mono text-xs font-bold text-sky-600">
                          ({flight.flightNumber})
                        </span>
                      </div>
                      <div className="text-slate-500 font-medium mt-0.5">
                        {flight.source} → {flight.destination}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(flight.departureDate)} at {flight.departureTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">{formatCurrency(flight.price)}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">
                        {flight.availableSeats} seats open
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                Live Customer Bookings
              </h2>
              <Link to="/admin/bookings" className="text-xs font-bold text-sky-600 hover:underline">
                View All Reservations →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {recentBookings?.length === 0 ? (
                <p className="py-4 text-center text-slate-400">No recent bookings recorded</p>
              ) : (
                recentBookings?.map((b) => (
                  <div key={b._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {b.user?.name || "Passenger"}
                      </div>
                      <div className="text-slate-500 font-medium mt-0.5">
                        Flight: {b.flight?.flightNumber || "Flight"} (Seats: {b.selectedSeats?.join(", ")})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        PNR: {b._id}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 text-base block">
                        {formatCurrency(b.totalAmount)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
