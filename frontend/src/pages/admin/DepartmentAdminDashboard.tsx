import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import RequestsQueue from '@/components/admin/RequestsQueue';
import DocumentVerificationPanel from '@/components/admin/DocumentVerificationPanel';
import { 
  Building2, FileText, Clock, CheckCircle2, AlertTriangle, 
  ClipboardList, FileCheck, MessageSquare, Filter
} from 'lucide-react';
import { getStatsByDepartment } from '@/data/mockAdminData';
import type { ServiceRequest } from '@/types/admin';
import { DEPARTMENT_LABELS } from '@/types/admin';

const DepartmentAdminDashboard: React.FC = () => {
  const { language, adminUser, adminDepartment, serviceRequests, updateRequestStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'verification' | 'complaints'>('queue');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing'>('all');
  const [aiFilter, setAiFilter] = useState<'all' | 'passed' | 'needs_review' | 'failed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const departmentStats = useMemo(() => {
    return adminDepartment ? getStatsByDepartment(adminDepartment) : null;
  }, [adminDepartment]);

  const departmentRequests = useMemo(() => {
    if (!adminDepartment) return [];
    return serviceRequests.filter(r => r.department === adminDepartment);
  }, [serviceRequests, adminDepartment]);

  const filteredRequests = useMemo(() => {
    return departmentRequests.filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (aiFilter !== 'all' && req.aiCheckResult.overallStatus !== aiFilter) return false;
      return true;
    });
  }, [departmentRequests, statusFilter, aiFilter]);

  const pendingVerificationRequests = useMemo(() => {
    return departmentRequests.filter(r => 
      r.documents.length > 0 && 
      (r.status === 'pending' || r.status === 'processing')
    ).sort((a, b) => {
      // Prioritize failed/needs_review first
      const priority = { failed: 0, needs_review: 1, passed: 2 };
      return priority[a.aiCheckResult.overallStatus] - priority[b.aiCheckResult.overallStatus];
    });
  }, [departmentRequests]);

  const complaints = useMemo(() => {
    return departmentRequests.filter(r => 
      r.serviceType.toLowerCase().includes('complaint') ||
      r.serviceType.toLowerCase().includes('issue') ||
      r.serviceType.toLowerCase().includes('outage')
    );
  }, [departmentRequests]);

  const handleApprove = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const handleReject = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const handleDecisionSubmit = (status: 'approved' | 'rejected', remarks: string) => {
    if (selectedRequest) {
      updateRequestStatus(selectedRequest.id, status, remarks);
      setSelectedRequest(null);
    }
  };

  if (!adminDepartment) {
    return (
      <KioskLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No department assigned</p>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {DEPARTMENT_LABELS[adminDepartment][language]} {language === 'en' ? 'Department' : 'विभाग'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' ? adminUser?.name : adminUser?.nameHi}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-2xl font-bold text-warning">{departmentStats?.pendingRequests || 0}</p>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'Pending' : 'लंबित'}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-2xl font-bold text-destructive">{departmentStats?.pendingDocs || 0}</p>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'Docs' : 'दस्तावेज़'}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-success/10 border border-success/20">
              <p className="text-2xl font-bold text-success">{departmentStats?.approvedToday || 0}</p>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'Today' : 'आज'}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <AdminStatsCard
            title={language === 'en' ? 'Total Requests' : 'कुल अनुरोध'}
            value={departmentStats?.totalRequests || 0}
            subtitle={language === 'en' ? 'This month' : 'इस महीने'}
            icon={FileText}
            variant="primary"
          />
          <AdminStatsCard
            title={language === 'en' ? 'Pending Review' : 'समीक्षा लंबित'}
            value={departmentStats?.pendingRequests || 0}
            icon={Clock}
            variant="warning"
          />
          <AdminStatsCard
            title={language === 'en' ? 'Doc Verification' : 'दस्तावेज़ सत्यापन'}
            value={departmentStats?.pendingDocs || 0}
            icon={FileCheck}
            variant="danger"
          />
          <AdminStatsCard
            title={language === 'en' ? 'Avg. Time' : 'औसत समय'}
            value={departmentStats?.avgProcessingTime || '-'}
            icon={CheckCircle2}
          />
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'queue'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            {language === 'en' ? 'Requests Queue' : 'अनुरोध कतार'}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
              {departmentRequests.filter(r => r.status === 'pending' || r.status === 'processing').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            {language === 'en' ? 'Document Verification' : 'दस्तावेज़ सत्यापन'}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
              {pendingVerificationRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'complaints'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {language === 'en' ? 'Complaints' : 'शिकायतें'}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
              {complaints.length}
            </span>
          </button>
        </div>

        {activeTab === 'queue' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{language === 'en' ? 'Status:' : 'स्थिति:'}</span>
                {(['all', 'pending', 'processing'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {status === 'all' ? (language === 'en' ? 'All' : 'सभी') :
                     status === 'pending' ? (language === 'en' ? 'Pending' : 'लंबित') :
                     (language === 'en' ? 'Processing' : 'प्रक्रियाधीन')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{language === 'en' ? 'AI Check:' : 'AI जांच:'}</span>
                {(['all', 'failed', 'needs_review', 'passed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setAiFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      aiFilter === status
                        ? status === 'failed' ? 'bg-destructive text-destructive-foreground' :
                          status === 'needs_review' ? 'bg-warning text-warning-foreground' :
                          status === 'passed' ? 'bg-success text-success-foreground' :
                          'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {status === 'all' ? (language === 'en' ? 'All' : 'सभी') :
                     status === 'failed' ? (language === 'en' ? 'Failed' : 'असफल') :
                     status === 'needs_review' ? (language === 'en' ? 'Review' : 'समीक्षा') :
                     (language === 'en' ? 'Passed' : 'पास')}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <RequestsQueue
                requests={filteredRequests}
                onViewRequest={setSelectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          </>
        )}

        {activeTab === 'verification' && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm text-warning">
                {language === 'en' 
                  ? 'Sorted by priority: AI Failed → Needs Review → Passed. Oldest first.'
                  : 'प्राथमिकता के अनुसार: AI असफल → समीक्षा आवश्यक → पास। पुराना पहले।'}
              </p>
            </div>
            <RequestsQueue
              requests={pendingVerificationRequests}
              onViewRequest={setSelectedRequest}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="animate-slide-up">
            <RequestsQueue
              requests={complaints}
              onViewRequest={setSelectedRequest}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}

        {/* Document Verification Modal */}
        {selectedRequest && (
          <DocumentVerificationPanel
            request={selectedRequest}
            onApprove={(remarks) => handleDecisionSubmit('approved', remarks)}
            onReject={(remarks) => handleDecisionSubmit('rejected', remarks)}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </div>
    </KioskLayout>
  );
};

export default DepartmentAdminDashboard;
