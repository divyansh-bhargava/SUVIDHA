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
    <div className="space-y-6">
      {/* Header */}
      <div className="kiosk-card bg-warning/5 border-warning/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {language === 'en' ? 'Review Before Submission' : 'जमा करने से पहले समीक्षा करें'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Please verify all information is correct. You can edit fields if needed.'
                : 'कृपया सत्यापित करें कि सभी जानकारी सही है। आप आवश्यकता होने पर फ़ील्ड संपादित कर सकते हैं।'}
            </p>
          </div>
        </div>
      </div>

      {/* Application Type */}
      <div className="kiosk-card">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {language === 'en' ? title : titleHi}
        </h3>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Application details auto-filled from your profile'
            : 'आपकी प्रोफ़ाइल से स्वतः भरे गए आवेदन विवरण'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="kiosk-card">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-foreground">
            {language === 'en' ? 'Applicant Details' : 'आवेदक विवरण'}
          </h4>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              editMode 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {editMode 
              ? (language === 'en' ? 'Done Editing' : 'संपादन पूर्ण')
              : (language === 'en' ? 'Edit Details' : 'विवरण संपादित करें')
            }
          </button>
        </div>

        <div className="space-y-4">
          {editedFields.map((field) => (
            <div key={field.key} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getFieldIcon(field.key)}
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">
                  {language === 'en' ? field.label : field.labelHi}
                </label>
                {editMode && field.editable ? (
                  <input
                    type={field.type || 'text'}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-primary/30 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="font-medium text-foreground mt-1">{field.value}</p>
                )}
              </div>
              {field.editable && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {language === 'en' ? 'Editable' : 'संपादन योग्य'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documents Summary */}
      <div className="kiosk-card">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          {language === 'en' ? 'Attached Documents' : 'संलग्न दस्तावेज़'}
        </h4>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <FileText className="w-5 h-5 text-primary" />
              <span className="flex-1 font-medium text-foreground">{doc.name}</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm text-success">
                  {doc.status === 'valid' 
                    ? (language === 'en' ? 'Verified' : 'सत्यापित')
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
        <div className="kiosk-card">
          <label className="flex items-start gap-4 cursor-pointer">
            <div 
              onClick={() => setSavePermission(!savePermission)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                savePermission 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground'
              }`}
            >
              {savePermission && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {language === 'en' 
                  ? 'Save new documents to my profile'
                  : 'नए दस्तावेज़ मेरी प्रोफ़ाइल में सहेजें'}
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
      <div className="kiosk-card border-primary/30">
        <label className="flex items-start gap-4 cursor-pointer">
          <div 
            onClick={() => setAcknowledged(!acknowledged)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              acknowledged 
                ? 'bg-primary border-primary' 
                : 'border-muted-foreground'
            }`}
          >
            {acknowledged && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {language === 'en' 
                ? 'I confirm all information is correct'
                : 'मैं पुष्टि करता हूं कि सभी जानकारी सही है'}
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
      <div className="flex gap-4">
        <button onClick={onBack} className="kiosk-btn-ghost flex-1">
          {t('back')}
        </button>
        <button 
          onClick={() => onConfirm(editedFields)} 
          disabled={!acknowledged}
          className={`flex-1 ${acknowledged ? 'kiosk-btn-success' : 'kiosk-btn-secondary opacity-50 cursor-not-allowed'}`}
        >
          {t('confirmSubmit')}
        </button>
      </div>
    </div>
  );
};

export default FormConfirmation;
