import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import ServiceTile from '@/components/ServiceTile';
import CitizenSummaryCard from '@/components/CitizenSummaryCard';
import RecentActivity from '@/components/RecentActivity';
import DocumentsShortcut from '@/components/DocumentsShortcut';
import QuickActions from '@/components/QuickActions';
import HelpSupport from '@/components/HelpSupport';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Building2, 
  FileText, 
  UserCog
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { t, citizen, language, isAdmin, bills, complaints } = useApp();
  const navigate = useNavigate();

  if (!citizen) {
    navigate('/');
    return null;
  }

  // Calculate pending items for badges
  const pendingElectricity = bills.filter(b => b.service === 'electricity' && b.status === 'unpaid').length;
  const pendingWater = bills.filter(b => b.service === 'water' && b.status === 'unpaid').length;
  const pendingGas = bills.filter(b => b.service === 'gas' && b.status === 'unpaid').length;
  const pendingMunicipal = complaints.filter(c => c.department === 'municipal' && c.status === 'pending').length;

  const services = [
    { 
      icon: Zap, 
      label: t('electricity'), 
      path: '/service/electricity', 
      color: 'text-yellow-500',
      badge: pendingElectricity > 0 
        ? { count: pendingElectricity, type: 'pending' as const }
        : { type: 'clear' as const }
    },
    { 
      icon: Droplets, 
      label: t('water'), 
      path: '/service/water', 
      color: 'text-blue-500',
      badge: pendingWater > 0 
        ? { count: pendingWater, type: 'pending' as const }
        : { type: 'clear' as const }
    },
    { 
      icon: Flame, 
      label: t('gas'), 
      path: '/service/gas', 
      color: 'text-orange-500',
      badge: pendingGas > 0 
        ? { count: pendingGas, type: 'pending' as const }
        : { type: 'clear' as const }
    },
    { 
      icon: Building2, 
      label: t('municipal'), 
      path: '/service/municipal', 
      color: 'text-primary',
      badge: pendingMunicipal > 0 
        ? { count: pendingMunicipal, type: 'alert' as const }
        : { type: 'clear' as const }
    },
  ];

  return (
    <KioskLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Citizen Summary Card */}
        <div className="animate-slide-up">
          <CitizenSummaryCard />
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <button
              onClick={() => navigate('/admin')}
              className="w-full kiosk-card flex items-center justify-between p-5 hover:border-primary/30 transition-colors cursor-pointer bg-primary/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UserCog className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-foreground">{t('adminDashboard')}</h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Manage requests and approvals' : 'अनुरोध और अनुमोदन प्रबंधित करें'}
                  </p>
                </div>
              </div>
              <span className="text-3xl text-primary">→</span>
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl font-semibold text-foreground mb-5 flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" />
            {t('services')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {services.map((service) => (
              <ServiceTile
                key={service.path}
                icon={service.icon}
                label={service.label}
                iconColor={service.color}
                onClick={() => navigate(service.path)}
                badge={service.badge}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <QuickActions />
        </div>

        {/* Two Column Layout: Recent Activity & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Documents Shortcut */}
          <DocumentsShortcut />
        </div>

        {/* Help & Support */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <HelpSupport />
        </div>
      </div>
    </KioskLayout>
  );
};

export default Dashboard;