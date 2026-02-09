import React from 'react';
import { Mic, Headphones } from 'lucide-react';

interface VoiceAssistantButtonProps {
  onClick: () => void;
  language: string;
  variant?: 'welcome' | 'floating';
}

const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({
  onClick,
  language,
  variant = 'welcome',
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:brightness-110 transition-all active:scale-95 animate-slide-up"
        aria-label={language === 'en' ? 'Voice Assistant' : 'आवाज़ सहायक'}
      >
        <Headphones className="w-5 h-5" />
        <span className="font-semibold text-sm">
          {language === 'en' ? 'Voice Help' : 'आवाज़ मदद'}
        </span>
      </button>
    );
  }

  // Welcome screen variant - large card button
  return (
    <button
      onClick={onClick}
      className="w-full p-6 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 hover:border-accent hover:shadow-lg transition-all group text-left flex items-center gap-5 active:scale-[0.98]"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all relative">
        <Mic className="w-8 h-8 text-accent group-hover:text-accent-foreground" />
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-accent/40 animate-ping opacity-30" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-foreground text-lg mb-1">
          {language === 'en' ? 'Use Voice Help Assistant' : 'आवाज़ सहायक का उपयोग करें'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Speak to navigate — I will guide you step by step'
            : 'बोलकर नेविगेट करें — मैं आपको कदम दर कदम गाइड करूंगा'}
        </p>
      </div>
      <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
        <Mic className="w-6 h-6" />
      </div>
    </button>
  );
};

export default VoiceAssistantButton;
