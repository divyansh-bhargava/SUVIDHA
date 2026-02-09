import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export interface VoiceAssistantContextType {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  liveTranscript: string;
  lastSpokenText: string;
  startAssistant: () => void;
  stopAssistant: () => void;
  interruptAndListen: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  narratePage: (pageKey: string, extra?: Record<string, string>) => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const useVoiceAssistantContext = () => {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) throw new Error('useVoiceAssistantContext must be within VoiceAssistantProvider');
  return ctx;
};

// Page narrations
const PAGE_NARRATIONS: Record<string, { en: string; hi: string }> = {
  login_method: {
    en: 'You can log in using your SUVIDHA ID or by scanning your QR code. Please choose a login method on the screen.',
    hi: 'आप अपनी सुविधा ID या QR कोड स्कैन करके लॉगिन कर सकते हैं। कृपया स्क्रीन पर लॉगिन विधि चुनें।',
  },
  login_id_entry: {
    en: 'Please enter your SUVIDHA ID on the screen. Then press Send OTP.',
    hi: 'कृपया स्क्रीन पर अपनी सुविधा ID दर्ज करें। फिर OTP भेजें दबाएं।',
  },
  login_otp: {
    en: 'An OTP has been sent to your registered mobile number. Please enter the 6-digit OTP to verify your identity.',
    hi: 'आपके पंजीकृत मोबाइल नंबर पर OTP भेजा गया है। कृपया अपनी पहचान सत्यापित करने के लिए 6-अंक का OTP दर्ज करें।',
  },
  dashboard: {
    en: 'You are now on the main dashboard. Which service would you like to use today? You can say pay electricity bill, register a complaint, or track status.',
    hi: 'आप अब मुख्य डैशबोर्ड पर हैं। आज कौन सी सेवा चाहिए? बोलें - बिजली बिल भुगतान, शिकायत दर्ज, या स्थिति ट्रैक।',
  },
  service_select: {
    en: 'Please select the type of service you need from the options on screen.',
    hi: 'कृपया स्क्रीन पर दिखाए गए विकल्पों में से सेवा का प्रकार चुनें।',
  },
  consumer_id_entry: {
    en: 'Please enter your electricity consumer ID on the screen to fetch your bill.',
    hi: 'कृपया अपना बिजली उपभोक्ता ID स्क्रीन पर दर्ज करें ताकि बिल प्राप्त हो सके।',
  },
  bill_view: {
    en: 'Your bill details are shown on the screen. Please review the amount and press the green Pay Now button to continue.',
    hi: 'आपके बिल का विवरण स्क्रीन पर दिखाया गया है। राशि की समीक्षा करें और हरे अभी भुगतान करें बटन दबाएं।',
  },
  payment_method: {
    en: 'Please select your preferred payment method — UPI, Debit Card, or Net Banking — and complete the payment.',
    hi: 'कृपया अपनी पसंदीदा भुगतान विधि चुनें — UPI, डेबिट कार्ड, या नेट बैंकिंग — और भुगतान पूरा करें।',
  },
  payment_success: {
    en: 'Your electricity bill has been paid successfully! You can scan the QR code on screen, print the receipt, or receive it on your mobile. Thank you for using SUVIDHA.',
    hi: 'आपका बिजली बिल सफलतापूर्वक भुगतान हो गया है! आप स्क्रीन पर QR कोड स्कैन कर सकते हैं, रसीद प्रिंट कर सकते हैं, या मोबाइल पर प्राप्त कर सकते हैं। सुविधा का उपयोग करने के लिए धन्यवाद।',
  },
  session_end: {
    en: 'Session completed. Returning to home screen. Thank you for using SUVIDHA.',
    hi: 'सत्र पूरा हुआ। होम स्क्रीन पर वापस जा रहे हैं। सुविधा का उपयोग करने के लिए धन्यवाद।',
  },
  otp_error: {
    en: 'The OTP entered is incorrect. Please re-enter the correct OTP.',
    hi: 'दर्ज किया गया OTP गलत है। कृपया सही OTP दोबारा दर्ज करें।',
  },
  bill_not_found: {
    en: 'No bill was found for this consumer ID. Please check the number and try again.',
    hi: 'इस उपभोक्ता ID के लिए कोई बिल नहीं मिला। कृपया नंबर जांचें और पुनः प्रयास करें।',
  },
};

// Intent system
interface Intent {
  action: string;
  route?: string;
  response_en: string;
  response_hi: string;
  requiresAuth?: boolean;
}

const INTENTS: { keywords: string[]; intent: Intent }[] = [
  {
    keywords: ['pay electricity', 'electricity bill', 'bijli', 'bijli ka bill', 'light bill'],
    intent: { action: 'navigate', route: '/service/electricity', requiresAuth: true,
      response_en: 'Opening Electricity Bill Payment for you.', response_hi: 'बिजली बिल भुगतान खोल रहा हूँ।' },
  },
  {
    keywords: ['pay water', 'water bill', 'pani', 'pani ka bill'],
    intent: { action: 'navigate', route: '/service/water', requiresAuth: true,
      response_en: 'Opening Water Bill Payment.', response_hi: 'पानी बिल भुगतान खोल रहा हूँ।' },
  },
  {
    keywords: ['pay gas', 'gas bill', 'gas ka bill'],
    intent: { action: 'navigate', route: '/service/gas', requiresAuth: true,
      response_en: 'Opening Gas Bill Payment.', response_hi: 'गैस बिल भुगतान खोल रहा हूँ।' },
  },
  {
    keywords: ['municipal', 'nagar palika', 'nagar seva'],
    intent: { action: 'navigate', route: '/service/municipal', requiresAuth: true,
      response_en: 'Opening Municipal Services.', response_hi: 'नगरपालिका सेवाएं खोल रहा हूँ।' },
  },
  {
    keywords: ['complaint', 'register complaint', 'shikayat', 'problem'],
    intent: { action: 'navigate', route: '/complaint/register', requiresAuth: true,
      response_en: 'Opening Complaint Registration.', response_hi: 'शिकायत पंजीकरण खोल रहा हूँ।' },
  },
  {
    keywords: ['track', 'status', 'check status', 'track request', 'sthiti'],
    intent: { action: 'navigate', route: '/status', requiresAuth: true,
      response_en: 'Opening Status Tracking.', response_hi: 'स्थिति ट्रैकिंग खोल रहा हूँ।' },
  },
  {
    keywords: ['document', 'documents', 'upload', 'dastavez', 'my documents'],
    intent: { action: 'navigate', route: '/documents', requiresAuth: true,
      response_en: 'Opening your Document Vault.', response_hi: 'आपका दस्तावेज़ वॉल्ट खोल रहा हूँ।' },
  },
  {
    keywords: ['new connection', 'naya connection', 'apply connection'],
    intent: { action: 'navigate', route: '/service/electricity', requiresAuth: true,
      response_en: 'Opening new connection application.', response_hi: 'नया कनेक्शन आवेदन खोल रहा हूँ।' },
  },
  {
    keywords: ['home', 'dashboard', 'go home', 'main menu', 'mukhya menu'],
    intent: { action: 'navigate', route: '/dashboard', requiresAuth: true,
      response_en: 'Taking you to the main dashboard.', response_hi: 'मुख्य डैशबोर्ड पर ले जा रहा हूँ।' },
  },
  {
    keywords: ['help', 'what can you do', 'madad', 'kya kar sakte ho', 'options'],
    intent: { action: 'help',
      response_en: 'I can help you with: Pay electricity, water or gas bills. Register a complaint. Track your request. View documents. Just tell me what you need!',
      response_hi: 'मैं मदद कर सकता हूँ: बिल भुगतान, शिकायत, स्थिति ट्रैक, दस्तावेज़। बस बताइए!' },
  },
  {
    keywords: ['repeat', 'say again', 'dobara', 'fir se batao'],
    intent: { action: 'repeat', response_en: '', response_hi: '' },
  },
  {
    keywords: ['go back', 'back', 'vapas', 'peeche'],
    intent: { action: 'go_back',
      response_en: 'Going back.', response_hi: 'वापस जा रहा हूँ।' },
  },
  {
    keywords: ['exit', 'stop', 'close', 'band karo', 'bye', 'thank you', 'dhanyavaad'],
    intent: { action: 'exit',
      response_en: 'Voice assistant turned off. Thank you!', response_hi: 'आवाज़ सहायक बंद। धन्यवाद!' },
  },
  {
    keywords: ['login', 'log in', 'suvidha id', 'otp'],
    intent: { action: 'guide_login',
      response_en: 'To log in, please enter your SUVIDHA ID on the screen and press Send OTP. Then enter the 6-digit code sent to your mobile.',
      response_hi: 'लॉगिन करने के लिए, कृपया स्क्रीन पर अपनी सुविधा ID दर्ज करें और OTP भेजें दबाएं। फिर मोबाइल पर आया 6-अंक का कोड दर्ज करें।' },
  },
  {
    keywords: ['bill payment', 'pay bill', 'bill bharo', 'bill pay'],
    intent: { action: 'navigate', route: '/service/electricity', requiresAuth: true,
      response_en: 'Opening Bill Payment. You can pay electricity, water or gas bills.',
      response_hi: 'बिल भुगतान खोल रहा हूँ। आप बिजली, पानी या गैस बिल भर सकते हैं।' },
  },
];

const GREETING_EN = "Welcome to SUVIDHA. I can help you pay bills, apply for services, or track requests. Please tell me what you would like to do.";
const GREETING_HI = "सुविधा में आपका स्वागत है। मैं बिल भुगतान, सेवाओं के लिए आवेदन, या अनुरोध ट्रैकिंग में मदद कर सकता हूँ। कृपया बताएं आप क्या करना चाहते हैं।";

const GREETING_LOGGED_IN_EN = "Hello! I'm your voice assistant. I can help you pay bills, apply for services, or track requests. Please tell me what you would like to do.";
const GREETING_LOGGED_IN_HI = "नमस्ते! मैं आपका आवाज़ सहायक हूँ। बिल भुगतान, सेवाएँ या ट्रैकिंग के लिए बताएं आप क्या करना चाहते हैं।";

const LOGIN_REQUIRED_EN = "You need to login first. Please choose a login method on the screen — SUVIDHA ID with OTP or QR Code scan.";
const LOGIN_REQUIRED_HI = "पहले लॉगिन करना होगा। कृपया स्क्रीन पर लॉगिन विधि चुनें — सुविधा ID या QR कोड स्कैन।";

const ERROR_EN = "I didn't hear that clearly. You can say 'Pay bill', 'New connection', 'Complaint', or 'Help'.";
const ERROR_HI = "स्पष्ट सुनाई नहीं दिया। 'बिल भुगतान', 'नया कनेक्शन', 'शिकायत', या 'मदद' कहें।";

const SILENCE_EN = "I didn't hear anything. Please try again or use the touch screen.";
const SILENCE_HI = "कुछ सुनाई नहीं दिया। कृपया दोबारा प्रयास करें या टच स्क्रीन का उपयोग करें।";

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, citizen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const lastAssistantMsg = useRef('');
  const isActiveRef = useRef(false);
  const silenceCountRef = useRef(0);

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  const speakFn = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language === 'hi' ? 'hi' : 'en';
    const preferred = voices.find(v => v.lang.startsWith(langPrefix) && v.localService);
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    setLastSpokenText(text);
    lastAssistantMsg.current = text;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) recognitionRef.current.abort();

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t;
          else interimTranscript += t;
        }
        setLiveTranscript(interimTranscript || finalTranscript);
        if (finalTranscript) {
          silenceCountRef.current = 0;
          setLiveTranscript('');
          setIsListening(false);
          processCommandRef.current(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Speech error:', event.error);
        setIsListening(false);
        setLiveTranscript('');
        if (event.error === 'no-speech' && isActiveRef.current) {
          silenceCountRef.current += 1;
          if (silenceCountRef.current >= 3) {
            silenceCountRef.current = 0;
            const msg = language === 'en' ? SILENCE_EN : SILENCE_HI;
            speakFn(msg, () => startListening());
          } else {
            setTimeout(() => startListening(), 500);
          }
        }
      };

      recognition.onend = () => { setIsListening(false); };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Recognition failed:', err);
    }
  }, [language, speakFn]);

  const detectIntent = useCallback((transcript: string): Intent | null => {
    const lower = transcript.toLowerCase().trim();
    for (const { keywords, intent } of INTENTS) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) return intent;
      }
    }
    return null;
  }, []);

  const processCommand = useCallback((transcript: string) => {
    const intent = detectIntent(transcript);

    if (!intent) {
      const errMsg = language === 'en' ? ERROR_EN : ERROR_HI;
      speakFn(errMsg, () => startListening());
      return;
    }

    if (intent.requiresAuth && !citizen) {
      const msg = language === 'en' ? LOGIN_REQUIRED_EN : LOGIN_REQUIRED_HI;
      speakFn(msg, () => startListening());
      return;
    }

    switch (intent.action) {
      case 'navigate': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => {
          if (intent.route) navigate(intent.route);
          setTimeout(() => startListening(), 2500);
        });
        break;
      }
      case 'help':
      case 'guide_login': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => startListening());
        break;
      }
      case 'repeat': {
        const lastMsg = lastAssistantMsg.current || (language === 'en' ? GREETING_EN : GREETING_HI);
        speakFn(lastMsg, () => startListening());
        break;
      }
      case 'go_back': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => {
          navigate(-1);
          setTimeout(() => startListening(), 1500);
        });
        break;
      }
      case 'exit': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => stopAssistant());
        break;
      }
      default: {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => startListening());
      }
    }
  }, [language, citizen, navigate, detectIntent, speakFn, startListening]);

  const processCommandRef = useRef(processCommand);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);

  const narratePage = useCallback((pageKey: string, _extra?: Record<string, string>) => {
    if (!isActiveRef.current) return;
    const narration = PAGE_NARRATIONS[pageKey];
    if (!narration) return;
    const text = language === 'en' ? narration.en : narration.hi;
    speakFn(text, () => startListening());
  }, [language, speakFn, startListening]);

  const startAssistant = useCallback(() => {
    setIsActive(true);
    setLiveTranscript('');
    silenceCountRef.current = 0;
    const greeting = citizen
      ? (language === 'en' ? GREETING_LOGGED_IN_EN : GREETING_LOGGED_IN_HI)
      : (language === 'en' ? GREETING_EN : GREETING_HI);
    setTimeout(() => {
      speakFn(greeting, () => startListening());
    }, 300);
  }, [language, citizen, speakFn, startListening]);

  const stopAssistant = useCallback(() => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null; }
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setLiveTranscript('');
  }, []);

  const interruptAndListen = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    startListening();
  }, [startListening]);

  // Auto-narrate on route changes when active
  useEffect(() => {
    if (!isActiveRef.current) return;
    const path = location.pathname;
    if (path === '/dashboard' && citizen) {
      setTimeout(() => narratePage('dashboard'), 1000);
    } else if (path === '/complaint/register' && citizen) {
      // Could add complaint narration
    } else if (path === '/status' && citizen) {
      // Could add status tracking narration
    } else if (path === '/documents' && citizen) {
      // Could add documents narration
    }
  }, [location.pathname, citizen, narratePage]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const value: VoiceAssistantContextType = {
    isActive,
    isListening,
    isSpeaking,
    liveTranscript,
    lastSpokenText,
    startAssistant,
    stopAssistant,
    interruptAndListen,
    speak: speakFn,
    narratePage,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};
