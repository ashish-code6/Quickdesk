import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";


const Login = () => {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const { data } = await api.post(
        "/auth/login",
        formData
      );


      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);


      toast.success("Login Successful");


      navigate("/dashboard");


    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Invalid credentials"
      );

    }
  };


  return (

    <div className="min-h-screen overflow-hidden grid lg:grid-cols-2">


      {/* Left Login Section */}

      <div className="flex items-center justify-center bg-slate-100 px-6 py-6">


        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">


          <h2 className="text-3xl font-bold text-slate-800">
            Welcome Back
          </h2>


          <p className="mt-2 text-slate-500">
            Login to your QuickDesk account.
          </p>



          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >


            {/* Email */}

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
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                />


              </div>

            </div>




            {/* Password */}

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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                />


              </div>

            </div>





            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Login
            </button>


          </form>




          <p className="mt-5 text-center text-sm text-slate-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create Account
            </Link>

          </p>


        </div>


      </div>





      {/* Right Branding Section */}


      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-900 to-cyan-700 px-12 text-white">


        <div className="max-w-md">


          <h1 className="text-5xl font-extrabold tracking-tight">
            QuickDesk
          </h1>



          <p className="mt-5 text-lg leading-8 text-slate-200">

            AI-powered internal helpdesk platform
            that helps employees raise tickets
            and agents resolve issues faster.

          </p>




          <div className="mt-8 space-y-4">


            <div className="flex items-center gap-3">

              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>

              <span>
                AI-powered ticket assistance
              </span>

            </div>



            <div className="flex items-center gap-3">

              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>

              <span>
                Real-time ticket tracking
              </span>

            </div>



            <div className="flex items-center gap-3">

              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400"></div>

              <span>
                Secure role-based authentication
              </span>

            </div>


          </div>


        </div>


      </div>


    </div>

  );
};


export default Login;