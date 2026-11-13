import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../components/Button.jsx";

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: "error", text: "New password must be at least 6 characters long." });
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
      if (!formData.currentPassword) {
        setMessage({ type: "error", text: "Current password is required to change password." });
        return;
      }
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-10 px-4 sm:px-6 bg-[#F0F4F8] text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-2xl shadow-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white border-2 border-white shadow-xs">
                Active
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                  {user?.role === "admin" ? "SkyStream Fleet Admin" : "SkyPass Member"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  ★ Gold Tier
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Frequent Flyer Member ID: <span className="font-mono font-semibold text-slate-700">SK-{(user?._id || "92830").slice(-6).toUpperCase()}</span>
              </p>

              {/* Quick badges */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-200">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Tier Status</span>
                  <span className="text-xs font-bold text-slate-800">Priority Pass</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-200">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Baggage</span>
                  <span className="text-xs font-bold text-slate-800">15kg + 7kg</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-200">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Fast Track</span>
                  <span className="text-xs font-bold text-sky-700">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center space-x-2 border transition-all animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  Personal Information
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Used for automatic ticket dispatch</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name (as per Passport / ID)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Security & Password
                </h3>
                <span className="text-[11px] text-slate-400">Leave blank to keep current password</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Required only when changing password"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50 transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                loading={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2.5 rounded-full shadow-xs"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
