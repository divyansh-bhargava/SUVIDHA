import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Shield, UserCog, Users, Building2 } from 'lucide-react';
import type { AdminRole } from '@/types/admin';
import { ROLE_LABELS, DEPARTMENT_LABELS } from '@/types/admin';

const AdminHeader: React.FC = () => {
  const { language, adminUser, adminRole, adminDepartment } = useApp();

  if (!adminUser) return null;

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'master': return <Shield className="w-6 h-6" />;
      case 'department': return <Building2 className="w-6 h-6" />;
      case 'staff': return <Users className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8 animate-slide-up">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        {getRoleIcon(adminRole!)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? adminUser.name : adminUser.nameHi}
          </h1>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {ROLE_LABELS[adminRole!][language]}
          </span>
        </div>
        <p className="text-muted-foreground">
          {adminDepartment 
            ? `${DEPARTMENT_LABELS[adminDepartment][language]} • ${language === 'en' ? adminUser.city : adminUser.cityHi}`
            : (language === 'en' ? adminUser.city : adminUser.cityHi)
          }
        </p>
      </div>
      
      {/* Quick Stats for Department/Staff */}
      {adminRole !== 'master' && (
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 rounded-xl bg-warning/10">
            <p className="text-2xl font-bold text-warning">14</p>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Pending' : 'लंबित'}
            </p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-success/10">
            <p className="text-2xl font-bold text-success">8</p>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Today' : 'आज'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
