import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Paperclip, Send, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const CreateTicket = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "AGENT";
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attachment: "",
  });
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "description") {
      setSuggestion(null);
    }
  };

  const handleSuggest = async () => {
    if (!formData.description.trim()) {
      toast.error("Description is required for AI suggestion");
      return;
    }

    setSuggesting(true);

    try {
      const { data } = await api.get("/ai/category-priority", {
        params: {
          title: formData.title,
          description: formData.description,
        },
      });

      setSuggestion(data);
      toast.success("AI suggestion ready");
    } catch (error) {
      setSuggestion(null);
      toast.error(error.response?.data?.message || "Unable to generate suggestion");
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await api.post("/tickets", {
        title: formData.title,
        description: formData.description,
        attachment: formData.attachment || undefined,
      });

      toast.success(`Ticket submitted: ${data.category} / ${data.priority}`);
      navigate("/tickets");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ticket submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAgent) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Create Ticket</h1>
        <p className="mt-2 text-slate-500">Agents manage submitted tickets from the all tickets view.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create Ticket</h1>
        <p className="mt-1 text-slate-500">Submit a support request for the agent team.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Example: Laptop is not connecting to Wi-Fi"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting || submitting}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={15} />
                {suggesting ? "Suggesting..." : "Suggest with AI"}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe the issue clearly..."
              className="w-full resize-none rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
            {suggestion && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Sparkles size={15} />
                  AI Suggestion
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1 ring-indigo-100">
                  Category: {suggestion.category}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1 ring-indigo-100">
                  Priority: {suggestion.priority}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Attachment filename</label>
            <div className="relative">
              <Paperclip size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="attachment"
                value={formData.attachment}
                onChange={handleChange}
                placeholder="screenshot.png"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            <Send size={18} />
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
