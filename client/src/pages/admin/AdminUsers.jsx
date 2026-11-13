import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { apiRequest } from "../../services/api.js";
import Loading from "../../components/Loading.jsx";
import Button from "../../components/Button.jsx";

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/admin/users");
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (userId === currentUser._id && newRole !== "admin") {
      alert("You cannot revoke your own administrator privileges.");
      return;
    }

    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: "PUT",
        body: { role: newRole },
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser._id) {
      alert("You cannot delete your own account from the administrator console.");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user account "${userName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
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
              <span className="font-bold text-slate-900">User Access Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Accounts & Administrative Roles
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users by Name, Email Address, Phone Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 font-medium"
            />
            <span className="absolute left-3.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Total Registered Users: {filteredUsers.length}
          </span>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12">
            <Loading message="Retrieving registered customer accounts..." />
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
                    <th className="py-4 px-5">Passenger Account</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Phone Number</th>
                    <th className="py-4 px-5">Role Authority</th>
                    <th className="py-4 px-5">Enrolled Since</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                              {u.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 font-bold px-1.5 py-0.2 rounded uppercase">
                                  Current User
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 font-mono text-slate-700">{u.email}</td>

                        <td className="py-4 px-5 text-slate-600">{u.phone || "—"}</td>

                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === "admin"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            disabled={isSelf}
                            className={`text-xs font-bold hover:underline ${
                              isSelf ? "text-slate-300 cursor-not-allowed" : "text-sky-600"
                            }`}
                          >
                            {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={isSelf}
                            className={`text-xs font-bold hover:underline ${
                              isSelf ? "text-slate-300 cursor-not-allowed" : "text-rose-600"
                            }`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
