export const getStatusBadgeClass = (status) => {
  const styles = {
    OPEN: "bg-sky-50 text-sky-700 ring-sky-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return styles[status] || "bg-slate-50 text-slate-700 ring-slate-200";
};

export const formatTicketStatus = (status) => {
  return status?.replaceAll("_", " ") || "UNKNOWN";
};
