import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, History, Paperclip, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatTicketStatus, getStatusBadgeClass } from "../utils/ticketStyles";

const categories = ["IT", "HR", "FINANCE", "ADMIN", "OTHER"];
const priorities = ["LOW", "MEDIUM", "HIGH"];
const auditPageSize = 3;

const TicketDetails = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalReply, setFinalReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [overrideData, setOverrideData] = useState({
    category: "",
    priority: "",
  });
  const [savingOverride, setSavingOverride] = useState(false);
  const [auditPage, setAuditPage] = useState(1);

  const loadTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
      setOverrideData({
        category: data.category,
        priority: data.priority,
      });
      setAuditPage(1);
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    if (overrideData.category && overrideData.category !== ticket.category) {
      payload.category = overrideData.category;
    }

    if (overrideData.priority && overrideData.priority !== ticket.priority) {
      payload.priority = overrideData.priority;
    }

    if (!payload.category && !payload.priority) {
      toast.error("Change category or priority first");
      return;
    }

    setSavingOverride(true);

    try {
      await api.patch(`/tickets/${id}/override`, payload);
      await loadTicket();
      toast.success("Ticket updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update ticket");
    } finally {
      setSavingOverride(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!finalReply.trim()) {
      toast.error("Reply is required");
      return;
    }

    setSubmitting(true);

    try {
      await api.patch(`/tickets/${id}/reply`, {
        finalReply: finalReply.trim(),
      });

      await loadTicket();
      setFinalReply("");
      toast.success("Ticket resolved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resolve ticket");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Ticket not found</h1>
        <Link to="/tickets" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
          Back to tickets
        </Link>
      </div>
    );
  }

  const auditLogs = ticket.overrideLogs || [];
  const totalAuditPages = Math.max(1, Math.ceil(auditLogs.length / auditPageSize));
  const auditStart = (auditPage - 1) * auditPageSize;
  const visibleAuditLogs = auditLogs.slice(auditStart, auditStart + auditPageSize);

  return (
    <div className="space-y-5">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft size={18} />
        Back to tickets
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">{ticket.description}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${getStatusBadgeClass(ticket.status)}`}>
              {formatTicketStatus(ticket.status)}
            </span>
          </div>

          {ticket.attachment && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <Paperclip size={16} />
              {ticket.attachment}
            </div>
          )}

          {ticket.finalReply && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Final Reply</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-800">{ticket.finalReply}</p>
            </div>
          )}

          {isAgent && (
            <form onSubmit={handleReplySubmit} className="mt-6 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">Agent Reply</h2>
                  <p className="mt-1 text-sm text-slate-500">Submit reply to mark this ticket as resolved.</p>
                </div>
                {ticket.status === "RESOLVED" && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Resolved
                  </span>
                )}
              </div>

              <textarea
                value={finalReply}
                onChange={(e) => setFinalReply(e.target.value)}
                rows="5"
                disabled={ticket.status === "RESOLVED" || submitting}
                placeholder="Write final reply for employee..."
                className="mt-4 w-full resize-none rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={ticket.status === "RESOLVED" || submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send size={17} />
                  {submitting ? "Submitting..." : "Reply & Resolve"}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Ticket Info</h2>

            <div className="mt-3 grid grid-cols-3 gap-3 xl:grid-cols-1">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
                <p className="mt-1 font-semibold text-slate-900">{ticket.category}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Priority</p>
                <p className="mt-1 font-semibold text-slate-900">{ticket.priority}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">AI Suggested</p>
                <p className="mt-1 font-semibold text-slate-900">{ticket.aiSuggested ? "Yes" : "No"}</p>
              </div>
            </div>

            {isAgent && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-sm font-semibold text-slate-900">Submitted by</p>
                <p className="mt-1 text-sm text-slate-600">{ticket.user?.name || "Employee"}</p>
                {ticket.user?.email && <p className="text-sm text-slate-500">{ticket.user.email}</p>}
              </div>
            )}
          </div>

          {isAgent && (
            <form onSubmit={handleOverrideSubmit} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-sm font-semibold uppercase text-slate-500">Override</h2>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={overrideData.category}
                    onChange={(e) => setOverrideData((current) => ({ ...current, category: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-600"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={overrideData.priority}
                    onChange={(e) => setOverrideData((current) => ({ ...current, priority: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-600"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingOverride}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={17} />
                  {savingOverride ? "Saving..." : "Save Override"}
                </button>
              </div>
            </form>
          )}

          {isAgent && (
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-slate-500" />
                  <h2 className="text-sm font-semibold uppercase text-slate-500">Audit Log</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {auditLogs.length}
                </span>
              </div>

              <div className="mt-3 min-h-[190px] divide-y divide-slate-100">
                {visibleAuditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 text-sm">
                    <p className="font-medium capitalize text-slate-900">{log.field}</p>
                    <p className="mt-1 text-slate-600">
                      <span className="font-medium">{log.fromValue}</span> to <span className="font-medium">{log.toValue}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {log.agent?.name || "Agent"} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <p className="py-3 text-sm text-slate-500">No overrides recorded.</p>
                )}
              </div>

              {auditLogs.length > auditPageSize && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    disabled={auditPage === 1}
                    onClick={() => setAuditPage((page) => Math.max(1, page - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span className="text-sm font-medium text-slate-600">
                    Page {auditPage} of {totalAuditPages}
                  </span>
                  <button
                    type="button"
                    disabled={auditPage === totalAuditPages}
                    onClick={() => setAuditPage((page) => Math.min(totalAuditPages, page + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TicketDetails;
