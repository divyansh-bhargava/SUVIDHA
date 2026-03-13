import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import VoiceAssistantIndicator from '@/components/voice/VoiceAssistantIndicator';

const VoiceAssistantUI: React.FC = () => {
  const { language, citizen } = useApp();
  const assistant = useVoiceAssistantContext();

  // Only show on pages where citizen exists (logged in) or on welcome/login page
  return (
    <VoiceAssistantIndicator
      isActive={assistant.isActive}
      isListening={assistant.isListening}
      isSpeaking={assistant.isSpeaking}
      liveTranscript={assistant.liveTranscript}
      lastSpokenText={assistant.lastSpokenText}
      onTapMic={assistant.tapToSpeak}
      onClose={assistant.stopAssistant}
      onStart={assistant.startAssistant}
      language={language}
    />
  );
};

const VoiceAssistantProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <VoiceAssistantUI />
    </>
  );
};

export default VoiceAssistantProviderWrapper;
