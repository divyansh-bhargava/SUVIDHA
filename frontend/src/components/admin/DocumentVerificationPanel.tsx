import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  FileText, CheckCircle2, XCircle, AlertTriangle, 
  ZoomIn, ZoomOut, RotateCw, Download, Eye,
  CheckCheck, X, ScrollText, ChevronDown
} from 'lucide-react';
import type { ServiceRequest, RequestDocument } from '@/types/admin';

interface DocumentVerificationPanelProps {
  request: ServiceRequest;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
  onClose: () => void;
}

const DocumentVerificationPanel: React.FC<DocumentVerificationPanelProps> = ({
  request,
  onApprove,
  onReject,
  onClose,
}) => {
  const { language, t } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<RequestDocument | null>(
    request.documents[0] || null
  );
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  
  // Track which documents have been viewed
  const [viewedDocs, setViewedDocs] = useState<Set<string>>(new Set());
  const [hasScrolledContent, setHasScrolledContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const allDocsViewed = request.documents.length === 0 || 
    request.documents.every(doc => viewedDocs.has(doc.id));
  
  const canApprove = allDocsViewed && hasScrolledContent && decision === 'approve';
  const canReject = decision === 'reject' && remarks.trim().length > 0;

  // Mark document as viewed when selected
  useEffect(() => {
    if (selectedDoc) {
      setViewedDocs(prev => new Set([...prev, selectedDoc.id]));
    }
  }, [selectedDoc]);

  // Track scroll to bottom of document viewer
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolledContent(true);
    }
  };

  const getAIStatusColor = (status: RequestDocument['aiStatus']) => {
    switch (status) {
      case 'passed': return 'text-success bg-success/10 border-success/20';
      case 'needs_review': return 'text-warning bg-warning/10 border-warning/20';
      case 'failed': return 'text-destructive bg-destructive/10 border-destructive/20';
    }
  };

  const getAIStatusIcon = (status: RequestDocument['aiStatus']) => {
    switch (status) {
      case 'passed': return <CheckCheck className="w-4 h-4" />;
      case 'needs_review': return <AlertTriangle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
    }
  };

  const handleSubmit = () => {
    if (decision === 'approve' && canApprove) {
      onApprove(remarks);
    } else if (decision === 'reject' && canReject) {
      onReject(remarks);
    }
  };

  const unviewedCount = request.documents.filter(d => !viewedDocs.has(d.id)).length;

  return (
    <div className="kiosk-modal" onClick={onClose}>
      <div 
        className="bg-card rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{request.ticketId}</h2>
              <p className="text-sm text-muted-foreground">{request.serviceType} • {request.citizenName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border">
              {allDocsViewed ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              <span className="text-sm font-medium">
                {allDocsViewed 
                  ? (language === 'en' ? 'All reviewed' : 'सभी समीक्षित')
                  : (language === 'en' ? `${unviewedCount} unread` : `${unviewedCount} अपठित`)}
              </span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-180px)]">
          {/* Left: Document List */}
          <div className="w-72 border-r border-border p-4 overflow-y-auto bg-muted/20">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === 'en' ? 'Documents' : 'दस्तावेज़'}
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {request.documents.length}
              </span>
            </h3>
            
            {request.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-4 text-center bg-background rounded-xl">
                {language === 'en' ? 'No documents submitted' : 'कोई दस्तावेज़ नहीं'}
              </p>
            ) : (
              <div className="space-y-2">
                {request.documents.map((doc) => {
                  const isViewed = viewedDocs.has(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full p-3 rounded-xl text-left transition-all relative ${
                        selectedDoc?.id === doc.id 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-background border-2 border-transparent hover:border-border'
                      }`}
                    >
                      {/* Unread indicator */}
                      {!isViewed && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse" />
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText className={`w-4 h-4 ${isViewed ? 'text-muted-foreground' : 'text-primary'}`} />
                        <span className="font-medium text-sm truncate">{doc.name}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${getAIStatusColor(doc.aiStatus)}`}>
                        {getAIStatusIcon(doc.aiStatus)}
                        {doc.aiStatus === 'passed' ? (language === 'en' ? 'AI Passed' : 'AI पास') :
                         doc.aiStatus === 'needs_review' ? (language === 'en' ? 'Review' : 'समीक्षा') :
                         (language === 'en' ? 'Failed' : 'असफल')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Pre-Check Summary */}
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {language === 'en' ? 'AI Pre-Check' : 'AI पूर्व-जांच'}
              </h3>
              <div className="p-3 bg-warning/5 border border-warning/20 rounded-xl mb-3">
                <p className="text-xs text-warning flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {language === 'en' 
                    ? 'AI suggestions only - Staff decision is final' 
                    : 'केवल AI सुझाव - स्टाफ का निर्णय अंतिम है'}
                </p>
              </div>
              <div className="space-y-2">
                {request.aiCheckResult.checks.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-background">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <span className={check.passed ? 'text-foreground' : 'text-destructive'}>
                      {check.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Document Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Viewer Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoom(z => Math.max(50, z - 25))}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium w-14 text-center bg-muted px-2 py-1 rounded">{zoom}%</span>
                <button 
                  onClick={() => setZoom(z => Math.min(200, z + 25))}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button 
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scroll hint */}
              {!hasScrolledContent && selectedDoc && (
                <div className="flex items-center gap-2 text-warning text-sm animate-pulse">
                  <ChevronDown className="w-4 h-4" />
                  <span>{language === 'en' ? 'Scroll to review full document' : 'पूर्ण दस्तावेज़ देखने के लिए स्क्रॉल करें'}</span>
                </div>
              )}
            </div>

            {/* Document Preview Area */}
            <div 
              ref={contentRef}
              onScroll={handleContentScroll}
              className="flex-1 overflow-auto p-6 bg-muted/10"
            >
              {selectedDoc ? (
                <div 
                  className="bg-card rounded-2xl shadow-lg mx-auto max-w-2xl"
                  style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Mock document preview - Extended content for scroll */}
                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="bg-primary/5 p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">{selectedDoc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedDoc.type.toUpperCase()} • {language === 'en' ? 'Uploaded by citizen' : 'नागरिक द्वारा अपलोड'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 space-y-6">
                      {/* Simulated document content - tall content to require scrolling */}
                      <div className="aspect-[4/5] bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                          <Eye className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p className="text-muted-foreground">
                            {language === 'en' ? 'Document Preview Area' : 'दस्तावेज़ पूर्वावलोकन क्षेत्र'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Extended content section */}
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="font-semibold text-foreground">
                          {language === 'en' ? 'Document Details' : 'दस्तावेज़ विवरण'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground text-xs mb-1">Document Type</p>
                            <p className="font-medium">{selectedDoc.type}</p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground text-xs mb-1">Format</p>
                            <p className="font-medium">{selectedDoc.type.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Checks for this document */}
                      <div className="p-4 bg-muted/30 rounded-xl border border-border">
                        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-primary" />
                          {language === 'en' ? 'AI Verification Checks:' : 'AI सत्यापन जांच:'}
                        </p>
                        <div className="space-y-2">
                          {selectedDoc.aiChecks.map((check, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                              {check.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <span className="text-sm">{check.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* End of document marker */}
                      <div className="text-center py-4 border-t border-dashed border-border">
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? '— End of Document —' : '— दस्तावेज़ समाप्त —'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{language === 'en' ? 'Select a document to view' : 'देखने के लिए दस्तावेज़ चुनें'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Decision Panel */}
          <div className="w-80 border-l border-border p-4 overflow-y-auto bg-muted/20">
            {/* Request Details */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {language === 'en' ? 'Request Details' : 'अनुरोध विवरण'}
              </h3>
              <div className="space-y-3 text-sm bg-background p-4 rounded-xl border border-border">
                <div>
                  <p className="text-muted-foreground text-xs">{language === 'en' ? 'Citizen' : 'नागरिक'}</p>
                  <p className="font-medium">{request.citizenName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{request.suvidhaId}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs">{language === 'en' ? 'Service' : 'सेवा'}</p>
                  <p className="font-medium">{request.serviceType}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-muted-foreground text-xs">{t('description')}</p>
                  <p className="text-foreground">{request.description}</p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="mb-6 p-4 bg-background rounded-xl border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {language === 'en' ? 'Before Approval' : 'अनुमोदन से पहले'}
              </h3>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${allDocsViewed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {allDocsViewed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                  <span>{language === 'en' ? 'All documents reviewed' : 'सभी दस्तावेज़ समीक्षित'}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${hasScrolledContent ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {hasScrolledContent ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                  <span>{language === 'en' ? 'Full content viewed' : 'पूर्ण सामग्री देखी गई'}</span>
                </div>
              </div>
            </div>

            {/* Staff Decision */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {language === 'en' ? 'Your Decision' : 'आपका निर्णय'}
              </h3>

              <div className="space-y-3 mb-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  decision === 'approve' 
                    ? 'border-success bg-success/5' 
                    : 'border-border hover:border-success/50 bg-background'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={decision === 'approve'}
                    onChange={() => setDecision('approve')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'approve' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{t('approve')}</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  decision === 'reject' 
                    ? 'border-destructive bg-destructive/5' 
                    : 'border-border hover:border-destructive/50 bg-background'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === 'reject'}
                    onChange={() => setDecision('reject')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${decision === 'reject' ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{t('reject')}</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  {t('remarks')} {decision === 'reject' && <span className="text-destructive">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={language === 'en' ? 'Add remarks for the citizen...' : 'नागरिक के लिए टिप्पणी जोड़ें...'}
                  className="w-full min-h-[100px] p-4 rounded-xl border-2 border-input bg-background resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={decision === 'approve' ? !canApprove : !canReject}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  decision === 'approve' && canApprove
                    ? 'bg-success text-success-foreground hover:brightness-110'
                    : decision === 'reject' && canReject
                    ? 'bg-destructive text-destructive-foreground hover:brightness-110'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {decision === 'approve' && !canApprove 
                  ? (language === 'en' ? 'Review all documents first' : 'पहले सभी दस्तावेज़ देखें')
                  : (language === 'en' ? 'Submit Decision' : 'निर्णय जमा करें')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationPanel;
