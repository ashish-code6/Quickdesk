import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip } from "lucide-react";
import api from "../services/api";

const TicketDetails = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {ticket.status}
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
          <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Reply, resolve, and override controls need matching backend update endpoints before they can be connected.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
