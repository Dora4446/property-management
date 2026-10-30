import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Authenticated Pages
import { DashboardRouter } from '../pages/dashboard/DashboardRouter';
import { PropertyList } from '../pages/properties/PropertyList';
import { PropertyDetail } from '../pages/properties/PropertyDetail';
import { MyProperty } from '../pages/properties/MyProperty';
import { TenantList } from '../pages/tenants/TenantList';
import { AgreementList } from '../pages/agreements/AgreementList';
import { PaymentList } from '../pages/payments/PaymentList';
import { MaintenanceList } from '../pages/maintenance/MaintenanceList';
import { ExpenseList } from '../pages/expenses/ExpenseList';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { VisitList } from '../pages/visits/VisitList';
import { UserList } from '../pages/users/UserList';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/my-property" element={<MyProperty />} />
          <Route path="/tenants" element={<TenantList />} />
          <Route path="/agreements" element={<AgreementList />} />
          <Route path="/payments" element={<PaymentList />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/visits" element={<VisitList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
