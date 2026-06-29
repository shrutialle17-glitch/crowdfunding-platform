import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Heart, Settings, Target, Users, AlertCircle, BarChart3, ShieldCheck, Megaphone 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const DashboardLayout = ({ children, role = 'donor' }) => {
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Overview', path: '/admin', icon: LayoutDashboard },
          { name: 'Pending Campaigns', path: '/admin/approvals', icon: AlertCircle },
          { name: 'KYC Queue', path: '/admin/kyc', icon: Users },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Reports', path: '/admin/reports', icon: AlertCircle },
        ];
      case 'creator':
        return [
          { name: 'Dashboard', path: '/creator', icon: LayoutDashboard },
          { name: 'My Campaigns', path: '/creator/campaigns', icon: Target },
          { name: 'My Supporters', path: '/creator/supporters', icon: Users },
          { name: 'Updates', path: '/creator/updates', icon: Megaphone },
          { name: 'Analytics', path: '/creator/analytics', icon: BarChart3 },
          { name: 'Verify Account', path: '/creator/kyc', icon: ShieldCheck },
        ];
      case 'donor':
      default:
        return [
          { name: 'My Impact', path: '/donor', icon: Heart },
          { name: 'Donation History', path: '/donor/history', icon: BarChart3 },
          { name: 'Settings', path: '/donor/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col md:flex-row flex-1 w-full h-full min-h-[calc(100vh-73px)]">
      <aside className="w-full md:w-64 shrink-0 bg-surface border-r border-border p-6 shadow-warm-sm z-10">
        <div className="mb-8 hidden md:block">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            {role} Menu
          </h2>
        </div>
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-text-secondary hover:bg-background border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 min-w-0 p-6 md:p-10 bg-background overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
