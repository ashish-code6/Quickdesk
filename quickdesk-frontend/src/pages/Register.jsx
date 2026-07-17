import { Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const Register = () => {

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/auth/register", formData);

    toast.success("Registration Successful");

    navigate("/login");

  } catch (error) {

    toast.error(
      error.response?.data?.message || "Something went wrong"
    );

  }
};

    return (
        <>
            <div className="min-h-screen overflow-hidden grid lg:grid-cols-2">
                {/* Left Section */}
                <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-900 to-cyan-700 px-12 text-white">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-extrabold tracking-tight">
                            QuickDesk
                        </h1>

                        <p className="mt-5 text-lg leading-8 text-slate-200">
                            AI-powered internal helpdesk to help employees raise tickets and
                            enable support agents to resolve issues faster.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>
                                <span>AI-powered ticket categorization</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>
                                <span>Real-time ticket tracking</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>
                                <span>Secure role-based authentication</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-center bg-slate-100 px-6 py-6">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
                        <h2 className="text-3xl font-bold text-slate-800">
                            Create Account
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Create your QuickDesk account.
                        </p>

                        <form   onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Full Name
                                </label>

                                <div className="relative">
                                    <User
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={20}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input

                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-12 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Create Account
                            </button>
                        </form >

                        <p className="mt-5 text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-indigo-600 hover:underline"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Register;