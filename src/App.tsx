import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LeaveForm from "./components/LeaveForm";
import ChangePassword from "./components/ChangePassword";

const getRole = (): string | null => {
  try {
    return localStorage.getItem("role");
  } catch {
    return null;
  }
};

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactElement;
  requiredRole?: "admin" | "employee";
}) {
  const role = getRole();

  if (!role) return <Navigate to="/" replace />;

  const isAdmin = role.endsWith("_ADMIN");
  const isEmployee = role === "EMPLOYEE";

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "employee" && !isEmployee) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Employee routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-leave"
        element={
          <ProtectedRoute requiredRole="employee">
            <LeaveForm />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/change-password" element={<ChangePassword />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
