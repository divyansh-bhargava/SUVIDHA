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
  narrateWelcome: () => void;
  tapToSpeak: () => void;
  stopListening: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const useVoiceAssistantContext = () => {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) throw new Error('useVoiceAssistantContext must be within VoiceAssistantProvider');
  return ctx;
};

// Page narrations
const PAGE_NARRATIONS: Record<string, { en: string; hi: string }> = {
  welcome_screen: {
    en: 'Welcome to SUVIDHA. Please select your language.',
    hi: 'सुविधा में आपका स्वागत है। कृपया अपनी भाषा चुनें।',
  },
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
  // Registration flow narrations
  registration_basic_info: {
    en: 'Please enter your details to create your SUVIDHA ID. Fill in your full name as per Aadhaar, date of birth, mobile number, and residential address. Then press Next.',
    hi: 'अपनी सुविधा ID बनाने के लिए कृपया अपना विवरण दर्ज करें। आधार के अनुसार पूरा नाम, जन्म तिथि, मोबाइल नंबर और आवासीय पता भरें। फिर आगे दबाएं।',
  },
  registration_aadhaar_verify: {
    en: 'To verify your identity, please enter your 12-digit Aadhaar number. An OTP will be sent to your Aadhaar-registered mobile number.',
    hi: 'अपनी पहचान सत्यापित करने के लिए, कृपया अपना 12-अंकीय आधार नंबर दर्ज करें। आपके आधार-पंजीकृत मोबाइल नंबर पर OTP भेजा जाएगा।',
  },
  registration_otp_verify: {
    en: 'Please enter the 6-digit OTP sent to your Aadhaar-linked mobile number. For demo, you can enter any 6-digit code.',
    hi: 'कृपया अपने आधार से जुड़े मोबाइल नंबर पर भेजा गया 6-अंकीय OTP दर्ज करें। डेमो के लिए, आप कोई भी 6-अंकीय कोड दर्ज कर सकते हैं।',
  },
  registration_success: {
    en: 'Your SUVIDHA ID has been created successfully. You will receive your physical ID card by post and digital ID via SMS. You can now log in and access all civic services.',
    hi: 'आपकी सुविधा ID सफलतापूर्वक बन गई है। आपको डाक द्वारा भौतिक ID कार्ड और SMS द्वारा डिजिटल ID प्राप्त होगी। अब आप लॉगिन करके सभी नागरिक सेवाओं का उपयोग कर सकते हैं।',
  },
};

// Intent system
interface Intent {
  action: string;
  route?: string;
  response_en: string;
  response_hi: string;
  requiresAuth?: boolean;
  languageCode?: 'en' | 'hi';
  serviceAction?: string;
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
    keywords: ['create suvidha', 'register', 'new id', 'sign up', 'create id', 'naya id banao', 'registration'],
    intent: { action: 'navigate', route: '/register',
      response_en: 'Opening SUVIDHA ID registration. You will need your Aadhaar for verification.',
      response_hi: 'सुविधा ID पंजीकरण खोल रहा हूँ। सत्यापन के लिए आपको अपने आधार की आवश्यकता होगी।' },
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
    keywords: ['suvidha id', 'by suvidha id', 'suvidha id se', 'otp login', 'login with id', 'id se login'],
    intent: { action: 'select_suvidha_login',
      response_en: 'Opening SUVIDHA ID login. Please enter your ID.',
      response_hi: 'सुविधा ID लॉगिन खोल रहा हूँ। कृपया अपनी ID दर्ज करें।' },
  },
  {
    keywords: ['login', 'log in'],
    intent: { action: 'guide_login',
      response_en: 'To log in, please enter your SUVIDHA ID on the screen and press Send OTP. Then enter the 6-digit code sent to your mobile.',
      response_hi: 'लॉगिन करने के लिए, कृपया स्क्रीन पर अपनी सुविधा ID दर्ज करें और OTP भेजें दबाएं। फिर मोबाइल पर आया 6-अंक का कोड दर्ज करें।' },
  },
  {
    keywords: ['english', 'angrezi', 'अंग्रेजी', 'select english', 'i want english'],
    intent: { action: 'select_language', route: '/', languageCode: 'en',
      response_en: 'English selected. Taking you to the login page.',
      response_hi: 'अंग्रेजी चुनी गई। लॉगिन पेज पर ले जा रहा हूँ।' },
  },
  {
    keywords: ['hindi', 'हिंदी', 'hindī', 'select hindi', 'i want hindi', 'mujhe hindi chahiye'],
    intent: { action: 'select_language', route: '/', languageCode: 'hi',
      response_en: 'Hindi selected. Taking you to the login page.',
      response_hi: 'हिंदी चुनी गई। लॉगिन पेज पर ले जा रहा हूँ।' },
  },
  {
    keywords: ['bill payment', 'pay bill', 'bill bharo', 'bill pay'],
    intent: { action: 'navigate', route: '/service/electricity', requiresAuth: true,
      response_en: 'Opening Bill Payment. You can pay electricity, water or gas bills.',
      response_hi: 'बिल भुगतान खोल रहा हूँ। आप बिजली, पानी या गैस बिल भर सकते हैं।' },
  },
  // Service page specific actions (when inside a service page)
  {
    keywords: ['pay bill', 'pay my bill', 'bill payment', 'bill bharo', 'bhugtan', 'mera bill'],
    intent: { action: 'service_action', serviceAction: 'bill_payment', requiresAuth: true,
      response_en: 'Opening Bill Payment.',
      response_hi: 'बिल भुगतान खोल रहा हूँ।' },
  },
  {
    keywords: ['new connection', 'naya connection', 'apply connection', 'connection lena'],
    intent: { action: 'service_action', serviceAction: 'new_connection', requiresAuth: true,
      response_en: 'Opening New Connection application. You will need to upload identity proof, address proof, and property documents.',
      response_hi: 'नया कनेक्शन आवेदन खोल रहा हूँ। आपको पहचान प्रमाण, पता प्रमाण, और संपत्ति दस्तावेज़ अपलोड करने होंगे।' },
  },
  {
    keywords: ['disconnection', 'disconnect', 'band karna', 'connection band'],
    intent: { action: 'service_action', serviceAction: 'disconnection', requiresAuth: true,
      response_en: 'Opening Disconnection request. You will need identity proof.',
      response_hi: 'कनेक्शन बंद करने का अनुरोध खोल रहा हूँ। आपको पहचान प्रमाण अपलोड करना होगा।' },
  },
  {
    keywords: ['name transfer', 'transfer name', 'naam badalna', 'naam transfer'],
    intent: { action: 'service_action', serviceAction: 'name_transfer', requiresAuth: true,
      response_en: 'Opening Name Transfer request. You will need identity proof of both parties and property transfer documents.',
      response_hi: 'नाम हस्तांतरण अनुरोध खोल रहा हूँ। आपको दोनों पक्षों की पहचान और संपत्ति दस्तावेज़ अपलोड करने होंगे।' },
  },
  {
    keywords: ['load change', 'load badalna', 'increase load', 'decrease load', 'load badhana', 'load ghatana'],
    intent: { action: 'service_action', serviceAction: 'load_change', requiresAuth: true,
      response_en: 'Opening Load Change request. You will need identity proof and load change application.',
      response_hi: 'लोड परिवर्तन अनुरोध खोल रहा हूँ। आपको पहचान प्रमाण और आवेदन अपलोड करना होगा।' },
  },
];

const GREETING_EN = "Welcome to SUVIDHA. I can help you pay bills, apply for services, or track requests. Please tell me what you would like to do.";
const GREETING_HI = "सुविधा में आपका स्वागत है। मैं बिल भुगतान, सेवाओं के लिए आवेदन, या अनुरोध ट्रैकिंग में मदद कर सकता हूँ। कृपया बताएं आप क्या करना चाहते हैं।";

const GREETING_LOGGED_IN_EN = "Hello! I'm your voice assistant. I can help you pay bills, apply for services, or track requests. Please tell me what you would like to do.";
const GREETING_LOGGED_IN_HI = "नमस्ते! मैं आपका आवाज़ सहायक हूँ। बिल भुगतान, सेवाएँ या ट्रैकिंग के लिए बताएं आप क्या करना चाहते हैं।";

const LOGIN_REQUIRED_EN = "You need to login first. Please choose a login method on the screen — SUVIDHA ID with OTP or QR Code scan.";
const LOGIN_REQUIRED_HI = "पहले लॉगिन करना होगा। कृपया स्क्रीन पर लॉगिन विधि चुनें — सुविधा ID या QR कोड स्कैन।";

const ERROR_EN = "I didn't understand that. You can say 'Pay bill', 'New connection', 'Complaint', or 'Help'.";
const ERROR_HI = "समझ नहीं आया। 'बिल भुगतान', 'नया कनेक्शन', 'शिकायत', या 'मदद' कहें।";

const SILENCE_EN = "Listening stopped. Tap the microphone when you want to speak.";
const SILENCE_HI = "सुनना बंद। बोलने के लिए माइक्रोफोन टैप करें।";

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, setVoiceLanguageSelected, setVoiceSuvidhaIdSelected, setVoiceServiceAction, bills, citizen } = useApp();
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
        // On no-speech or other errors, just stop listening quietly
        // User can tap to speak again when ready
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
          // Don't auto-listen after navigation
        });
        break;
      }
      case 'help':
      case 'guide_login': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response);
        // Don't auto-listen - user taps when ready
        break;
      }
      case 'repeat': {
        const lastMsg = lastAssistantMsg.current || (language === 'en' ? GREETING_EN : GREETING_HI);
        speakFn(lastMsg);
        // Don't auto-listen
        break;
      }
      case 'go_back': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => {
          navigate(-1);
        });
        break;
      }
      case 'exit': {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => stopAssistant());
        break;
      }
      case 'select_language': {
        if (intent.languageCode) {
          setLanguage(intent.languageCode);
          setVoiceLanguageSelected(true);
        }
        const response = intent.languageCode === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response, () => {
          navigate('/');
        });
        break;
      }
      case 'select_suvidha_login': {
        setVoiceSuvidhaIdSelected(true);
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response);
        break;
      }
      case 'service_action': {
        if (intent.serviceAction) {
          setVoiceServiceAction(intent.serviceAction);
          let response = language === 'en' ? intent.response_en : intent.response_hi;
          
          // If bill payment, announce the bill amount
          if (intent.serviceAction === 'bill_payment') {
            const path = location.pathname;
            let serviceType = 'electricity';
            if (path.includes('/service/water')) serviceType = 'water';
            else if (path.includes('/service/gas')) serviceType = 'gas';
            
            const bill = bills.find(b => b.service === serviceType && b.status === 'unpaid');
            if (bill) {
              const amountStr = bill.amount.toLocaleString('en-IN');
              response = language === 'en' 
                ? `Opening Bill Payment. Your ${serviceType} bill is ${amountStr} rupees for ${bill.period}.`
                : `बिल भुगतान खोल रहा हूँ। आपका ${serviceType === 'electricity' ? 'बिजली' : serviceType === 'water' ? 'पानी' : 'गैस'} बिल ${amountStr} रुपये है ${bill.period} के लिए।`;
            }
          }
          speakFn(response);
        }
        break;
      }
      default: {
        const response = language === 'en' ? intent.response_en : intent.response_hi;
        speakFn(response);
        // Don't auto-listen
      }
    }
  }, [language, citizen, navigate, detectIntent, speakFn]);

  const processCommandRef = useRef(processCommand);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);

  // Bilingual welcome narration (speaks both English and Hindi)
  const narrateWelcome = useCallback(() => {
    if (!isActiveRef.current) return;
    const bilingualText = 'Welcome to SUVIDHA. Please select your language. ... सुविधा में आपका स्वागत है। कृपया अपनी भाषा चुनें।';
    speakFn(bilingualText);
    // Don't auto-listen - user will tap to speak when ready
  }, [speakFn]);

  const narratePage = useCallback((pageKey: string, _extra?: Record<string, string>) => {
    if (!isActiveRef.current) return;
    const narration = PAGE_NARRATIONS[pageKey];
    if (!narration) return;
    const text = language === 'en' ? narration.en : narration.hi;
    speakFn(text);
    // Don't auto-listen - user will tap to speak when ready
  }, [language, speakFn]);

  const startAssistant = useCallback(() => {
    setIsActive(true);
    setLiveTranscript('');
    silenceCountRef.current = 0;
    const greeting = citizen
      ? (language === 'en' ? GREETING_LOGGED_IN_EN : GREETING_LOGGED_IN_HI)
      : (language === 'en' ? GREETING_EN : GREETING_HI);
    setTimeout(() => {
      speakFn(greeting);
      // Don't auto-listen - user taps mic when ready to speak
    }, 300);
  }, [language, citizen, speakFn]);

  const stopAssistant = useCallback(() => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null; }
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setLiveTranscript('');
  }, []);

  // Tap to speak - user initiates listening manually
  const tapToSpeak = useCallback(() => {
    if (!isActiveRef.current) {
      // If assistant not active, start it first
      setIsActive(true);
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Start listening
    startListening();
  }, [startListening]);

  // Stop listening manually
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
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
    if (path === '/' || path === '/welcome') {
      setTimeout(() => narrateWelcome(), 500);
    } else if (path === '/dashboard' && citizen) {
      setTimeout(() => narratePage('dashboard'), 1000);
    } else if (path === '/complaint/register' && citizen) {
      // Could add complaint narration
    } else if (path === '/status' && citizen) {
      // Could add status tracking narration
    } else if (path === '/documents' && citizen) {
      // Could add documents narration
    }
  }, [location.pathname, citizen, narratePage, narrateWelcome]);

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
    narrateWelcome,
    tapToSpeak,
    stopListening,
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};
