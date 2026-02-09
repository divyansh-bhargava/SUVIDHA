import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { FileText, CheckCircle2, AlertCircle, Clock, Upload, QrCode, RefreshCw, Check, X, Eye, Loader2 } from 'lucide-react';

interface DocumentRequirement {
  id: string;
  name: string;
  nameHi: string;
  type: string;
  required: boolean;
}

interface SelectedDocument {
  requirementId: string;
  documentId?: string;
  isNew: boolean;
  file?: File;
  preCheckStatus?: 'checking' | 'valid' | 'invalid' | 'blur' | 'format_error';
  preCheckMessage?: string;
}

interface DocumentSelectorProps {
  requirements: DocumentRequirement[];
  selectedDocuments: SelectedDocument[];
  onDocumentSelect: (requirementId: string, documentId: string) => void;
  onNewDocumentUpload: (requirementId: string, file: File) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  requirements,
  selectedDocuments,
  onDocumentSelect,
  onNewDocumentUpload,
  onConfirm,
  onBack,
}) => {
  const { t, language, citizen } = useApp();
  const [showQrUpload, setShowQrUpload] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  if (!citizen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'invalid':
      case 'blur':
      case 'format_error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
      case 'checking':
        return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return language === 'en' ? 'Valid' : 'वैध';
      case 'invalid':
        return language === 'en' ? 'Invalid' : 'अवैध';
      case 'blur':
        return language === 'en' ? 'Image Blurry' : 'छवि धुंधली';
      case 'format_error':
        return language === 'en' ? 'Wrong Format' : 'गलत प्रारूप';
      case 'pending':
        return language === 'en' ? 'Pending' : 'लंबित';
      case 'checking':
        return language === 'en' ? 'Checking...' : 'जांच रहा है...';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success/10 text-success border-success/30';
      case 'invalid':
      case 'blur':
      case 'format_error':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'pending':
      case 'checking':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const matchingDocuments = (requirement: DocumentRequirement) => {
    return citizen.documents.filter(doc => doc.type === requirement.type);
  };

  const getSelectedDoc = (requirementId: string) => {
    return selectedDocuments.find(sd => sd.requirementId === requirementId);
  };

  const simulateFileUpload = (requirementId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onNewDocumentUpload(requirementId, file);
    }
  };

  const allRequiredSelected = requirements
    .filter(r => r.required)
    .every(r => {
      const selected = getSelectedDoc(r.id);
      return selected && (selected.documentId || selected.file) && selected.preCheckStatus === 'valid';
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="kiosk-card bg-accent/5 border-accent/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {language === 'en' ? 'Required Documents' : 'आवश्यक दस्तावेज़'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Select from saved documents or upload new ones via QR'
                : 'सहेजे गए दस्तावेज़ों में से चुनें या QR के माध्यम से नए अपलोड करें'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Pre-Check Info */}
      <div className="kiosk-card bg-primary/5 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {language === 'en' ? 'AI Pre-Check Active' : 'AI पूर्व-जांच सक्रिय'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Documents will be automatically checked for: Format (PDF/JPG), Clarity (not blurry), Completeness'
                : 'दस्तावेज़ों की स्वचालित जांच: प्रारूप (PDF/JPG), स्पष्टता (धुंधला नहीं), पूर्णता'}
            </p>
          </div>
        </div>
      </div>

      {/* Document Requirements List */}
      <div className="space-y-4">
        {requirements.map((requirement) => {
          const savedDocs = matchingDocuments(requirement);
          const selected = getSelectedDoc(requirement.id);

          return (
            <div key={requirement.id} className="kiosk-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {language === 'en' ? requirement.name : requirement.nameHi}
                    </h4>
                    {requirement.required && (
                      <span className="text-xs text-destructive">
                        {language === 'en' ? '* Required' : '* आवश्यक'}
                      </span>
                    )}
                  </div>
                </div>
                
                {selected?.preCheckStatus && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusClass(selected.preCheckStatus)}`}>
                    {getStatusIcon(selected.preCheckStatus)}
                    <span className="text-sm font-medium">{getStatusLabel(selected.preCheckStatus)}</span>
                  </div>
                )}
              </div>

              {/* Saved Documents */}
              {savedDocs.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'en' ? 'Previously Uploaded:' : 'पहले अपलोड किया गया:'}
                  </p>
                  <div className="space-y-2">
                    {savedDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => onDocumentSelect(requirement.id, doc.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selected?.documentId === doc.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selected?.documentId === doc.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selected?.documentId === doc.id && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Uploaded:' : 'अपलोड:'} {doc.uploadDate}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/30">
                          {language === 'en' ? 'Saved' : 'सहेजा गया'}
                        </span>
                        {doc.status === 'valid' && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Options */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQrUpload(requirement.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <QrCode className="w-6 h-6 text-primary" />
                  <span className="font-medium text-primary">
                    {language === 'en' ? 'Scan QR to Upload' : 'अपलोड के लिए QR स्कैन करें'}
                  </span>
                </button>
                
                <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-accent/30 hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-accent" />
                  <span className="font-medium text-accent">
                    {language === 'en' ? 'Upload New' : 'नया अपलोड करें'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => simulateFileUpload(requirement.id, e)}
                  />
                </label>
              </div>

              {/* New file selected */}
              {selected?.isNew && selected.file && (
                <div className="mt-4 p-3 rounded-xl bg-muted flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{selected.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' ? 'New upload' : 'नया अपलोड'}
                    </p>
                  </div>
                  {selected.preCheckStatus && getStatusIcon(selected.preCheckStatus)}
                </div>
              )}

              {/* Pre-check error message */}
              {selected?.preCheckStatus && ['invalid', 'blur', 'format_error'].includes(selected.preCheckStatus) && (
                <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      {selected.preCheckMessage || (language === 'en' ? 'Document validation failed' : 'दस्तावेज़ सत्यापन विफल')}
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {language === 'en' 
                        ? 'Please upload a clear, valid document in PDF or JPG format'
                        : 'कृपया PDF या JPG प्रारूप में एक स्पष्ट, वैध दस्तावेज़ अपलोड करें'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QR Upload Modal */}
      {showQrUpload && (
        <div className="kiosk-modal" onClick={() => setShowQrUpload(null)}>
          <div 
            className="kiosk-modal-content max-w-md text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {language === 'en' ? 'Scan QR to Upload' : 'अपलोड के लिए QR स्कैन करें'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'Scan this QR with your phone to upload document'
                : 'दस्तावेज़ अपलोड करने के लिए अपने फोन से इस QR को स्कैन करें'}
            </p>
            
            <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-2xl p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/30">
                <QrCode className="w-24 h-24 text-primary" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {language === 'en' 
                ? 'After scanning, upload the document from your phone'
                : 'स्कैन करने के बाद, अपने फोन से दस्तावेज़ अपलोड करें'}
            </p>

            <button
              onClick={() => setShowQrUpload(null)}
              className="kiosk-btn-secondary w-full"
            >
              {t('back')}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button onClick={onBack} className="kiosk-btn-ghost flex-1">
          {t('back')}
        </button>
        <button 
          onClick={onConfirm} 
          disabled={!allRequiredSelected}
          className={`flex-1 ${allRequiredSelected ? 'kiosk-btn-primary' : 'kiosk-btn-secondary opacity-50 cursor-not-allowed'}`}
        >
          {language === 'en' ? 'Continue' : 'जारी रखें'}
        </button>
      </div>
    </div>
  );
};

export default DocumentSelector;
