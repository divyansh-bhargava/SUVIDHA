import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import { Search, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const StatusTracking: React.FC = () => {
  const { t, language, getComplaintByTicketId } = useApp();
  const [ticketId, setTicketId] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<ReturnType<typeof getComplaintByTicketId>>(undefined);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const complaint = getComplaintByTicketId(ticketId);
    setSearchedTicket(complaint);
    setSearched(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-warning" />;
      case 'processing':
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
      case 'resolved':
        return <CheckCircle2 className="w-8 h-8 text-success" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Clock className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'resolved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('pending');
      case 'processing':
        return t('processing');
      case 'resolved':
        return t('resolved');
      case 'rejected':
        return t('rejected');
      default:
        return status;
    }
  };

  // Timeline steps
  const timelineSteps = [
    { key: 'submitted', labelEn: 'Submitted', labelHi: 'जमा किया गया' },
    { key: 'processing', labelEn: 'Processing', labelHi: 'प्रक्रियाधीन' },
    { key: 'resolved', labelEn: 'Resolved', labelHi: 'हल किया गया' },
  ];

  const getActiveStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'resolved':
        return 2;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <KioskLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('trackStatus')}</h1>
            <p className="text-lg text-muted-foreground">
              {language === 'en' ? 'Check your request status' : 'अपने अनुरोध की स्थिति जांचें'}
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="kiosk-card mb-8 animate-scale-in">
          <div className="mb-6">
            <label className="block text-lg font-medium text-foreground mb-3">
              {t('enterTicketId')}
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => {
                setTicketId(e.target.value.toUpperCase());
                setSearched(false);
              }}
              placeholder="TKT2024000001"
              className="kiosk-input"
              autoFocus
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!ticketId}
            className="kiosk-btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {t('checkStatus')}
          </button>

          {/* Demo hint */}
          <p className="mt-4 text-center text-muted-foreground text-sm">
            {language === 'en' 
              ? 'Try: TKT2024000001' 
              : 'प्रयास करें: TKT2024000001'}
          </p>
        </div>

        {/* Results */}
        {searched && (
          <div className="animate-slide-up">
            {searchedTicket ? (
              <div className="kiosk-card">
                {/* Status Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  {getStatusIcon(searchedTicket.status)}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t('currentStatus')}</p>
                    <span className={getStatusClass(searchedTicket.status)}>
                      {getStatusLabel(searchedTicket.status)}
                    </span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="py-6 space-y-4 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Ticket ID' : 'टिकट ID'}
                    </span>
                    <span className="font-mono font-semibold">{searchedTicket.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Department' : 'विभाग'}
                    </span>
                    <span className="font-medium capitalize">{searchedTicket.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('complaintType')}</span>
                    <span className="font-medium">{searchedTicket.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Date Filed' : 'दर्ज तिथि'}
                    </span>
                    <span className="font-medium">{searchedTicket.createdAt}</span>
                  </div>
                </div>

                {/* Timeline */}
                {searchedTicket.status !== 'rejected' && (
                  <div className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'en' ? 'Progress' : 'प्रगति'}
                    </p>
                    <div className="flex justify-between relative">
                      {/* Progress line */}
                      <div className="absolute top-4 left-0 right-0 h-1 bg-muted">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${(getActiveStep(searchedTicket.status) / 2) * 100}%` }}
                        />
                      </div>
                      
                      {timelineSteps.map((step, index) => {
                        const isActive = index <= getActiveStep(searchedTicket.status);
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {isActive ? '✓' : index + 1}
                            </div>
                            <span className={`mt-2 text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {language === 'en' ? step.labelEn : step.labelHi}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rejected message */}
                {searchedTicket.status === 'rejected' && (
                  <div className="pt-6">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                      <p className="text-destructive font-medium">
                        {language === 'en' 
                          ? 'This request has been rejected. Please contact the department for more details.'
                          : 'यह अनुरोध अस्वीकृत हो गया है। अधिक जानकारी के लिए कृपया विभाग से संपर्क करें।'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="kiosk-card text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {language === 'en' ? 'No Results Found' : 'कोई परिणाम नहीं मिला'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? 'Please check the ticket ID and try again'
                    : 'कृपया टिकट ID जांचें और पुनः प्रयास करें'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default StatusTracking;
