import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, TicketCheck } from "lucide-react";
import api from "../services/api";
import { formatTicketStatus, getStatusBadgeClass } from "../utils/ticketStyles";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const { data } = await api.get(isAgent ? "/tickets" : "/tickets/my");
        setTickets(data);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isAgent]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      progress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {isAgent ? "Agent workspace" : "Employee workspace"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {isAgent ? "Support Dashboard" : "My Dashboard"}
          </h1>
          <p className="mt-1 text-slate-500">
            {isAgent
              ? "Review, filter, and manage every submitted ticket."
              : "Submit tickets and track your own requests."}
          </p>
        </div>

        <Link
          to={isAgent ? "/tickets" : "/tickets/create"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {isAgent ? <TicketCheck size={18} /> : <PlusCircle size={18} />}
          {isAgent ? "View All Tickets" : "Create Ticket"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Total Tickets", stats.total],
          ["Open", stats.open],
          ["In Progress", stats.progress],
          ["Resolved", stats.resolved],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "-" : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {tickets.slice(0, 5).map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="flex items-center justify-between py-3 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{ticket.title}</p>
                <p className="text-sm text-slate-500">{ticket.category} • {ticket.priority}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadgeClass(ticket.status)}`}>
                {formatTicketStatus(ticket.status)}
              </span>
            </Link>
          ))}

          {!loading && tickets.length === 0 && (
            <p className="py-6 text-center text-slate-500">No tickets found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
