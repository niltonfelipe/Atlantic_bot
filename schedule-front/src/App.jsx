import { Routes, Route } from "react-router-dom";
import ClientPage from "./pages/ClientPage";
import UserPage from "./pages/UserPage";
import ZonePage from "./pages/ZonePage";
import SchedulePage from "./pages/SchedulePage";
import FormSchedulePage from "./pages/FormSchedulePage";
import Login from "./pages/Login";
import PrivateRoute from "./components/authRoute/PrivateRoute";
import UnderConstruction from "./components/static/UnderConstruction";
import ResetFirstAdmin from "./pages/ResetFirstAdmin";
import UpdateAdmin from "./pages/UpdateAdmin";
import ProfileAdmin from "./pages/ProfileAdmin";
import AdminPage from "./pages/AdminPage";

import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/scheduleforms"
          element={
            <PrivateRoute>
              <FormSchedulePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <ClientPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/zones"
          element={
            <PrivateRoute>
              <ZonePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute>
              <SchedulePage />
            </PrivateRoute>
          }
        />
        <Route path="/resetforms" element={<ResetFirstAdmin />} />
        <Route
          path="/admin/update"
          element={
            <PrivateRoute>
              <UpdateAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute>
              <ProfileAdmin />
            </PrivateRoute>
          }
        />
        <Route path="/building" element={<UnderConstruction />} />
      </Routes>
    </AuthProvider>
  );
}
