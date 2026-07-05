import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/layout/ProtectedRoute';

import  { Landing } from './pages/Landing';
import { Explore } from './pages/Explore';
import { Leaderboard } from './pages/Leaderboard';
import { CampaignDetail } from './pages/CampaignDetail';

import { CreateCampaign } from './pages/CreateCampaign';
import { CreatorDashboard } from './pages/dashboard/CreatorDashboard';
import { CreatorCampaigns } from './pages/dashboard/CreatorCampaigns';
import { EditCampaign } from './pages/dashboard/EditCampaign';
import { CreatorAnalytics } from './pages/dashboard/CreatorAnalytics';
import { CreatorSupporters } from './pages/dashboard/CreatorSupporters';
import { CreatorKYC } from './pages/dashboard/CreatorKYC';
import { CreatorUpdates } from './pages/dashboard/CreatorUpdates';


import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotificationDropdown } from './components/layout/NotificationDropdown';
import { Footer } from './components/layout/Footer';
import { Button } from './components/ui/Button';
import { UserCircle, Sun, Moon } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';


import { DonorDashboard } from './pages/dashboard/DonorDashboard';
import { DonorHistory } from './pages/dashboard/DonorHistory';
import { DonorSettings } from './pages/dashboard/DonorSettings';


const queryClient = new QueryClient();

// Extracted Navbar to use auth hooks
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useDarkMode();
  
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
    <header className="px-6 py-4 bg-surface border-b border-border shadow-warm-sm flex justify-between items-center sticky top-0 z-40">
      <Link to="/"><h1 className="text-h3 text-primary font-heading font-bold">KindFund</h1></Link>

      <nav className="hidden md:flex gap-6 items-center">
        {!user && (
          <>
            <Link to="/" className="text-body font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/explore" className="text-body font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/leaderboard" className="text-body font-medium hover:text-primary transition-colors">Leaderboard</Link>
            <div className="h-4 w-px bg-border mx-2"></div>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link to="/register"><Button className="px-4 py-2">Register</Button></Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">Leaderboard</Link>
            <div className="h-4 w-px bg-border mx-2"></div>
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/admin/approvals" className="text-sm text-text-secondary hover:text-primary transition-colors">Approvals</Link>
            <Link to="/admin/kyc" className="text-sm text-text-secondary hover:text-primary transition-colors">KYC</Link>
            <Link to="/admin/users" className="text-sm text-text-secondary hover:text-primary transition-colors">Users</Link>
            <Link to="/admin/reports" className="text-sm text-text-secondary hover:text-primary transition-colors">Reports</Link>
            <div className="h-4 w-px bg-border mx-2"></div>
            <NotificationDropdown />
            <div className="h-4 w-px bg-border mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-text-secondary" title={user.name}>
                <UserCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium hidden md:inline-block">{user.name}</span>
              </div>
              <button onClick={logout} className="text-xs px-3 py-1.5 bg-surface border border-border text-text-secondary hover:text-text-primary rounded-lg hover:bg-background transition-colors font-medium cursor-pointer">Logout</button>
            </div>
          </>
        )}

        {user && (user.role === 'donor' || user.role === 'creator') && (
          <>
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">Leaderboard</Link>
            {user.role === 'creator' && (
              <Link to="/create" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">Start Campaign</Link>
            )}
            <Link to={user.role === 'donor' ? '/donor' : '/creator'} className="text-sm text-text-secondary hover:text-primary transition-colors">Dashboard</Link>
            
            <DarkModeToggle />
            <div className="h-4 w-px bg-border mx-2"></div>
            <NotificationDropdown />
            <div className="h-4 w-px bg-border mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-text-secondary" title={user.name}>
                <UserCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium hidden md:inline-block">{user.name}</span>
              </div>
              <button onClick={logout} className="text-xs px-3 py-1.5 bg-surface border border-border text-text-secondary hover:text-text-primary rounded-lg hover:bg-background transition-colors font-medium cursor-pointer">Logout</button>
            </div>
          </>
        )}
      </nav>
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

                <Route path="/create" element={<RoleRoute allowedRoles={['creator']}><CreateCampaign /></RoleRoute>} />
                <Route path="/creator" element={<RoleRoute allowedRoles={['creator']}><CreatorDashboard /></RoleRoute>} />
                <Route path="/creator/campaigns" element={<RoleRoute allowedRoles={['creator']}><CreatorCampaigns /></RoleRoute>} />
                <Route path="/creator/campaigns/:id/edit" element={<RoleRoute allowedRoles={['creator']}><EditCampaign /></RoleRoute>} />
                <Route path="/creator/updates" element={<RoleRoute allowedRoles={['creator']}><CreatorUpdates /></RoleRoute>} />
                <Route path="/creator/analytics" element={<RoleRoute allowedRoles={['creator']}><CreatorAnalytics /></RoleRoute>} />
                <Route path="/creator/supporters" element={<RoleRoute allowedRoles={['creator']}><CreatorSupporters /></RoleRoute>} />
                <Route path="/creator/kyc" element={<RoleRoute allowedRoles={['creator']}><CreatorKYC /></RoleRoute>} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/*Donor Routes */}
                <Route path="/donor" element={<RoleRoute allowedRoles={['donor']}><DonorDashboard /></RoleRoute>} />
                <Route path="/donor/history" element={<RoleRoute allowedRoles={['donor']}><DonorHistory /></RoleRoute>} />
                <Route path="/donor/settings" element={<RoleRoute allowedRoles={['donor']}><DonorSettings /></RoleRoute>} />
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
