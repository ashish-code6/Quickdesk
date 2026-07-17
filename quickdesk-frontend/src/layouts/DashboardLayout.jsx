import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


const DashboardLayout = ({ children }) => {

  return (
    <div className="min-h-screen bg-slate-100 flex">


      {/* Sidebar */}

      <Sidebar />


      {/* Right Side */}

      <div className="flex-1">


        <Navbar />


        <main className="p-6">
          {children}
        </main>


      </div>


    </div>
  );
};


export default DashboardLayout;