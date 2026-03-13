import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import { MessageSquarePlus, CheckCircle2, Copy, Building2, FileText, ArrowRight, AlertTriangle, Edit3, Send, Home, Search, Zap, Droplets, Flame, Car, Trash2, MoreHorizontal, MapPin, User, Phone, BadgeCheck } from 'lucide-react';

// Department icons and colors - muted, professional colors
const deptConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; emoji: string }> = {
  electricity: { icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30', emoji: '⚡' },
  water: { icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', emoji: '💧' },
  gas: { icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30', emoji: '🔥' },
  roads: { icon: Car, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30', emoji: '🛣️' },
  sanitation: { icon: Trash2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', emoji: '🧹' },
  other: { icon: MoreHorizontal, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', emoji: '📋' },
};

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
        {/* Header Banner */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-white shadow-md animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <MessageSquarePlus className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{t('registerComplaint')}</h1>
              <p className="text-white/80">
                {language === 'en' ? 'Submit your grievance' : 'अपनी शिकायत दर्ज करें'}
              </p>
            </div>
          </div>
          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-2">
            {['form', 'confirm', 'success'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-white text-slate-800 scale-110' :
                  i < ['form', 'confirm', 'success'].indexOf(step) ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {i < ['form', 'confirm', 'success'].indexOf(step) ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-1 rounded ${i < ['form', 'confirm', 'success'].indexOf(step) ? 'bg-white/30' : 'bg-white/10'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-6 animate-scale-in">
            {/* Department Selection */}
            <div className="kiosk-card">
              <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                {t('selectDepartment')}
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => {
                  const config = deptConfig[dept.id];
                  const IconComponent = config?.icon || Building2;
                  const isSelected = department === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => {
                        setDepartment(dept.id);
                        setComplaintType('');
                      }}
                      className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? `border-primary ${config?.bgColor} ${config?.color} font-semibold`
                          : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isSelected ? config?.color : 'text-muted-foreground'}`} />
                      <span className="text-sm">
                        {language === 'en' ? dept.labelEn : dept.labelHi}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complaint Type */}
            {department && (
              <div className="kiosk-card animate-slide-up">
                <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  {t('complaintType')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type, index) => {
                    const isSelected = complaintType === (language === 'en' ? type.labelEn : type.labelHi);
                    return (
                      <button
                        key={index}
                        onClick={() => setComplaintType(language === 'en' ? type.labelEn : type.labelHi)}
                        className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        <span className="text-sm">
                          {language === 'en' ? type.labelEn : type.labelHi}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {complaintType && (
              <div className="kiosk-card animate-slide-up">
                <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-muted-foreground" />
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'en' ? 'Describe your complaint in detail...' : 'अपनी शिकायत का विस्तार से वर्णन करें...'}
                  className="kiosk-input min-h-[150px] resize-none text-base"
                  rows={4}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {description.length}/500 {language === 'en' ? 'characters' : 'अक्षर'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!department || !complaintType || !description}
              className="kiosk-btn-primary w-full py-5 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {t('submit')}
            </button>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="space-y-6 animate-scale-in">
            {/* Department Header */}
            {selectedDept && (
              <div className={`${deptConfig[department]?.bgColor || 'bg-muted'} rounded-xl p-4 border`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{deptConfig[department]?.emoji || '📋'}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === 'en' ? 'Department' : 'विभाग'}</p>
                    <h3 className={`text-lg font-semibold ${deptConfig[department]?.color || 'text-foreground'}`}>
                      {language === 'en' ? selectedDept.labelEn : selectedDept.labelHi}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="kiosk-card">
              <h3 className="text-lg font-semibold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                {t('confirmSubmit')}
              </h3>

              {/* Pre-filled citizen data */}
              <div className="mb-5 p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  {language === 'en' ? 'Complainant Details (Auto-filled)' : 'शिकायतकर्ता विवरण (स्वतः भरा हुआ)'}
                </p>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">{language === 'en' ? citizen?.name : citizen?.nameHi}</p>
                  <p className="text-muted-foreground font-mono text-xs">{citizen?.suvidhaId}</p>
                  <p className="text-muted-foreground">{citizen?.phone}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">{t('complaintType')}</span>
                  <span className="font-medium text-foreground">{complaintType}</span>
                </div>
                <div className="py-2">
                  <span className="text-muted-foreground text-sm block mb-2">{t('description')}</span>
                  <p className="text-foreground bg-muted/30 p-3 rounded-lg text-sm">{description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="kiosk-btn-ghost flex-1 py-4 flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {t('editDetails')}
                </button>
                <button
                  onClick={handleConfirm}
                  className="kiosk-btn-success flex-1 py-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('confirmSubmit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center animate-scale-in">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('ticketGenerated')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'Your complaint has been registered successfully' 
                : 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है'}
            </p>

            {/* Ticket Card */}
            <div className="kiosk-card mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'en' ? 'Your Ticket ID' : 'आपकी टिकट ID'}
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl font-mono font-bold text-primary">{ticketId}</span>
                <button
                  onClick={copyTicketId}
                  className={`p-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">
                  {language === 'en' ? 'Copied!' : 'कॉपी किया गया!'}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en' 
                  ? 'Save this ID to track your complaint' 
                  : 'अपनी शिकायत ट्रैक करने के लिए यह ID सेव करें'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="kiosk-btn-secondary flex-1 py-4 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t('home')}
              </button>
              <button
                onClick={() => navigate('/status')}
                className="kiosk-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
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
