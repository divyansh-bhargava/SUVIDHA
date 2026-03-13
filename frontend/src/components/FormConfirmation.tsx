import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Edit3, User, Phone, Mail, MapPin, FileText, AlertTriangle } from 'lucide-react';

interface FormField {
  key: string;
  label: string;
  labelHi: string;
  value: string;
  editable: boolean;
  type?: 'text' | 'email' | 'phone';
}

interface FormConfirmationProps {
  title: string;
  titleHi: string;
  fields: FormField[];
  documents: Array<{
    name: string;
    status: 'valid' | 'pending';
  }>;
  onConfirm: (updatedFields: FormField[]) => void;
  onBack: () => void;
  onSaveToDocuments?: boolean;
}

const FormConfirmation: React.FC<FormConfirmationProps> = ({
  title,
  titleHi,
  fields,
  documents,
  onConfirm,
  onBack,
  onSaveToDocuments = true,
}) => {
  const { t, language } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<FormField[]>(fields);
  const [savePermission, setSavePermission] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields(prev => 
      prev.map(f => f.key === key ? { ...f, value } : f)
    );
  };

  const getFieldIcon = (key: string) => {
    switch (key) {
      case 'name':
        return <User className="w-5 h-5 text-primary" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-primary" />;
      case 'email':
        return <Mail className="w-5 h-5 text-primary" />;
      case 'address':
        return <MapPin className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="kiosk-card bg-gradient-to-r from-amber-100 to-orange-100 dark:from-warning/20 dark:to-orange-900/20 border-warning/40 hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse-subtle">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {language === 'en' ? 'Review Before Submission' : 'जमा करने से पहले समीक्षा करें'}
            </h3>
            <p className="text-base text-muted-foreground font-medium">
              {language === 'en' 
                ? 'Please verify all information is correct. You can edit fields if needed.'
                : 'कृपया सत्यापित करें कि सभी जानकारी सही है। आप आवश्यकता होने पर फ़ील्ड संपादित कर सकते हैं।'}
            </p>
          </div>
        </div>
      </div>

      {/* Application Type */}
      <div className="kiosk-card hover:shadow-lg transition-all hover:border-primary/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-2xl font-black text-foreground">
            {language === 'en' ? title : titleHi}
          </h3>
        </div>
        <p className="text-base text-muted-foreground ml-15 font-medium">
          {language === 'en' 
            ? '✨ Application details auto-filled from your profile'
            : '✨ आपकी प्रोफ़ाइल से स्वतः भरे गए आवेदन विवरण'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="kiosk-card hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>👤</span>
            {language === 'en' ? 'Applicant Details' : 'आवेदक विवरण'}
          </h4>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold hover:scale-105 active:scale-95 ${
              editMode 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                : 'bg-muted hover:bg-muted/80 text-foreground border-2 border-border'
            }`}
          >
            <Edit3 className="w-5 h-5" />
            {editMode 
              ? (language === 'en' ? '✓ Done Editing' : '✓ संपादन पूर्ण')
              : (language === 'en' ? 'Edit Details' : 'विवरण संपादित करें')
            }
          </button>
        </div>

        <div className="space-y-4">
          {editedFields.map((field, index) => (
            <div 
              key={field.key} 
              className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:shadow-md transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                {getFieldIcon(field.key)}
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {language === 'en' ? field.label : field.labelHi}
                </label>
                {editMode && field.editable ? (
                  <input
                    type={field.type || 'text'}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full mt-2 p-3 rounded-xl border-2 border-primary/30 bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                ) : (
                  <p className="text-lg font-bold text-foreground mt-1">{field.value}</p>
                )}
              </div>
              {field.editable && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  {language === 'en' ? '✏️ Editable' : '✏️ संपादन योग्य'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documents Summary */}
      <div className="kiosk-card hover:shadow-lg transition-all">
        <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>📄</span>
          {language === 'en' ? 'Attached Documents' : 'संलग्न दस्तावेज़'}
        </h4>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-success/5 to-green-500/5 border-2 border-success/20 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <span className="flex-1 text-lg font-bold text-foreground">{doc.name}</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <span className="text-sm font-bold text-success">
                  {doc.status === 'valid' 
                    ? (language === 'en' ? '✓ Verified' : '✓ सत्यापित')
                    : (language === 'en' ? 'Pending' : 'लंबित')
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save to Documents Permission */}
      {onSaveToDocuments && (
        <div className="kiosk-card hover:shadow-lg transition-all border-accent/30 bg-gradient-to-r from-accent/5 to-teal-500/5">
          <label className="flex items-start gap-4 cursor-pointer">
            <div 
              onClick={() => setSavePermission(!savePermission)}
              className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all hover:scale-110 ${
                savePermission 
                  ? 'bg-gradient-to-br from-accent to-teal-500 border-accent shadow-md' 
                  : 'border-muted-foreground hover:border-accent'
              }`}
            >
              {savePermission && <CheckCircle2 className="w-6 h-6 text-white" />}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-1">
                {language === 'en' 
                  ? '💾 Save new documents to my profile'
                  : '💾 नए दस्तावेज़ मेरी प्रोफ़ाइल में सहेजें'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Uploaded documents will be saved for future use across all services'
                  : 'अपलोड किए गए दस्तावेज़ सभी सेवाओं में भविष्य में उपयोग के लिए सहेजे जाएंगे'}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Acknowledgement */}
      <div className="kiosk-card border-2 border-primary/40 bg-gradient-to-r from-primary/5 to-blue-500/5 hover:shadow-lg transition-all">
        <label className="flex items-start gap-4 cursor-pointer">
          <div 
            onClick={() => setAcknowledged(!acknowledged)}
            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all hover:scale-110 ${
              acknowledged 
                ? 'bg-gradient-to-br from-primary to-blue-600 border-primary shadow-md' 
                : 'border-muted-foreground hover:border-primary'
            }`}
          >
            {acknowledged && <CheckCircle2 className="w-6 h-6 text-white" />}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground mb-1">
              {language === 'en' 
                ? '✅ I confirm all information is correct'
                : '✅ मैं पुष्टि करता हूं कि सभी जानकारी सही है'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'I understand that false information may result in application rejection'
                : 'मैं समझता हूं कि गलत जानकारी से आवेदन अस्वीकृत हो सकता है'}
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button 
          onClick={onBack} 
          className="kiosk-btn-ghost flex-1 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
        >
          <span className="text-2xl">←</span>
          <span className="text-lg">{t('back')}</span>
        </button>
        <button 
          onClick={() => onConfirm(editedFields)} 
          disabled={!acknowledged}
          className={`flex-1 text-lg font-bold transition-all ${
            acknowledged 
              ? 'kiosk-btn-success hover:scale-[1.02]' 
              : 'kiosk-btn-secondary opacity-50 cursor-not-allowed'
          }`}
        >
          {language === 'en' ? '✓ Confirm & Submit →' : '✓ पुष्टि और जमा करें →'}
        </button>
      </div>
    </div>
  );
};

export default FormConfirmation;
