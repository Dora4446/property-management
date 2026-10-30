import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  Wrench,
  TrendingDown,
  BarChart3,
  CalendarCheck,
  UserCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout, isAdmin, isOwner, isManager, isAgent, isTenant } = useAuthStore();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'AGENT', 'TENANT'],
    },
    {
      label: 'Properties',
      path: '/properties',
      icon: Building2,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'AGENT'],
    },
    {
      label: 'My Rental',
      path: '/my-property',
      icon: Building2,
      roles: ['TENANT'],
    },
    {
      label: 'Tenants',
      path: '/tenants',
      icon: Users,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'AGENT'],
    },
    {
      label: 'Lease Agreements',
      path: '/agreements',
      icon: FileText,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT'],
    },
    {
      label: 'Rent & Payments',
      path: '/payments',
      icon: CreditCard,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT'],
    },
    {
      label: 'Maintenance',
      path: '/maintenance',
      icon: Wrench,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT'],
    },
    {
      label: 'Expenses & Finance',
      path: '/expenses',
      icon: TrendingDown,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER'],
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER'],
    },
    {
      label: 'Property Visits',
      path: '/visits',
      icon: CalendarCheck,
      roles: ['ADMIN', 'PROPERTY_MANAGER', 'AGENT'],
    },
    {
      label: 'User Management',
      path: '/users',
      icon: ShieldAlert,
      roles: ['ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
              PH
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-bold text-white text-lg tracking-tight block">PropertyHub</span>
                <span className="text-[10px] text-teal-400 font-medium uppercase tracking-wider block">India Real Estate</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Role Tag */}
        {!collapsed && user && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-600"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 inline-block mt-0.5">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-4 px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors text-sm font-medium"
          title="Sign out"
        >
          <LogOut className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
