import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  User,
  ShieldCheck,
  LogOut
} from "lucide-react";


const Dashboard = () => {

  const [message, setMessage] = useState("");



  useEffect(() => {

    const getProfile = async () => {

      try {

        const { data } = await api.get(
          "/users/profile"
        );

        setMessage(data.message);


      } catch (error) {

        toast.error("Session expired");

      }

    };


    getProfile();

  }, []);




  const logout = () => {

    localStorage.removeItem("token");

    toast.success("Logged out");

    window.location.href = "/login";

  };



  return (

    <div className="space-y-6">


      {/* Header */}

      <div>

        <h1 className="text-2xl font-semibold text-slate-800">
          Welcome back, Ashish 👋
        </h1>


        <p className="mt-1 text-sm text-slate-500">
          Manage your QuickDesk workspace from here.
        </p>

      </div>





      {/* Profile Card */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


        <div className="bg-white border border-slate-200 rounded-xl p-5">


          <div className="flex items-center gap-3">

            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <User size={22}/>
            </div>


            <div>

              <p className="text-sm text-slate-500">
                User
              </p>

              <h3 className="font-semibold text-slate-800">
                Ashish
              </h3>

            </div>


          </div>


        </div>





        <div className="bg-white border border-slate-200 rounded-xl p-5">


          <div className="flex items-center gap-3">

            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <ShieldCheck size={22}/>
            </div>


            <div>

              <p className="text-sm text-slate-500">
                Status
              </p>

              <h3 className="font-semibold text-slate-800">
                Authorized
              </h3>

            </div>


          </div>


        </div>





        <div className="bg-white border border-slate-200 rounded-xl p-5">


          <p className="text-sm text-slate-500">
            Backend Response
          </p>


          <h3 className="mt-2 font-semibold text-slate-800">
            {message || "Loading..."}
          </h3>


        </div>



      </div>






      {/* Account Section */}

      <div className="bg-white border border-slate-200 rounded-xl p-6">


        <h2 className="text-lg font-semibold text-slate-800">
          Account Settings
        </h2>


        <p className="mt-2 text-sm text-slate-500">
          You are logged in securely using JWT authentication.
        </p>



        <button
          onClick={logout}
          className="mt-5 flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-white text-sm font-medium hover:bg-red-600 transition"
        >

          <LogOut size={18}/>

          Logout

        </button>


      </div>



    </div>

  );

};


export default Dashboard;