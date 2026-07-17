import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  User,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";


const Sidebar = () => {

 const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();


  const logout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };


  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      name: "Create Ticket",
      path: "/tickets/create",
      icon: PlusCircle,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];



  return (

    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col px-4 py-5">


      {/* Brand */}

      <div className="px-3 mb-8">

        <h1 className="text-xl font-bold tracking-tight">
          QuickDesk
        </h1>


        <p className="text-xs text-slate-400 mt-1">
          AI Helpdesk Platform
        </p>


      </div>

      {/* Menu */}

      <nav className="flex-1 space-y-1">


        {
          menuItems.map((item) => {

            const Icon = item.icon;


            return (

              <NavLink

                key={item.name}

                to={item.path}


                className={({isActive}) =>

                  `
                  flex items-center gap-3
                  px-3 py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  transition-all duration-200

                  ${
                    isActive
                    ?
                    "bg-indigo-600 text-white shadow-sm"
                    :
                    "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }

                  `

                }

              >

                <Icon size={18}/>


                <span>
                  {item.name}
                </span>


              </NavLink>

            )

          })
        }


      </nav>





      {/* User Section */}

      <div className="border-t border-slate-800 pt-4">


        <div className="flex items-center gap-3 px-3 mb-4">


          <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>


          <div>

            <p className="text-sm font-medium">
              {user?.name}
            </p>


            <p className="text-xs text-slate-400">
              {user?.role}
            </p>


          </div>


        </div>





        <button

          onClick={logout}

          className="
          flex items-center gap-3
          w-full
          px-3 py-2.5
          rounded-lg
          text-sm
          font-medium
          text-slate-300
          hover:bg-red-500/10
          hover:text-red-400
          transition
          "

        >

          <LogOut size={18}/>

          Logout


        </button>


      </div>



    </aside>

  );
};


export default Sidebar;