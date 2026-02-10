import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import KioskLayout from '@/components/KioskLayout';
import ServiceTypeSelector, { serviceOptions } from '@/components/ServiceTypeSelector';
import DocumentSelector from '@/components/DocumentSelector';
import FormConfirmation from '@/components/FormConfirmation';
import UnifiedPayment from '@/components/payment/UnifiedPayment';
import { Zap, Droplets, Flame, Building2, FileText } from 'lucide-react';

const serviceIcons: Record<string, React.ComponentType<any>> = {
  electricity: Zap,
  water: Droplets,
  gas: Flame,
  municipal: Building2,
};

const serviceColors: Record<string, string> = {
  electricity: 'text-yellow-500',
  water: 'text-blue-500',
  gas: 'text-orange-500',
  municipal: 'text-primary',
};

// Document requirements for different services
const documentRequirements: Record<string, Array<{id: string; name: string; nameHi: string; type: string; required: boolean}>> = {
  new_connection: [
    { id: 'identity', name: 'Identity Proof (Aadhaar/Voter ID)', nameHi: 'पहचान प्रमाण (आधार/मतदाता पहचान पत्र)', type: 'identity', required: true },
    { id: 'address', name: 'Address Proof', nameHi: 'पता प्रमाण', type: 'address', required: true },
    { id: 'property', name: 'Property Documents', nameHi: 'संपत्ति दस्तावेज़', type: 'property', required: true },
  ],
  disconnection: [
    { id: 'identity', name: 'Identity Proof', nameHi: 'पहचान प्रमाण', type: 'identity', required: true },
    { id: 'noc', name: 'No Objection Certificate', nameHi: 'अनापत्ति प्रमाणपत्र', type: 'noc', required: false },
  ],
  name_transfer: [
    { id: 'identity', name: 'Identity Proof (Both Parties)', nameHi: 'पहचान प्रमाण (दोनों पक्ष)', type: 'identity', required: true },
    { id: 'property', name: 'Property Transfer Documents', nameHi: 'संपत्ति हस्तांतरण दस्तावेज़', type: 'property', required: true },
    { id: 'noc', name: 'NOC from Previous Owner', nameHi: 'पिछले मालिक से अनापत्ति प्रमाणपत्र', type: 'noc', required: true },
  ],
  load_change: [
    { id: 'identity', name: 'Identity Proof', nameHi: 'पहचान प्रमाण', type: 'identity', required: true },
    { id: 'application', name: 'Load Change Application', nameHi: 'लोड परिवर्तन आवेदन', type: 'application', required: true },
  ],
  birth_certificate: [
    { id: 'identity', name: 'Parent Identity Proof', nameHi: 'माता-पिता पहचान प्रमाण', type: 'identity', required: true },
    { id: 'hospital', name: 'Hospital Birth Record', nameHi: 'अस्पताल जन्म रिकॉर्ड', type: 'hospital', required: true },
  ],
  death_certificate: [
    { id: 'identity', name: 'Applicant Identity Proof', nameHi: 'आवेदक पहचान प्रमाण', type: 'identity', required: true },
    { id: 'hospital', name: 'Hospital Death Record', nameHi: 'अस्पताल मृत्यु रिकॉर्ड', type: 'hospital', required: true },
  ],
  trade_license: [
    { id: 'identity', name: 'Owner Identity Proof', nameHi: 'मालिक पहचान प्रमाण', type: 'identity', required: true },
    { id: 'address', name: 'Business Address Proof', nameHi: 'व्यवसाय पता प्रमाण', type: 'address', required: true },
    { id: 'gst', name: 'GST Registration (if applicable)', nameHi: 'जीएसटी पंजीकरण (यदि लागू हो)', type: 'gst', required: false },
  ],
};

interface SelectedDocument {
  requirementId: string;
  documentId?: string;
  isNew: boolean;
  file?: File;
  preCheckStatus?: 'checking' | 'valid' | 'invalid' | 'blur' | 'format_error';
  preCheckMessage?: string;
}

const ServicePage: React.FC = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const { t, language, bills, payBill, citizen, voiceServiceAction, setVoiceServiceAction } = useApp();
  const voiceAssistant = useVoiceAssistantContext();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'select_type' | 'input' | 'documents' | 'confirmation' | 'payment' | 'success'>('select_type');
  const [selectedServiceOption, setSelectedServiceOption] = useState<string | null>(null);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([]);
  const [applicationId, setApplicationId] = useState<string>('');

  // Voice narrate on step changes
  useEffect(() => {
    if (!voiceAssistant.isActive) return;
    const timer = setTimeout(() => {
      switch (step) {
        case 'select_type':
          voiceAssistant.narratePage('service_select');
          break;
        case 'input':
          voiceAssistant.narratePage('consumer_id_entry');
          break;
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [step, voiceAssistant.isActive]);

  // Handle voice service action
  useEffect(() => {
    if (voiceServiceAction && step === 'select_type') {
      handleServiceOptionSelect(voiceServiceAction);
      setVoiceServiceAction(null);
    }
  }, [voiceServiceAction, step, setVoiceServiceAction]);

  const ServiceIcon = serviceIcons[serviceType || 'electricity'];
  const iconColor = serviceColors[serviceType || 'electricity'];

  const handleServiceOptionSelect = (optionId: string) => {
    setSelectedServiceOption(optionId);
    const option = serviceOptions[serviceType || '']?.find(o => o.id === optionId);
    
    if (option) {
      if (optionId === 'bill_payment' || optionId === 'cylinder_booking') {
        setStep('input');
      } else if (option.requiresDocuments) {
        // Initialize selected documents based on requirements
        const requirements = documentRequirements[optionId] || [];
        const initialDocs = requirements.map(req => {
          // Check if citizen has a matching saved document
          const savedDoc = citizen?.documents.find(d => d.type === req.type && d.status === 'valid');
          if (savedDoc) {
            return {
              requirementId: req.id,
              documentId: savedDoc.id,
              isNew: false,
              preCheckStatus: 'valid' as const,
            };
          }
          return {
            requirementId: req.id,
            isNew: false,
          };
        });
        setSelectedDocuments(initialDocs);
        setStep('documents');
      } else {
        setStep('input');
      }
    }
  };

  const handleViewBill = () => {
    const bill = bills.find(b => b.service === serviceType);
    if (bill) {
      setSelectedBill(bill);
      setConsumerNumber(bill.consumerNumber);
    } else {
      setSelectedBill({
        id: 'mock',
        service: serviceType || 'electricity',
        consumerNumber: consumerNumber || 'DEMO123456',
        amount: 1850,
        dueDate: '2024-02-20',
        status: 'unpaid',
        period: 'Jan 2024',
      });
    }
    setStep('payment');
  };

  const handlePaymentComplete = (method: string) => {
    if (selectedBill) {
      payBill(selectedBill.id);
    }
    // Don't change step here - let UnifiedPayment show its own success screen
  };

  const handleDocumentSelect = (requirementId: string, documentId: string) => {
    setSelectedDocuments(prev => 
      prev.map(sd => 
        sd.requirementId === requirementId 
          ? { ...sd, documentId, isNew: false, preCheckStatus: 'valid' as const }
          : sd
      )
    );
  };

  const handleNewDocumentUpload = (requirementId: string, file: File) => {
    // Simulate AI pre-check
    setSelectedDocuments(prev => 
      prev.map(sd => 
        sd.requirementId === requirementId 
          ? { ...sd, file, isNew: true, documentId: undefined, preCheckStatus: 'checking' as const }
          : sd
      )
    );

    // Simulate AI validation after 2 seconds
    setTimeout(() => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isBlurry = Math.random() < 0.1; // 10% chance of being "blurry"
      
      let status: 'valid' | 'invalid' | 'blur' | 'format_error' = 'valid';
      let message = '';

      if (!isValid) {
        status = 'format_error';
        message = language === 'en' 
          ? 'File must be PDF or image (JPG/PNG)'
          : 'फ़ाइल PDF या छवि (JPG/PNG) होनी चाहिए';
      } else if (isBlurry) {
        status = 'blur';
        message = language === 'en'
          ? 'Image appears to be blurry. Please upload a clearer image.'
          : 'छवि धुंधली दिखाई दे रही है। कृपया स्पष्ट छवि अपलोड करें।';
      }

      setSelectedDocuments(prev => 
        prev.map(sd => 
          sd.requirementId === requirementId 
            ? { ...sd, preCheckStatus: status, preCheckMessage: message }
            : sd
        )
      );
    }, 2000);
  };

  const handleDocumentsConfirm = () => {
    setStep('confirmation');
  };

  const handleFormConfirm = () => {
    // Generate application ID
    const appId = `APP${Date.now().toString().slice(-10)}`;
    setApplicationId(appId);
    setStep('success');
  };

  const serviceDepartments: Record<string, { en: string; hi: string }> = {
    electricity: { en: 'Department of Power & Energy', hi: 'ऊर्जा विभाग' },
    water: { en: 'Department of Water Supply', hi: 'जल आपूर्ति विभाग' },
    gas: { en: 'Department of Petroleum & Gas', hi: 'पेट्रोलियम एवं गैस विभाग' },
    municipal: { en: 'Municipal Corporation', hi: 'नगर निगम' },
  };

  const getServiceName = () => {
    switch (serviceType) {
      case 'electricity': return t('electricity');
      case 'water': return t('water');
      case 'gas': return t('gas');
      case 'municipal': return t('municipal');
      default: return '';
    }
  };

  const getServiceNameHi = () => {
    const names: Record<string, string> = { electricity: 'बिजली', water: 'पानी', gas: 'गैस', municipal: 'नगरपालिका' };
    return names[serviceType || ''] || '';
  };

  const getSelectedOptionName = () => {
    const option = serviceOptions[serviceType || '']?.find(o => o.id === selectedServiceOption);
    return option ? (language === 'en' ? option.label : option.labelHi) : '';
  };

  const getFormFields = () => {
    if (!citizen) return [];
    return [
      { key: 'name', label: 'Full Name', labelHi: 'पूरा नाम', value: language === 'en' ? citizen.name : citizen.nameHi, editable: false },
      { key: 'suvidhaId', label: 'SUVIDHA ID', labelHi: 'सुविधा ID', value: citizen.suvidhaId, editable: false },
      { key: 'phone', label: 'Phone Number', labelHi: 'फ़ोन नंबर', value: citizen.phone, editable: true, type: 'phone' as const },
      { key: 'email', label: 'Email', labelHi: 'ईमेल', value: citizen.email, editable: true, type: 'email' as const },
      { key: 'address', label: 'Address', labelHi: 'पता', value: language === 'en' ? citizen.address : citizen.addressHi, editable: true },
    ];
  };

  const getConfirmationDocuments = () => {
    return selectedDocuments
      .filter(sd => sd.documentId || sd.file)
      .map(sd => {
        const req = (documentRequirements[selectedServiceOption || ''] || []).find(r => r.id === sd.requirementId);
        const savedDoc = citizen?.documents.find(d => d.id === sd.documentId);
        return {
          name: savedDoc?.name || sd.file?.name || (language === 'en' ? req?.name : req?.nameHi) || 'Document',
          status: 'valid' as const,
        };
      });
  };

  const getServiceIconEmoji = () => {
    const icons: Record<string, string> = {
      electricity: '⚡',
      water: '💧',
      gas: '🔥',
      municipal: '🏛️',
    };
    return icons[serviceType || ''] || '📋';
  };

  const getServiceGradient = () => {
    const gradients: Record<string, string> = {
      electricity: 'from-yellow-400 to-amber-500',
      water: 'from-blue-400 to-cyan-500',
      gas: 'from-orange-400 to-red-500',
      municipal: 'from-primary to-indigo-600',
    };
    return gradients[serviceType || ''] || 'from-primary to-accent';
  };

  return (
    <KioskLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center gap-5 mb-8 animate-slide-up">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getServiceGradient()} flex items-center justify-center shadow-lg`}>
            <span className="text-4xl">{getServiceIconEmoji()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">{getServiceName()}</h1>
            <p className="text-lg text-muted-foreground font-medium">
              {selectedServiceOption ? getSelectedOptionName() : (language === 'en' ? 'Select Service' : 'सेवा चुनें')}
            </p>
          </div>
        </div>

        {/* Step: Select Service Type */}
        {step === 'select_type' && (
          <ServiceTypeSelector
            serviceType={serviceType || ''}
            onSelect={handleServiceOptionSelect}
            onBack={() => navigate('/dashboard')}
          />
        )}

        {/* Step: Documents */}
        {step === 'documents' && (
          <DocumentSelector
            requirements={documentRequirements[selectedServiceOption || ''] || []}
            selectedDocuments={selectedDocuments}
            onDocumentSelect={handleDocumentSelect}
            onNewDocumentUpload={handleNewDocumentUpload}
            onConfirm={handleDocumentsConfirm}
            onBack={() => setStep('select_type')}
          />
        )}

        {/* Step: Confirmation */}
        {step === 'confirmation' && (
          <FormConfirmation
            title={getSelectedOptionName()}
            titleHi={getSelectedOptionName()}
            fields={getFormFields()}
            documents={getConfirmationDocuments()}
            onConfirm={handleFormConfirm}
            onBack={() => setStep('documents')}
          />
        )}

        {/* Step: Input Consumer Number (for bill payment) */}
        {step === 'input' && (
          <div className="space-y-6 animate-slide-up">
            {/* Info Banner */}
            <div className="kiosk-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-3xl">🧾</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {language === 'en' ? 'Enter Consumer Details' : 'उपभोक्ता विवरण दर्ज करें'}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {language === 'en' 
                      ? 'Your consumer number is printed on your previous bill'
                      : 'आपका उपभोक्ता नंबर आपके पिछले बिल पर मुद्रित है'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consumer Number Input Card */}
            <div className="kiosk-card hover:shadow-xl transition-all">
              <div className="mb-6">
                <label className="block text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span>🔢</span>
                  {t('enterConsumerNo')}
                </label>
                <input
                  type="text"
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value.toUpperCase())}
                  placeholder={language === 'en' ? 'e.g., ELEC123456789' : 'जैसे, ELEC123456789'}
                  className="w-full min-h-[72px] px-6 text-2xl rounded-2xl font-mono font-bold tracking-wider
                    bg-gradient-to-r from-muted/50 to-muted/30 border-2 border-primary/30
                    focus:border-primary focus:ring-4 focus:ring-primary/20 focus:bg-white
                    placeholder:text-muted-foreground/50 placeholder:font-normal
                    transition-all duration-200"
                  autoFocus
                />
              </div>

              {/* Quick Info */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 mb-6">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <span>💡</span>
                  {language === 'en' 
                    ? 'Leave empty to use your saved consumer number' 
                    : 'सहेजे गए उपभोक्ता नंबर का उपयोग करने के लिए खाली छोड़ें'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('select_type')}
                  className="flex-1 kiosk-btn-ghost flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <span className="text-2xl">←</span>
                  <span className="text-lg">{t('back')}</span>
                </button>
                <button
                  onClick={handleViewBill}
                  className="flex-1 kiosk-btn-primary flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all"
                >
                  <span>{t('viewBill')}</span>
                  <span className="text-2xl">→</span>
                </button>
              </div>
            </div>

            {/* Sample Consumer Card */}
            <div className="kiosk-card bg-gradient-to-r from-muted/30 to-muted/10 border-dashed">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📄</span>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  {language === 'en' ? 'Where to find your Consumer Number' : 'अपना उपभोक्ता नंबर कहां खोजें'}
                </p>
              </div>
              <div className="flex items-center justify-center p-6 bg-white dark:bg-card rounded-xl border-2 border-dashed border-muted-foreground/30">
                <div className="text-center">
                  <div className="text-6xl mb-3">🧾</div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Check top-right corner of your bill'
                      : 'अपने बिल के ऊपरी-दाएं कोने में देखें'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Unified Payment (bill review → method → success) */}
        {step === 'payment' && selectedBill && (
          <UnifiedPayment
            details={{
              serviceName: getServiceName(),
              serviceNameHi: getServiceNameHi(),
              department: serviceDepartments[serviceType || 'electricity']?.en || '',
              departmentHi: serviceDepartments[serviceType || 'electricity']?.hi || '',
              consumerNumber: selectedBill.consumerNumber,
              consumerName: citizen?.name || '',
              consumerNameHi: citizen?.nameHi || '',
              amount: selectedBill.amount,
              dueDate: selectedBill.dueDate,
              period: selectedBill.period,
              billId: selectedBill.id,
            }}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setStep('input')}
            onDone={() => navigate('/dashboard')}
          />
        )}

        {/* Step: Application Success (non-payment) */}
        {step === 'success' && !selectedBill && (
          <div className="text-center animate-slide-up space-y-6">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center shadow-2xl animate-bounce-subtle">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-green-500 flex items-center justify-center">
                  <span className="text-5xl">✓</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-success/30 animate-ping"></div>
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-4xl font-black text-success mb-2">
                {language === 'en' ? 'Application Submitted!' : 'आवेदन जमा हो गया!'}
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                {language === 'en' 
                  ? '📱 A confirmation SMS has been sent to your registered mobile number.'
                  : '📱 आपके पंजीकृत मोबाइल नंबर पर पुष्टि SMS भेजा गया है।'}
              </p>
            </div>

            {/* Receipt Card */}
            <div className="kiosk-card bg-gradient-to-b from-white to-muted/30 dark:from-card dark:to-muted/10 border-2 border-success/30 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-success/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {language === 'en' ? 'Application Receipt' : 'आवेदन रसीद'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-success/5 border border-success/20">
                  <span className="text-muted-foreground font-medium">
                    {language === 'en' ? '🆔 Application ID' : '🆔 आवेदन ID'}
                  </span>
                  <span className="font-mono font-black text-lg text-success">{applicationId}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-muted/30">
                  <span className="text-muted-foreground font-medium">
                    {language === 'en' ? '📋 Service' : '📋 सेवा'}
                  </span>
                  <span className="font-bold text-foreground">{getSelectedOptionName()}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-muted/30">
                  <span className="text-muted-foreground font-medium">
                    {language === 'en' ? '⏳ Status' : '⏳ स्थिति'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-sm font-bold">
                    {language === 'en' ? 'Pending Review' : 'समीक्षाधीन'}
                  </span>
                </div>
              </div>

              {/* Expected Timeline */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <span>⏱️</span>
                  {language === 'en' 
                    ? 'Expected processing time: 3-5 working days'
                    : 'अपेक्षित प्रसंस्करण समय: 3-5 कार्य दिवस'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="flex-1 kiosk-btn-secondary flex items-center justify-center gap-2 text-lg hover:scale-[1.02] transition-all"
              >
                <span>🏠</span>
                {t('home')}
              </button>
              <button 
                onClick={() => navigate('/status')} 
                className="flex-1 kiosk-btn-primary flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all"
              >
                {language === 'en' ? 'Track Status' : 'स्थिति ट्रैक करें'}
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default ServicePage;
