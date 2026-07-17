const Dashboard = () => {
  return (
    <div>

      <h1 className="text-2xl font-bold text-slate-800">
        Welcome back 👋
      </h1>

      <p className="text-slate-500 mt-1">
        Manage your support tickets here.
      </p>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-slate-500">
            Total Tickets
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>


        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-slate-500">
            Open
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>


        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-slate-500">
            Pending
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>


        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-slate-500">
            Resolved
          </h3>
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>

      </div>


      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow mt-8 p-5">

        <h2 className="font-semibold text-lg">
          Recent Tickets
        </h2>

        <p className="text-slate-500 mt-4">
          No tickets available
        </p>

      </div>


    </div>
  );
};

export default Dashboard;