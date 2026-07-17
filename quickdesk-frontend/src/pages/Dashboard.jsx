import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";


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

    window.location.href = "/login";

  };


  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center">


      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">


        <h1 className="text-3xl font-bold text-slate-800">
          Welcome to QuickDesk Dashboard 👋
        </h1>


        <p className="mt-4 text-slate-500">
          {message}
        </p>


        <button
          onClick={logout}
          className="mt-6 rounded-xl bg-red-500 px-6 py-3 text-white font-semibold hover:bg-red-600"
        >
          Logout
        </button>


      </div>


    </div>

  );
};


export default Dashboard;