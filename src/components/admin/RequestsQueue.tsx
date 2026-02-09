import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { FileText, Eye, CheckCircle2, XCircle, AlertTriangle, Clock, CheckCheck } from 'lucide-react';
import type { ServiceRequest, Department } from '@/types/admin';
import { DEPARTMENT_LABELS } from '@/types/admin';

interface RequestsQueueProps {
  requests: ServiceRequest[];
  onViewRequest: (request: ServiceRequest) => void;
  onApprove?: (request: ServiceRequest) => void;
  onReject?: (request: ServiceRequest) => void;
  showDepartment?: boolean;
  compact?: boolean;
}

const RequestsQueue: React.FC<RequestsQueueProps> = ({
  requests,
  onViewRequest,
  onApprove,
  onReject,
  showDepartment = false,
  compact = false,
}) => {
  const { language, t } = useApp();

  const getAIStatusIcon = (status: ServiceRequest['aiCheckResult']['overallStatus']) => {
    switch (status) {
      case 'passed':
        return <CheckCheck className="w-4 h-4 text-success" />;
      case 'needs_review':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getAIStatusLabel = (status: ServiceRequest['aiCheckResult']['overallStatus']) => {
    const labels = {
      passed: { en: 'AI Passed', hi: 'AI पास' },
      needs_review: { en: 'Needs Review', hi: 'समीक्षा आवश्यक' },
      failed: { en: 'AI Failed', hi: 'AI असफल' },
    };
    return labels[status][language];
  };

  const getStatusBadge = (status: ServiceRequest['status']) => {
    const styles: Record<string, string> = {
      pending: 'status-pending',
      processing: 'status-processing',
      approved: 'status-approved',
      rejected: 'status-rejected',
      needs_correction: 'bg-warning/20 text-warning',
    };
    return styles[status] || 'status-pending';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (requests.length === 0) {
    return (
      <div className="kiosk-card text-center py-12">
        <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-xl text-muted-foreground">
          {language === 'en' ? 'No requests found' : 'कोई अनुरोध नहीं मिला'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div 
          key={request.id}
          className={`kiosk-card hover:border-primary/30 transition-colors cursor-pointer ${compact ? 'p-4' : ''}`}
          onClick={() => onViewRequest(request)}
        >
          <div className="flex items-start gap-4">
            {/* Request Icon */}
            <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-kiosk-icon-bg flex items-center justify-center flex-shrink-0`}>
              <FileText className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
            </div>

            {/* Request Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <h3 className={`font-semibold text-foreground ${compact ? 'text-sm' : ''}`}>
                    {request.ticketId}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {request.serviceType}
                  </p>
                </div>
                <span className={getStatusBadge(request.status)}>
                  {t(request.status)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {request.citizenName} • {request.suvidhaId}
              </p>

              {!compact && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
                  {request.description}
                </p>
              )}

              <div className="flex items-center flex-wrap gap-3 text-xs">
                {showDepartment && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {DEPARTMENT_LABELS[request.department][language]}
                  </span>
                )}
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  request.aiCheckResult.overallStatus === 'passed' ? 'bg-success/10' :
                  request.aiCheckResult.overallStatus === 'needs_review' ? 'bg-warning/10' :
                  'bg-destructive/10'
                }`}>
                  {getAIStatusIcon(request.aiCheckResult.overallStatus)}
                  {getAIStatusLabel(request.aiCheckResult.overallStatus)}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(request.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onViewRequest(request)}
                className="kiosk-btn-secondary py-2 px-3 min-h-0 min-w-0"
                title={language === 'en' ? 'View Details' : 'विवरण देखें'}
              >
                <Eye className="w-5 h-5" />
              </button>
              {(request.status === 'pending' || request.status === 'processing') && onApprove && onReject && (
                <>
                  <button 
                    onClick={() => onApprove(request)}
                    className="kiosk-btn-success py-2 px-3 min-h-0 min-w-0"
                    title={t('approve')}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onReject(request)}
                    className="kiosk-btn bg-destructive text-destructive-foreground py-2 px-3 min-h-0 min-w-0"
                    title={t('reject')}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestsQueue;
