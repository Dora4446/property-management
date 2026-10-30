import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AdminDashboard } from './AdminDashboard';
import { OwnerDashboard } from './OwnerDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AgentDashboard } from './AgentDashboard';
import { TenantDashboard } from './TenantDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'PROPERTY_OWNER':
    case 'AGENT':
    case 'PROPERTY_MANAGER':
      return <ManagerDashboard />;
    case 'TENANT':
      return <TenantDashboard />;
    default:
      return <ManagerDashboard />;
  }
};
