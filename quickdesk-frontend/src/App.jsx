import { Navigate, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Profile from "./pages/Profile";

function App() {
  return (

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
       <Route

        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }

      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/tickets"
          element={<MyTickets />}
        />

        <Route
          path="/tickets/create"
          element={<CreateTicket />}
        />

        <Route
          path="/tickets/:id"
          element={<TicketDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Route>

      
    </Routes>

  );
}

export default App;
