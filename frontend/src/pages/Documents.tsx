import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import { FolderOpen, FileText, CheckCircle2, AlertCircle, Clock, Upload, RefreshCw, Eye } from 'lucide-react';

const Documents: React.FC = () => {
  const { t, language, citizen } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  if (!citizen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'invalid':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
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
      case 'pending':
        return language === 'en' ? 'Pending Review' : 'समीक्षाधीन';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success/10 text-success border-success/30';
      case 'invalid':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <KioskLayout>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('documents')}</h1>
            <p className="text-lg text-muted-foreground">
              {language === 'en' ? 'Your uploaded documents' : 'आपके अपलोड किए गए दस्तावेज़'}
            </p>
          </div>
        </div>

        {/* AI Pre-Check Info */}
        <div className="kiosk-card mb-6 bg-accent/5 border-accent/30 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {language === 'en' ? 'AI Pre-Check' : 'AI पूर्व-जांच'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Documents are automatically verified for validity and completeness'
                  : 'दस्तावेज़ स्वचालित रूप से वैधता और पूर्णता के लिए सत्यापित होते हैं'}
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {citizen.documents.map((doc) => (
            <div 
              key={doc.id}
              className="kiosk-card flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-kiosk-icon-bg flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Uploaded:' : 'अपलोड:'} {doc.uploadDate}
                </p>
              </div>

              {/* AI Check Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusClass(doc.status)}`}>
                {getStatusIcon(doc.status)}
                <span className="text-sm font-medium">{getStatusLabel(doc.status)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedDoc(doc.id)}
                  className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  title={language === 'en' ? 'View' : 'देखें'}
                >
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </button>
                <button 
                  className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  title={language === 'en' ? 'Replace' : 'बदलें'}
                >
                  <RefreshCw className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload New Document */}
        <button className="w-full mt-6 kiosk-card border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-4 py-8 cursor-pointer animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Upload className="w-8 h-8 text-primary" />
          <span className="text-xl font-medium text-primary">{t('uploadNew')}</span>
        </button>

        {/* Document Preview Modal */}
        {selectedDoc && (
          <div className="kiosk-modal" onClick={() => setSelectedDoc(null)}>
            <div 
              className="kiosk-modal-content max-w-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {citizen.documents.find(d => d.id === selectedDoc)?.name}
                </h3>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Document preview placeholder */}
              <div className="aspect-[3/4] bg-muted rounded-xl flex items-center justify-center mb-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{language === 'en' ? 'Document Preview' : 'दस्तावेज़ पूर्वावलोकन'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="kiosk-btn-secondary flex-1">
                  {t('reuse')}
                </button>
                <button className="kiosk-btn-primary flex-1">
                  {t('replace')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default Documents;
