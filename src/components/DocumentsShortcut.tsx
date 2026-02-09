import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const DocumentsShortcut: React.FC = () => {
  const { citizen, language } = useApp();
  const navigate = useNavigate();

  if (!citizen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'invalid':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'valid': return 'Verified';
        case 'pending': return 'Pending';
        case 'invalid': return 'Needs Update';
        default: return status;
      }
    } else {
      switch (status) {
        case 'valid': return 'सत्यापित';
        case 'pending': return 'लंबित';
        case 'invalid': return 'अपडेट आवश्यक';
        default: return status;
      }
    }
  };

  // Show only first 3 documents
  const displayDocs = citizen.documents.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-success" />
          {language === 'en' ? 'My Documents' : 'मेरे दस्तावेज़'}
        </h3>
        <button
          onClick={() => navigate('/documents')}
          className="text-primary font-medium hover:underline"
        >
          {language === 'en' ? 'View All →' : 'सभी देखें →'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {displayDocs.map((doc) => (
          <div
            key={doc.id}
            className={`kiosk-card p-4 flex items-center justify-between ${
              doc.status === 'invalid' ? 'opacity-60 border-destructive/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{doc.name}</span>
              {doc.status === 'invalid' && (
                <span className="text-xs text-destructive">
                  {language === 'en' ? 'Update required' : 'अपडेट आवश्यक'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(doc.status)}
              <span className={`text-sm font-medium ${
                doc.status === 'valid' ? 'text-success' :
                doc.status === 'pending' ? 'text-warning' : 'text-destructive'
              }`}>
                {getStatusLabel(doc.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* USP Highlight */}
      <div className="text-center py-3 px-4 rounded-xl bg-success/10 border border-success/20">
        <p className="text-success font-medium text-sm">
          ✓ {language === 'en' 
            ? 'Upload once, reuse everywhere' 
            : 'एक बार अपलोड करें, हर जगह उपयोग करें'}
        </p>
      </div>
    </div>
  );
};

export default DocumentsShortcut;
