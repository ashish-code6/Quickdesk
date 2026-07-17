import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

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


      </Route>

      
    </Routes>

  );
}

export default App;