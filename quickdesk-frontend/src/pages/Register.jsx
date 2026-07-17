import { Link } from "react-router-dom";
const Register = () => {
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

                        <form className="mt-6 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Create Account
                            </button>
                        </form>

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