import { Bell, Search } from "lucide-react";


const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (

    <header className="h-16 bg-white border-b flex items-center justify-between px-6">


      {/* Search */}

      <div className="relative w-96">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />


        <input
          type="text"
          placeholder="Search tickets..."
          className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-200"
        />


      </div>




      {/* Right Section */}

      <div className="flex items-center gap-5">


        {/* Notification */}

        <button
          className="relative rounded-xl p-2 hover:bg-slate-100"
        >

          <Bell size={22} className="text-slate-600"/>


          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>


        </button>




        {/* User */}

        <div className="flex items-center gap-3">


          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {initial.toUpperCase()}
          </div>


          <div>

            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>


            <p className="text-xs text-slate-500">
              {user?.role || "EMPLOYEE"}
            </p>


          </div>


        </div>



      </div>


    </header>

  );

};


export default Navbar;
