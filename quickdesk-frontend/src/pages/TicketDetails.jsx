import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatTicketStatus, getStatusBadgeClass } from "../utils/ticketStyles";

const TicketDetails = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalReply, setFinalReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const { data } = await api.get(isAgent ? "/tickets" : "/tickets/my");
        const foundTicket = data.find((item) => String(item.id) === String(id));
        setTicket(foundTicket || null);
      } catch {
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id, isAgent]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!finalReply.trim()) {
      toast.error("Reply is required");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.patch(`/tickets/${id}/reply`, {
        finalReply: finalReply.trim(),
      });

      setTicket(data);
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

  return (
    <div className="space-y-5">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
        <ArrowLeft size={18} />
        Back to tickets
      </Link>

      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
            <p className="mt-2 text-slate-600">{ticket.description}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${getStatusBadgeClass(ticket.status)}`}>
            {formatTicketStatus(ticket.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Category</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.category}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Priority</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.priority}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">AI Suggested</p>
            <p className="mt-1 font-semibold text-slate-900">{ticket.aiSuggested ? "Yes" : "No"}</p>
          </div>
        </div>

        {isAgent && (
          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Submitted by</p>
            <p className="mt-1 text-slate-600">
              {ticket.user?.name || "Employee"} {ticket.user?.email ? `(${ticket.user.email})` : ""}
            </p>
          </div>
        )}

        {ticket.attachment && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <Paperclip size={16} />
            {ticket.attachment}
          </div>
        )}

        {isAgent && (
          <form onSubmit={handleReplySubmit} className="mt-6 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Agent Reply</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Submit reply to mark this ticket as resolved.
                </p>
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
              rows="4"
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
    </div>
  );
};

export default TicketDetails;
