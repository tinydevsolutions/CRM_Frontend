import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Agreements from "./pages/Agreements";
import InvoiceView from "./pages/InvoiceView";
import AgreementView from "./pages/AgreementView";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Standalone Printable Views */}
          <Route path="/invoice/:id" element={<InvoiceView />} />
          <Route path="/agreement/:id" element={<AgreementView />} />

          {/* Standard Dashboard Layout Views */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/agreements" element={<Agreements />} />

            {/* Super Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={
              <div className="flex h-full items-center justify-center">
                <p className="text-zinc-500">Page not found or in development.</p>
              </div>
            } />
          </Route>
        </Route>
      </Routes>
  );
}

export default App;