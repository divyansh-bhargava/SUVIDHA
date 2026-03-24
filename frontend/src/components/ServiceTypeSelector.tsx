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

  const getServiceIcon = () => {
    const icons: Record<string, string> = {
      electricity: '⚡',
      water: '💧',
      gas: '🔥',
      municipal: '🏛️',
    };
    return icons[serviceType] || '📋';
  };

  const getServiceTitle = () => {
    const titles: Record<string, { en: string; hi: string }> = {
      electricity: { en: 'Electricity Services', hi: 'बिजली सेवाएं' },
      water: { en: 'Water Services', hi: 'पानी सेवाएं' },
      gas: { en: 'Gas Services', hi: 'गैस सेवाएं' },
      municipal: { en: 'Municipal Services', hi: 'नगरपालिका सेवाएं' },
    };
    return language === 'en' ? titles[serviceType]?.en : titles[serviceType]?.hi;
  };

  const getIconColor = (optionId: string) => {
    if (optionId === 'bill_payment') return 'from-green-500 to-emerald-600';
    if (optionId.includes('new_connection')) return 'from-blue-500 to-cyan-600';
    if (optionId.includes('disconnection')) return 'from-red-500 to-rose-600';
    if (optionId.includes('transfer')) return 'from-purple-500 to-indigo-600';
    return 'from-primary to-accent';
  };

  return (
    <div className="p-4 lg:p-6 w-full">
      {/* Service Options Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="kiosk-card flex flex-col items-center justify-center gap-3 p-5 lg:p-6 border-2 border-border hover:border-primary/60 cursor-pointer text-center transition-all duration-200 active:scale-[0.95] min-h-[160px] lg:min-h-[200px]"
          >
            {/* Icon Container */}
            <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-gradient-to-br ${getIconColor(option.id)} flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-200`}>
              <option.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            
            {/* Title */}
            <h3 className="text-base lg:text-lg font-bold text-foreground">
              {language === 'en' ? option.label : option.labelHi}
            </h3>
            
            {/* Description */}
            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
              {language === 'en' ? option.description : option.descriptionHi}
            </p>
            
            {/* Document Badge */}
            {option.requiresDocuments && (
              <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-300">
                <span className="text-xs lg:text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {language === 'en' ? '📄' : '📄'}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Back Button */}
      <div className="pt-4 lg:pt-6">
        <button 
          onClick={onBack} 
          className="w-full kiosk-btn-ghost flex items-center justify-center gap-2 text-base lg:text-lg font-semibold min-h-[56px] border-2 border-border hover:border-primary/50 transition-all duration-200"
        >
          <span>←</span>
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
export { serviceOptions };
export type { ServiceOption };
