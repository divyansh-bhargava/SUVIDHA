import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import ServiceTile from '@/components/ServiceTile';
import CitizenWelcome from '@/components/CitizenWelcome';
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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 py-8">
        {/* Citizen Welcome - Combined Component */}
        <div className="animate-slide-up">
          <CitizenWelcome />
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <button
              onClick={() => navigate('/admin')}
              className="w-full rounded-2xl flex items-center justify-between p-6 transition-all cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UserCog className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{t('adminDashboard')}</h3>
                  <p className="text-white/90">
                    {language === 'en' ? 'Manage requests and approvals' : 'अनुरोध और अनुमोदन प्रबंधित करें'}
                  </p>
                </div>
              </div>
              <span className="text-4xl text-white">→</span>
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary" />
              {t('services')}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {language === 'en' ? 'Quick access to essential services' : 'आवश्यक सेवाओं तक त्वरित पहुंच'}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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