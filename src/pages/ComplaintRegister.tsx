import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import { MessageSquarePlus, CheckCircle2, Copy } from 'lucide-react';

const departments = [
  { id: 'electricity', labelEn: 'Electricity', labelHi: 'बिजली' },
  { id: 'water', labelEn: 'Water Supply', labelHi: 'जल आपूर्ति' },
  { id: 'gas', labelEn: 'Gas', labelHi: 'गैस' },
  { id: 'roads', labelEn: 'Roads & Transport', labelHi: 'सड़कें और परिवहन' },
  { id: 'sanitation', labelEn: 'Sanitation', labelHi: 'स्वच्छता' },
  { id: 'other', labelEn: 'Other', labelHi: 'अन्य' },
];

const complaintTypes: Record<string, { labelEn: string; labelHi: string }[]> = {
  electricity: [
    { labelEn: 'Power Outage', labelHi: 'बिजली कटौती' },
    { labelEn: 'Voltage Fluctuation', labelHi: 'वोल्टेज उतार-चढ़ाव' },
    { labelEn: 'Billing Issue', labelHi: 'बिलिंग समस्या' },
    { labelEn: 'Meter Problem', labelHi: 'मीटर समस्या' },
  ],
  water: [
    { labelEn: 'No Water Supply', labelHi: 'पानी की आपूर्ति नहीं' },
    { labelEn: 'Low Pressure', labelHi: 'कम दबाव' },
    { labelEn: 'Water Quality', labelHi: 'पानी की गुणवत्ता' },
    { labelEn: 'Leakage', labelHi: 'रिसाव' },
  ],
  gas: [
    { labelEn: 'Connection Issue', labelHi: 'कनेक्शन समस्या' },
    { labelEn: 'Low Pressure', labelHi: 'कम दबाव' },
    { labelEn: 'Billing Issue', labelHi: 'बिलिंग समस्या' },
    { labelEn: 'Gas Leak', labelHi: 'गैस रिसाव' },
  ],
  roads: [
    { labelEn: 'Pothole', labelHi: 'गड्ढा' },
    { labelEn: 'Street Light', labelHi: 'स्ट्रीट लाइट' },
    { labelEn: 'Traffic Signal', labelHi: 'ट्रैफिक सिग्नल' },
    { labelEn: 'Road Damage', labelHi: 'सड़क क्षति' },
  ],
  sanitation: [
    { labelEn: 'Garbage Collection', labelHi: 'कचरा संग्रहण' },
    { labelEn: 'Drain Blockage', labelHi: 'नाली अवरोध' },
    { labelEn: 'Public Toilet', labelHi: 'सार्वजनिक शौचालय' },
    { labelEn: 'Pest Control', labelHi: 'कीट नियंत्रण' },
  ],
  other: [
    { labelEn: 'General Complaint', labelHi: 'सामान्य शिकायत' },
    { labelEn: 'Suggestion', labelHi: 'सुझाव' },
  ],
};

const ComplaintRegister: React.FC = () => {
  const { t, language, citizen, addComplaint } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [department, setDepartment] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (department && complaintType && description) {
      setStep('confirm');
    }
  };

  const handleConfirm = () => {
    const newTicketId = addComplaint({
      department,
      type: complaintType,
      description,
      status: 'pending',
    });
    setTicketId(newTicketId);
    setStep('success');
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDept = departments.find(d => d.id === department);
  const types = complaintTypes[department] || [];

  return (
    <KioskLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <MessageSquarePlus className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('registerComplaint')}</h1>
            <p className="text-lg text-muted-foreground">
              {language === 'en' ? 'Submit your grievance' : 'अपनी शिकायत दर्ज करें'}
            </p>
          </div>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-6 animate-scale-in">
            {/* Department Selection */}
            <div className="kiosk-card">
              <label className="block text-lg font-medium text-foreground mb-4">
                {t('selectDepartment')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setDepartment(dept.id);
                      setComplaintType('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      department === dept.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="font-medium">
                      {language === 'en' ? dept.labelEn : dept.labelHi}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complaint Type */}
            {department && (
              <div className="kiosk-card animate-slide-up">
                <label className="block text-lg font-medium text-foreground mb-4">
                  {t('complaintType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {types.map((type, index) => (
                    <button
                      key={index}
                      onClick={() => setComplaintType(language === 'en' ? type.labelEn : type.labelHi)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        complaintType === (language === 'en' ? type.labelEn : type.labelHi)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="font-medium">
                        {language === 'en' ? type.labelEn : type.labelHi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {complaintType && (
              <div className="kiosk-card animate-slide-up">
                <label className="block text-lg font-medium text-foreground mb-4">
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'en' ? 'Describe your complaint in detail...' : 'अपनी शिकायत का विस्तार से वर्णन करें...'}
                  className="kiosk-input min-h-[150px] resize-none"
                  rows={4}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!department || !complaintType || !description}
              className="kiosk-btn-primary w-full disabled:opacity-50"
            >
              {t('submit')}
            </button>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="kiosk-card animate-scale-in">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-4 border-b border-border">
              {t('confirmSubmit')}
            </h3>

            {/* Pre-filled citizen data */}
            <div className="mb-6 p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'en' ? 'Complainant Details (Auto-filled)' : 'शिकायतकर्ता विवरण (स्वतः भरा हुआ)'}
              </p>
              <p className="font-medium">{language === 'en' ? citizen?.name : citizen?.nameHi}</p>
              <p className="text-sm text-muted-foreground">{citizen?.suvidhaId}</p>
              <p className="text-sm text-muted-foreground">{citizen?.phone}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">{t('selectDepartment')}</span>
                <span className="font-medium">
                  {language === 'en' ? selectedDept?.labelEn : selectedDept?.labelHi}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">{t('complaintType')}</span>
                <span className="font-medium">{complaintType}</span>
              </div>
              <div className="py-3">
                <span className="text-muted-foreground block mb-2">{t('description')}</span>
                <p className="text-foreground">{description}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('form')}
                className="kiosk-btn-ghost flex-1"
              >
                {t('editDetails')}
              </button>
              <button
                onClick={handleConfirm}
                className="kiosk-btn-success flex-1"
              >
                {t('confirmSubmit')}
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-success" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('ticketGenerated')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'Your complaint has been registered successfully' 
                : 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है'}
            </p>

            <div className="kiosk-card mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'en' ? 'Your Ticket ID' : 'आपकी टिकट ID'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-3xl font-mono font-bold text-primary">{ticketId}</span>
                <button
                  onClick={copyTicketId}
                  className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Copy className={`w-5 h-5 ${copied ? 'text-success' : 'text-muted-foreground'}`} />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-success mt-2">
                  {language === 'en' ? 'Copied!' : 'कॉपी किया गया!'}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="kiosk-btn-secondary flex-1"
              >
                {t('home')}
              </button>
              <button
                onClick={() => navigate('/status')}
                className="kiosk-btn-primary flex-1"
              >
                {t('trackStatus')}
              </button>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default ComplaintRegister;
