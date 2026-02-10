import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import { Search, Clock, CheckCircle2, XCircle, Loader2, FileText, Building2, Calendar, ArrowRight, AlertCircle, Phone, HelpCircle } from 'lucide-react';

// Department-specific theming
const getDeptGradient = (dept: string): string => {
  const d = dept?.toLowerCase() || '';
  if (d.includes('electric')) return 'from-amber-500 to-orange-500';
  if (d.includes('water')) return 'from-blue-500 to-cyan-500';
  if (d.includes('gas')) return 'from-red-500 to-rose-500';
  if (d.includes('road') || d.includes('transport')) return 'from-slate-500 to-gray-600';
  if (d.includes('sanit')) return 'from-green-500 to-emerald-500';
  return 'from-primary to-primary/80';
};

const getDeptEmoji = (dept: string): string => {
  const d = dept?.toLowerCase() || '';
  if (d.includes('electric')) return '⚡';
  if (d.includes('water')) return '💧';
  if (d.includes('gas')) return '🔥';
  if (d.includes('road') || d.includes('transport')) return '🛣️';
  if (d.includes('sanit')) return '🧹';
  return '📋';
};

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
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{t('trackStatus')}</h1>
              <p className="text-white/80">
                {language === 'en' ? 'Check your request status' : 'अपने अनुरोध की स्थिति जांचें'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="kiosk-card mb-8 animate-scale-in border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <div className="mb-6">
            <label className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('enterTicketId')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => {
                  setTicketId(e.target.value.toUpperCase());
                  setSearched(false);
                }}
                placeholder="TKT2024000001"
                className="kiosk-input text-xl font-mono h-[72px] pl-6 pr-16 tracking-wider"
                autoFocus
              />
              {ticketId && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!ticketId}
            className="kiosk-btn-primary w-full flex items-center justify-center gap-3 py-5 text-xl disabled:opacity-50 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100"
          >
            <Search className="w-6 h-6" />
            {t('checkStatus')}
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Demo hint */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-center text-blue-700 dark:text-blue-400 text-sm flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {language === 'en' 
                ? 'Demo: Try TKT2024000001' 
                : 'डेमो: TKT2024000001 आज़माएं'}
            </p>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="animate-slide-up">
            {searchedTicket ? (
              <div className="space-y-6">
                {/* Department Header Banner */}
                <div className={`bg-gradient-to-r ${getDeptGradient(searchedTicket.department)} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">
                      {getDeptEmoji(searchedTicket.department)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
                        {language === 'en' ? 'Department' : 'विभाग'}
                      </p>
                      <h3 className="text-xl font-bold capitalize">{searchedTicket.department}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-xs">{language === 'en' ? 'Ticket' : 'टिकट'}</p>
                      <p className="font-mono font-bold text-lg">{searchedTicket.ticketId}</p>
                    </div>
                  </div>
                </div>

                <div className="kiosk-card">
                  {/* Status Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      searchedTicket.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      searchedTicket.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      searchedTicket.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {getStatusIcon(searchedTicket.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{t('currentStatus')}</p>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                        searchedTicket.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' :
                        searchedTicket.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                        searchedTicket.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {getStatusLabel(searchedTicket.status)}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="py-6 space-y-4 border-b border-border">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('complaintType')}
                      </span>
                      <span className="font-semibold text-foreground">{searchedTicket.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {language === 'en' ? 'Date Filed' : 'दर्ज तिथि'}
                      </span>
                      <span className="font-semibold text-foreground">{searchedTicket.createdAt}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  {searchedTicket.status !== 'rejected' && (
                    <div className="pt-6">
                      <p className="text-sm font-semibold text-muted-foreground mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {language === 'en' ? 'Progress Timeline' : 'प्रगति समयरेखा'}
                      </p>
                      <div className="flex justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-5 left-0 right-0 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700"
                            style={{ width: `${(getActiveStep(searchedTicket.status) / 2) * 100}%` }}
                          />
                        </div>
                        
                        {timelineSteps.map((step, index) => {
                          const isActive = index <= getActiveStep(searchedTicket.status);
                          const isCurrent = index === getActiveStep(searchedTicket.status);
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive 
                                  ? 'bg-gradient-to-br from-primary to-green-500 text-white shadow-lg shadow-primary/30' 
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                                {isActive ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-lg font-bold">{index + 1}</span>}
                              </div>
                              <span className={`mt-3 text-sm text-center ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
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
                      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                              {language === 'en' ? 'Request Rejected' : 'अनुरोध अस्वीकृत'}
                            </p>
                            <p className="text-red-600 dark:text-red-400">
                              {language === 'en' 
                                ? 'Please contact the department for more details.'
                                : 'अधिक जानकारी के लिए कृपया विभाग से संपर्क करें।'}
                            </p>
                            <button className="mt-3 inline-flex items-center gap-2 text-red-700 dark:text-red-400 font-medium hover:underline">
                              <Phone className="w-4 h-4" />
                              {language === 'en' ? 'Contact Support' : 'सहायता से संपर्क करें'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="kiosk-card text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {language === 'en' ? 'No Results Found' : 'कोई परिणाम नहीं मिला'}
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'Please check the ticket ID and try again'
                    : 'कृपया टिकट ID जांचें और पुनः प्रयास करें'}
                </p>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 inline-block">
                  <p className="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {language === 'en' ? 'Sample format: TKT2024000001' : 'नमूना प्रारूप: TKT2024000001'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default StatusTracking;
