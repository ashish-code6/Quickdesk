import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";

const statuses = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"];
const categories = ["ALL", "IT", "HR", "FINANCE", "ADMIN", "OTHER"];
const priorities = ["ALL", "LOW", "MEDIUM", "HIGH"];

const MyTickets = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "ALL",
    category: "ALL",
    priority: "ALL",
    search: "",
  });

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

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = filters.status === "ALL" || ticket.status === filters.status;
      const matchesCategory = filters.category === "ALL" || ticket.category === filters.category;
      const matchesPriority = filters.priority === "ALL" || ticket.priority === filters.priority;
      const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });
  }, [tickets, filters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isAgent ? "All Tickets" : "My Tickets"}</h1>
        <p className="mt-1 text-slate-500">
          {isAgent ? "Filter and review tickets from every employee." : "Track the tickets submitted by you."}
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by title"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-600">
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>

          <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-600">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>

          <select value={filters.priority} onChange={(e) => updateFilter("priority", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-600">
            {priorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Title</th>
              {isAgent && <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Employee</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Priority</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{ticket.title}</td>
                {isAgent && <td className="px-4 py-3 text-sm text-slate-600">{ticket.user?.name || "Employee"}</td>}
                <td className="px-4 py-3 text-sm text-slate-600">{ticket.status}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ticket.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{ticket.priority}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/tickets/${ticket.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredTickets.length === 0 && (
          <p className="py-8 text-center text-slate-500">No tickets found.</p>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
