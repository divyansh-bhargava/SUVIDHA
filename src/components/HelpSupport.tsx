import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { HelpCircle, Phone, BookOpen, X, MessageCircle } from 'lucide-react';

const HelpSupport: React.FC = () => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const helpOptions = [
    {
      icon: BookOpen,
      label: language === 'en' ? 'How to use kiosk' : 'कियोस्क का उपयोग कैसे करें',
      description: language === 'en' 
        ? 'Step-by-step guide' 
        : 'चरण-दर-चरण मार्गदर्शिका',
      action: () => {
        // Show tutorial
        alert(language === 'en' 
          ? 'Tutorial: Use the service tiles to access services. Speak to the mic for voice commands.' 
          : 'ट्यूटोरियल: सेवाओं तक पहुंचने के लिए सेवा टाइल्स का उपयोग करें।');
      },
    },
    {
      icon: Phone,
      label: language === 'en' ? 'Call Staff' : 'स्टाफ को कॉल करें',
      description: language === 'en' 
        ? 'Get assistance now' 
        : 'अभी सहायता प्राप्त करें',
      action: () => {
        alert(language === 'en' 
          ? 'AI Call Agent: Connecting you to support staff...' 
          : 'AI कॉल एजेंट: आपको सहायता स्टाफ से जोड़ रहा है...');
      },
    },
    {
      icon: MessageCircle,
      label: language === 'en' ? 'FAQ' : 'सामान्य प्रश्न',
      description: language === 'en' 
        ? 'Common questions' 
        : 'आम सवाल',
      action: () => {
        alert(language === 'en' 
          ? 'FAQ: Visit the help center for common questions.' 
          : 'FAQ: सामान्य प्रश्नों के लिए सहायता केंद्र पर जाएं।');
      },
    },
  ];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full kiosk-card p-4 flex items-center justify-center gap-3 hover:border-primary/30 transition-colors bg-muted/30"
      >
        <HelpCircle className="w-6 h-6 text-primary" />
        <span className="text-lg font-semibold text-foreground">
          {language === 'en' ? 'Need Help?' : 'मदद चाहिए?'}
        </span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full mx-4 shadow-kiosk-lg animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-primary" />
                {language === 'en' ? 'Help & Support' : 'सहायता'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {helpOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className="w-full p-5 rounded-2xl border-2 border-border hover:border-primary/30 bg-background flex items-center gap-4 text-left transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <option.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center text-muted-foreground text-sm">
              {language === 'en' 
                ? 'Press the mic button for voice assistance' 
                : 'आवाज सहायता के लिए माइक बटन दबाएं'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpSupport;
