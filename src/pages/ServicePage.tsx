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
  const { t, language, bills, payBill, citizen } = useApp();
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
    setStep('success');
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

  return (
    <KioskLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div className={`w-16 h-16 rounded-2xl bg-kiosk-icon-bg flex items-center justify-center`}>
            <ServiceIcon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{getServiceName()}</h1>
            <p className="text-lg text-muted-foreground">
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
          <div className="kiosk-card animate-scale-in">
            <div className="mb-6">
              <label className="block text-lg font-medium text-foreground mb-3">
                {t('enterConsumerNo')}
              </label>
              <input
                type="text"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value.toUpperCase())}
                placeholder={language === 'en' ? 'Enter your consumer number' : 'अपना उपभोक्ता नंबर दर्ज करें'}
                className="kiosk-input"
                autoFocus
              />
            </div>

            <button
              onClick={handleViewBill}
              className="kiosk-btn-primary w-full"
            >
              {t('viewBill')}
            </button>

            <p className="mt-4 text-center text-muted-foreground">
              {language === 'en' 
                ? 'Leave empty to use saved consumer number' 
                : 'सहेजे गए उपभोक्ता नंबर का उपयोग करने के लिए खाली छोड़ें'}
            </p>

            <button
              onClick={() => setStep('select_type')}
              className="kiosk-btn-ghost w-full mt-4"
            >
              {t('back')}
            </button>
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
          />
        )}

        {/* Step: Application Success (non-payment) */}
        {step === 'success' && !selectedBill && (
          <div className="text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <FileText className="w-14 h-14 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-success mb-2">
              {language === 'en' ? 'Application Submitted!' : 'आवेदन जमा हो गया!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'A confirmation SMS has been sent to your registered mobile number.'
                : 'आपके पंजीकृत मोबाइल नंबर पर पुष्टि SMS भेजा गया है।'}
            </p>
            <div className="receipt mb-6">
              <div className="space-y-3 text-left">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{language === 'en' ? 'Application ID' : 'आवेदन ID'}</span>
                  <span className="font-mono font-semibold text-foreground">{applicationId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{language === 'en' ? 'Service' : 'सेवा'}</span>
                  <span className="text-foreground">{getSelectedOptionName()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{language === 'en' ? 'Status' : 'स्थिति'}</span>
                  <span className="text-foreground">{language === 'en' ? 'Pending Review' : 'समीक्षाधीन'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate('/dashboard')} className="kiosk-btn-secondary flex-1">{t('home')}</button>
              <button onClick={() => navigate('/status')} className="kiosk-btn-primary flex-1">
                {language === 'en' ? 'Track Status' : 'स्थिति ट्रैक करें'}
              </button>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
};

export default ServicePage;
