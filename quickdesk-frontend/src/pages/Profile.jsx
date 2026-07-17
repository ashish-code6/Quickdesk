const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="max-w-xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Name</p>
          <p className="mt-1 font-semibold text-slate-900">{user?.name || "User"}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Email</p>
          <p className="mt-1 font-semibold text-slate-900">{user?.email || "-"}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Role</p>
          <p className="mt-1 font-semibold text-slate-900">{user?.role || "EMPLOYEE"}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
