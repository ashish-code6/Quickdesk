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
  const isAgent = user?.role === "AGENT";
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
      end: true,
    },
    ...(isAgent
      ? [
          {
            name: "All Tickets",
            path: "/tickets",
            icon: Ticket,
            end: true,
          },
        ]
      : [
          {
            name: "My Tickets",
            path: "/tickets",
            icon: Ticket,
            end: true,
          },
          {
            name: "Create Ticket",
            path: "/tickets/create",
            icon: PlusCircle,
            end: true,
          },
        ]),
    {
      name: "Profile",
      path: "/profile",
      icon: User,
      end: true,
    },
  ];



  return (

    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900">


      {/* Brand */}

      <div className="border-b border-slate-100 px-5 py-5">

        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          QuickDesk
        </h1>


        <p className="mt-1 text-xs font-medium text-slate-500">
          AI Helpdesk Platform
        </p>


      </div>

      {/* Menu */}

      <nav className="flex-1 overflow-y-auto px-3 py-4">

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">


        {
          menuItems.map((item) => {

            const Icon = item.icon;


            return (

              <NavLink

                key={item.name}

                to={item.path}

                end={item.end}


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
                    "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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

        </div>


      </nav>





      {/* User Section */}

      <div className="border-t border-slate-100 p-3">


        <div className="mb-2 flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">


          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {user?.email?.charAt(0).toUpperCase()}
          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name}
            </p>


            <p className="text-xs font-medium text-slate-500">
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
          text-slate-600
          hover:bg-red-50
          hover:text-red-600
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
