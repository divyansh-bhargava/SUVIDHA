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
    <div className="space-y-6 animate-slide-up p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Enhanced Header with Icon */}
      {/* <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
            <span className="text-4xl">{getServiceIcon()}</span>
          </div>
        </div>
        <h2 className="text-3xl font-black text-foreground mb-2">
          {getServiceTitle()}
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          {language === 'en' 
            ? 'Choose what you would like to do'
            : 'चुनें कि आप क्या करना चाहते हैं'}
        </p>
      </div> */}

      {/* Service Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="group relative w-full kiosk-card flex items-center gap-5 p-6 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer text-left hover:-translate-y-1 active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Gradient Icon Container */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getIconColor(option.id)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <option.icon className="w-10 h-10 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {language === 'en' ? option.label : option.labelHi}
              </h3>
              <p className="text-base text-muted-foreground">
                {language === 'en' ? option.description : option.descriptionHi}
              </p>
            </div>
            
            {/* Document Badge */}
            {option.requiresDocuments && (
              <div className="hidden sm:flex">
                <span className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 border-2 border-orange-300 shadow-md">
                  {language === 'en' ? '📄 Docs Required' : '📄 दस्तावेज़ आवश्यक'}
                </span>
              </div>
            )}
            
            {/* Arrow */}
            <div className="flex-shrink-0">
              <span className="text-4xl text-primary group-hover:translate-x-2 transition-transform duration-300 inline-block">→</span>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <button 
          onClick={onBack} 
          className="w-full kiosk-btn-ghost flex items-center justify-center gap-2 text-lg hover:bg-muted/80 hover:scale-[1.02] transition-all"
        >
          <span className="text-2xl">←</span>
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
export { serviceOptions };
export type { ServiceOption };
