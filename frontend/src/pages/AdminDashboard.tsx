import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import MasterAdminDashboard from './admin/MasterAdminDashboard';
import DepartmentAdminDashboard from './admin/DepartmentAdminDashboard';

const AdminDashboard: React.FC = () => {
  const { isAdmin, adminRole } = useApp();
  const navigate = useNavigate();

  // Redirect non-admins
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  // Render appropriate dashboard based on role
  switch (adminRole) {
    case 'master':
      return <MasterAdminDashboard />;
    case 'department':
    case 'staff':
      return <DepartmentAdminDashboard />;
    default:
      // Fallback to department dashboard for legacy 'ADMIN' login
      return <DepartmentAdminDashboard />;
  }
};

export default AdminDashboard;
