import React from 'react';
import { Mic, MicOff, Volume2, X, Radio, Headphones } from 'lucide-react';

interface VoiceAssistantIndicatorProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  liveTranscript: string;
  lastSpokenText: string;
  onTapMic: () => void;
  onClose: () => void;
  onStart: () => void;
  language: string;
}

const VoiceAssistantIndicator: React.FC<VoiceAssistantIndicatorProps> = ({
  isActive,
  isListening,
  isSpeaking,
  liveTranscript,
  lastSpokenText,
  onTapMic,
  onClose,
  onStart,
  language,
}) => {
  // Floating button when inactive
  if (!isActive) {
    return (
      <button
        onClick={onStart}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:brightness-110 transition-all active:scale-95 animate-slide-up"
        aria-label={language === 'en' ? 'Voice Assistant' : 'आवाज़ सहायक'}
      >
        <Headphones className="w-5 h-5" />
        <span className="font-semibold text-sm">
          {language === 'en' ? 'Voice Help' : 'आवाज़ मदद'}
        </span>
      </button>
    );
  }

  // Active bottom bar
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-xl">
        <div className="mx-4 mb-4 flex items-center gap-3 px-5 py-4 rounded-2xl bg-card border border-border shadow-lg backdrop-blur-sm">
          {/* Status icon */}
          {isSpeaking ? (
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0 relative">
              <Volume2 className="w-6 h-6 text-accent" />
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
            </div>
          ) : (
            <button
              onClick={onTapMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                isListening
                  ? 'bg-destructive text-destructive-foreground voice-listening'
                  : 'bg-accent text-accent-foreground hover:brightness-110'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-accent shrink-0" />
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                {language === 'en' ? 'Voice Assistant' : 'आवाज़ सहायक'}
              </p>
            </div>
            <p className="text-sm text-foreground mt-0.5 truncate">
              {isSpeaking
                ? (lastSpokenText ? `"${lastSpokenText.slice(0, 80)}${lastSpokenText.length > 80 ? '...' : ''}"` : (language === 'en' ? 'Speaking...' : 'बोल रहा है...'))
                : isListening
                  ? (liveTranscript ? `"${liveTranscript}"` : (language === 'en' ? '🎙️ Listening — speak now...' : '🎙️ सुन रहा है — अब बोलें...'))
                  : (language === 'en' ? 'Tap mic or speak a command' : 'माइक दबाएं या बोलें')}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantIndicator;
