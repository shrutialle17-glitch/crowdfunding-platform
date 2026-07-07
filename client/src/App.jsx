import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { UserCircle, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/layout/ProtectedRoute";

import { Landing } from "./pages/Landing";
import { Explore } from "./pages/Explore";
import { Leaderboard } from "./pages/Leaderboard";
import { CampaignDetail } from "./pages/CampaignDetail";

import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { AdminApprovals } from "./pages/dashboard/AdminApprovals";
import { AdminKYC } from "./pages/dashboard/AdminKYC";
import { AdminUsers } from "./pages/dashboard/AdminUsers";
import { AdminReports } from "./pages/dashboard/AdminReports";

import { CreateCampaign } from "./pages/CreateCampaign";
import { CreatorDashboard } from "./pages/dashboard/CreatorDashboard";
import { CreatorCampaigns } from "./pages/dashboard/CreatorCampaigns";
import { EditCampaign } from "./pages/dashboard/EditCampaign";
import { CreatorAnalytics } from "./pages/dashboard/CreatorAnalytics";
import { CreatorSupporters } from "./pages/dashboard/CreatorSupporters";
import { CreatorKYC } from "./pages/dashboard/CreatorKYC";
import { CreatorUpdates } from "./pages/dashboard/CreatorUpdates";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { NotificationDropdown } from "./components/layout/NotificationDropdown";
import { Footer } from "./components/layout/Footer";
import { Button } from "./components/ui/Button";
import { useDarkMode } from "./hooks/useDarkMode";

import { DonorDashboard } from "./pages/dashboard/DonorDashboard";
import { DonorHistory } from "./pages/dashboard/DonorHistory";
import { DonorSettings } from "./pages/dashboard/DonorSettings";

const queryClient = new QueryClient();

// Extracted Navbar to use auth hooks
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  const DarkModeToggle = () => (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-background transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface/90 border-b border-border">
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="flex flex-col p-4 space-y-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">
              Home
            </Link>

            <Link
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className="py-2"
            >
              Explore
            </Link>

            <Link
              to="/leaderboard"
              onClick={() => setMobileOpen(false)}
              className="py-2"
            >
              Leaderboard
            </Link>

            <DarkModeToggle />

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2"
                >
                  Login
                </Link>

                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={user.role === "creator" ? "/creator" : "/donor"}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>

                {user.role === "creator" && (
                  <Link to="/create" onClick={() => setMobileOpen(false)}>
                    Start Campaign
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="w-full py-2 rounded-lg bg-primary text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-h3 text-primary font-heading font-bold">
            KindFund
          </h1>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-background"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <nav className="hidden md:flex gap-6 items-center">
          {/* Universal Links */}
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Explore
          </Link>
          <Link
            to="/leaderboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Leaderboard
          </Link>

          {/* Role-specific Links */}
          {user && user.role === "admin" && (
            <>
              <div className="h-4 w-px bg-border mx-2"></div>
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/approvals"
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Approvals
              </Link>
              <Link
                to="/admin/kyc"
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                KYC
              </Link>
              <Link
                to="/admin/users"
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Users
              </Link>
              <Link
                to="/admin/reports"
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Reports
              </Link>
            </>
          )}

          {user && (user.role === "donor" || user.role === "creator") && (
            <>
              <div className="h-4 w-px bg-border mx-2"></div>
              {user.role === "creator" && (
                <Link
                  to="/create"
                  className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Start Campaign
                </Link>
              )}
              <Link
                to={user.role === "donor" ? "/donor" : "/creator"}
                className="text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}

          {/* Global Controls */}
          <div className="h-4 w-px bg-border mx-2"></div>
          <DarkModeToggle />

          {/* Auth / User Actions */}
          {!user ? (
            <>
              <div className="h-4 w-px bg-border mx-2"></div>
              <Link
                to="/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link to="/register">
                <Button className="px-4 py-2">Register</Button>
              </Link>
            </>
          ) : (
            <>
              <NotificationDropdown />
              <div className="h-4 w-px bg-border mx-2"></div>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1.5 text-text-secondary"
                  title={user.name}
                >
                  <UserCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium hidden md:inline-block">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs px-3 py-1.5 bg-surface border border-border text-text-secondary hover:text-text-primary rounded-lg hover:bg-background transition-colors font-medium cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-text-primary overflow-x-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Creator Routes */}
                <Route
                  path="/create"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreateCampaign />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/campaigns"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorCampaigns />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/campaigns/:id/edit"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <EditCampaign />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/updates"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorUpdates />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/analytics"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorAnalytics />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/supporters"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorSupporters />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/creator/kyc"
                  element={
                    <RoleRoute allowedRoles={["creator"]}>
                      <CreatorKYC />
                    </RoleRoute>
                  }
                />

                {/* Protected Donor Routes */}
                <Route
                  path="/donor"
                  element={
                    <RoleRoute allowedRoles={["donor"]}>
                      <DonorDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/donor/history"
                  element={
                    <RoleRoute allowedRoles={["donor"]}>
                      <DonorHistory />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/donor/settings"
                  element={
                    <RoleRoute allowedRoles={["donor"]}>
                      <DonorSettings />
                    </RoleRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/approvals"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminApprovals />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/kyc"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminKYC />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminUsers />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminReports />
                    </RoleRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
