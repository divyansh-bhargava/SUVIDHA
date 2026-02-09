import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { CreditCard, PlusCircle, MinusCircle, UserCheck, Wrench, FileText } from 'lucide-react';

interface ServiceOption {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  requiresDocuments: boolean;
}

interface ServiceTypeSelectorProps {
  serviceType: string;
  onSelect: (optionId: string) => void;
  onBack: () => void;
}

const serviceOptions: Record<string, ServiceOption[]> = {
  electricity: [
    {
      id: 'bill_payment',
      icon: CreditCard,
      label: 'Bill Payment',
      labelHi: 'बिल भुगतान',
      description: 'Pay your electricity bill',
      descriptionHi: 'अपना बिजली बिल भुगतान करें',
      requiresDocuments: false,
    },
    {
      id: 'new_connection',
      icon: PlusCircle,
      label: 'New Connection',
      labelHi: 'नया कनेक्शन',
      description: 'Apply for new electricity connection',
      descriptionHi: 'नए बिजली कनेक्शन के लिए आवेदन करें',
      requiresDocuments: true,
    },
    {
      id: 'disconnection',
      icon: MinusCircle,
      label: 'Disconnection',
      labelHi: 'कनेक्शन बंद करना',
      description: 'Request connection disconnection',
      descriptionHi: 'कनेक्शन बंद करने का अनुरोध करें',
      requiresDocuments: true,
    },
    {
      id: 'name_transfer',
      icon: UserCheck,
      label: 'Name Transfer',
      labelHi: 'नाम हस्तांतरण',
      description: 'Transfer connection to another name',
      descriptionHi: 'कनेक्शन दूसरे नाम पर हस्तांतरित करें',
      requiresDocuments: true,
    },
    {
      id: 'load_change',
      icon: Wrench,
      label: 'Load Change',
      labelHi: 'लोड परिवर्तन',
      description: 'Request load increase/decrease',
      descriptionHi: 'लोड बढ़ाने/घटाने का अनुरोध करें',
      requiresDocuments: true,
    },
  ],
  water: [
    {
      id: 'bill_payment',
      icon: CreditCard,
      label: 'Bill Payment',
      labelHi: 'बिल भुगतान',
      description: 'Pay your water bill',
      descriptionHi: 'अपना पानी बिल भुगतान करें',
      requiresDocuments: false,
    },
    {
      id: 'new_connection',
      icon: PlusCircle,
      label: 'New Connection',
      labelHi: 'नया कनेक्शन',
      description: 'Apply for new water connection',
      descriptionHi: 'नए पानी कनेक्शन के लिए आवेदन करें',
      requiresDocuments: true,
    },
    {
      id: 'disconnection',
      icon: MinusCircle,
      label: 'Disconnection',
      labelHi: 'कनेक्शन बंद करना',
      description: 'Request connection disconnection',
      descriptionHi: 'कनेक्शन बंद करने का अनुरोध करें',
      requiresDocuments: true,
    },
    {
      id: 'name_transfer',
      icon: UserCheck,
      label: 'Name Transfer',
      labelHi: 'नाम हस्तांतरण',
      description: 'Transfer connection to another name',
      descriptionHi: 'कनेक्शन दूसरे नाम पर हस्तांतरित करें',
      requiresDocuments: true,
    },
    {
      id: 'meter_complaint',
      icon: Wrench,
      label: 'Meter Issue',
      labelHi: 'मीटर समस्या',
      description: 'Report meter malfunction',
      descriptionHi: 'मीटर खराबी की रिपोर्ट करें',
      requiresDocuments: false,
    },
  ],
  gas: [
    {
      id: 'bill_payment',
      icon: CreditCard,
      label: 'Bill Payment',
      labelHi: 'बिल भुगतान',
      description: 'Pay your gas bill',
      descriptionHi: 'अपना गैस बिल भुगतान करें',
      requiresDocuments: false,
    },
    {
      id: 'new_connection',
      icon: PlusCircle,
      label: 'New Connection',
      labelHi: 'नया कनेक्शन',
      description: 'Apply for new gas connection',
      descriptionHi: 'नए गैस कनेक्शन के लिए आवेदन करें',
      requiresDocuments: true,
    },
    {
      id: 'cylinder_booking',
      icon: FileText,
      label: 'Cylinder Booking',
      labelHi: 'सिलेंडर बुकिंग',
      description: 'Book LPG cylinder refill',
      descriptionHi: 'एलपीजी सिलेंडर रिफिल बुक करें',
      requiresDocuments: false,
    },
    {
      id: 'name_transfer',
      icon: UserCheck,
      label: 'Name Transfer',
      labelHi: 'नाम हस्तांतरण',
      description: 'Transfer connection to another name',
      descriptionHi: 'कनेक्शन दूसरे नाम पर हस्तांतरित करें',
      requiresDocuments: true,
    },
  ],
  municipal: [
    {
      id: 'bill_payment',
      icon: CreditCard,
      label: 'Property Tax',
      labelHi: 'संपत्ति कर',
      description: 'Pay property tax',
      descriptionHi: 'संपत्ति कर भुगतान करें',
      requiresDocuments: false,
    },
    {
      id: 'birth_certificate',
      icon: FileText,
      label: 'Birth Certificate',
      labelHi: 'जन्म प्रमाणपत्र',
      description: 'Apply for birth certificate',
      descriptionHi: 'जन्म प्रमाणपत्र के लिए आवेदन करें',
      requiresDocuments: true,
    },
    {
      id: 'death_certificate',
      icon: FileText,
      label: 'Death Certificate',
      labelHi: 'मृत्यु प्रमाणपत्र',
      description: 'Apply for death certificate',
      descriptionHi: 'मृत्यु प्रमाणपत्र के लिए आवेदन करें',
      requiresDocuments: true,
    },
    {
      id: 'trade_license',
      icon: FileText,
      label: 'Trade License',
      labelHi: 'व्यापार लाइसेंस',
      description: 'Apply for trade license',
      descriptionHi: 'व्यापार लाइसेंस के लिए आवेदन करें',
      requiresDocuments: true,
    },
  ],
};

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  serviceType,
  onSelect,
  onBack,
}) => {
  const { t, language } = useApp();
  const options = serviceOptions[serviceType] || [];

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Select Service Type' : 'सेवा प्रकार चुनें'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Choose what you would like to do'
            : 'चुनें कि आप क्या करना चाहते हैं'}
        </p>
      </div>

      {/* Service Options */}
      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="w-full kiosk-card flex items-center gap-4 p-6 hover:border-primary/30 transition-colors cursor-pointer text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-kiosk-icon-bg flex items-center justify-center flex-shrink-0">
              <option.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                {language === 'en' ? option.label : option.labelHi}
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? option.description : option.descriptionHi}
              </p>
            </div>
            {option.requiresDocuments && (
              <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/30">
                {language === 'en' ? 'Docs Required' : 'दस्तावेज़ आवश्यक'}
              </span>
            )}
            <span className="text-3xl text-primary">→</span>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <button onClick={onBack} className="kiosk-btn-ghost w-full">
        {t('back')}
      </button>
    </div>
  );
};

export default ServiceTypeSelector;
export { serviceOptions };
export type { ServiceOption };
