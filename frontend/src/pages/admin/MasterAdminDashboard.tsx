import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import DepartmentTabs from '@/components/admin/DepartmentTabs';
import RequestsQueue from '@/components/admin/RequestsQueue';
import { 
  Shield, FileText, Clock, CheckCircle2, AlertTriangle, 
  Users, TrendingUp, BarChart3, Settings, Bell, Megaphone
} from 'lucide-react';
import { mockDepartmentStats, getTotalStats } from '@/data/mockAdminData';
import type { Department, ServiceRequest } from '@/types/admin';
import { DEPARTMENT_LABELS } from '@/types/admin';

const MasterAdminDashboard: React.FC = () => {
  const { language, serviceRequests } = useApp();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'management'>('overview');

  const totalStats = useMemo(() => getTotalStats(), []);

  const filteredRequests = useMemo(() => {
    if (selectedDepartment === 'all') return serviceRequests;
    return serviceRequests.filter(r => r.department === selectedDepartment);
  }, [serviceRequests, selectedDepartment]);

  const handleViewRequest = (request: ServiceRequest) => {
    // Master admin can only view, not modify
    console.log('Viewing request:', request.ticketId);
  };

  return (
    <KioskLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'en' ? 'Master Admin Dashboard' : 'मुख्य व्यवस्थापक डैशबोर्ड'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'City-wide governance & monitoring' : 'शहर-व्यापी शासन और निगरानी'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </button>
            <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {(['overview', 'requests', 'management'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab === 'overview' ? (language === 'en' ? 'Overview' : 'अवलोकन') :
               tab === 'requests' ? (language === 'en' ? 'All Requests' : 'सभी अनुरोध') :
               (language === 'en' ? 'Management' : 'प्रबंधन')}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <AdminStatsCard
                title={language === 'en' ? 'Total Requests' : 'कुल अनुरोध'}
                value={totalStats.totalRequests}
                subtitle={language === 'en' ? 'This month' : 'इस महीने'}
                icon={FileText}
                variant="primary"
                trend={{ value: '+12%', positive: true }}
              />
              <AdminStatsCard
                title={language === 'en' ? 'Pending Approvals' : 'लंबित स्वीकृतियां'}
                value={totalStats.pendingRequests}
                subtitle={language === 'en' ? 'All departments' : 'सभी विभाग'}
                icon={Clock}
                variant="warning"
              />
              <AdminStatsCard
                title={language === 'en' ? 'Approved Today' : 'आज स्वीकृत'}
                value={totalStats.approvedToday}
                icon={CheckCircle2}
                variant="success"
              />
              <AdminStatsCard
                title={language === 'en' ? 'Avg. Processing' : 'औसत प्रसंस्करण'}
                value={totalStats.avgProcessingTime}
                icon={TrendingUp}
              />
            </div>

            {/* Department-wise Overview */}
            <h2 className="text-lg font-semibold mb-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              {language === 'en' ? 'Department-wise Workload' : 'विभाग-वार कार्यभार'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {mockDepartmentStats.map((stat) => (
                <div 
                  key={stat.department}
                  className="kiosk-card hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedDepartment(stat.department);
                    setActiveTab('requests');
                  }}
                >
                  <h3 className="font-semibold text-foreground mb-3">
                    {DEPARTMENT_LABELS[stat.department][language]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-warning">{stat.pendingRequests}</p>
                      <p className="text-muted-foreground text-xs">
                        {language === 'en' ? 'Pending' : 'लंबित'}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{stat.approvedToday}</p>
                      <p className="text-muted-foreground text-xs">
                        {language === 'en' ? 'Today' : 'आज'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    {language === 'en' ? 'Complaints:' : 'शिकायतें:'} {stat.complaintVolume}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions for Master Admin */}
            <h2 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Administration' : 'प्रशासन'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="kiosk-card hover:border-primary/30 transition-colors flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{language === 'en' ? 'Manage Admins' : 'व्यवस्थापक प्रबंधित करें'}</p>
                  <p className="text-xs text-muted-foreground">4 {language === 'en' ? 'active' : 'सक्रिय'}</p>
                </div>
              </button>
              <button className="kiosk-card hover:border-primary/30 transition-colors flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{language === 'en' ? 'Reports' : 'रिपोर्ट'}</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Analytics' : 'विश्लेषण'}</p>
                </div>
              </button>
              <button className="kiosk-card hover:border-primary/30 transition-colors flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{language === 'en' ? 'Services' : 'सेवाएं'}</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Enable/Disable' : 'सक्षम/अक्षम'}</p>
                </div>
              </button>
              <button className="kiosk-card hover:border-primary/30 transition-colors flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{language === 'en' ? 'Announcements' : 'घोषणाएं'}</p>
                  <p className="text-xs text-muted-foreground">{language === 'en' ? 'Kiosk notices' : 'कियोस्क सूचनाएं'}</p>
                </div>
              </button>
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {/* Department Filter */}
            <div className="mb-4 animate-slide-up">
              <DepartmentTabs
                stats={mockDepartmentStats}
                selectedDepartment={selectedDepartment}
                onSelect={setSelectedDepartment}
              />
            </div>

            {/* Requests List (Read-only for Master Admin) */}
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedDepartment === 'all' 
                    ? (language === 'en' ? 'All Requests' : 'सभी अनुरोध')
                    : DEPARTMENT_LABELS[selectedDepartment][language]
                  }
                  <span className="ml-2 text-muted-foreground font-normal">
                    ({filteredRequests.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  {language === 'en' ? 'Read-only view' : 'केवल देखें'}
                </div>
              </div>
              <RequestsQueue
                requests={filteredRequests}
                onViewRequest={handleViewRequest}
                showDepartment={selectedDepartment === 'all'}
              />
            </div>
          </>
        )}

        {activeTab === 'management' && (
          <div className="animate-slide-up">
            <div className="kiosk-card text-center py-12">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-xl text-muted-foreground">
                {language === 'en' ? 'Management controls coming soon' : 'प्रबंधन नियंत्रण जल्द आ रहे हैं'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'en' 
                  ? 'Create department admins, assign departments, manage services'
                  : 'विभाग व्यवस्थापक बनाएं, विभाग असाइन करें, सेवाएं प्रबंधित करें'}
              </p>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default MasterAdminDashboard;
