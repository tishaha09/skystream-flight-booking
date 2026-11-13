/**
 * Format a number as Indian Rupee (INR) currency
 * e.g., 4850 -> ₹4,850
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date string into human readable format
 * e.g., "2026-11-15" -> "Sun, 15 Nov 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/**
 * Status color badge helper
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "scheduled":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "delayed":
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "completed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};
