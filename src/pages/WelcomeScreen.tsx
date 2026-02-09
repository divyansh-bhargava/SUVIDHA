import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import { Globe, QrCode, Smartphone, Shield, FileCheck, ChevronRight, ArrowLeft, Fingerprint, Mic, Hand } from 'lucide-react';
import OTPLogin from '@/components/login/OTPLogin';
import AppScanLogin from '@/components/login/AppScanLogin';

type LoginMethod = 'otp' | 'app' | null;
type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn';

const languageOptions: { code: SupportedLanguage; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

const WelcomeScreen: React.FC = () => {
  const { t, language, setLanguage, login } = useApp();
  const navigate = useNavigate();
  const voiceAssistant = useVoiceAssistantContext();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    setLanguage(lang === 'hi' ? 'hi' : 'en');
    setShowLogin(true);
  };

  const handleLoginSuccess = (suvidhaId: string) => {
    if (login(suvidhaId)) {
      if (['MASTER', 'DEPT_ELEC', 'DEPT_WATER', 'STAFF', 'ADMIN'].includes(suvidhaId)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleBack = () => {
    if (loginMethod) {
      setLoginMethod(null);
      // Narrate login method selection
      if (voiceAssistant.isActive) {
        voiceAssistant.narratePage('login_method');
      }
    } else {
      setShowLogin(false);
    }
  };

  const handleChooseOTP = () => {
    setLoginMethod('otp');
    if (voiceAssistant.isActive) {
      voiceAssistant.narratePage('login_id_entry');
    }
  };

  const handleChooseApp = () => {
    setLoginMethod('app');
  };

  const handleVoiceStart = () => {
    voiceAssistant.startAssistant();
  };

  // Narrate login method screen when it appears
  useEffect(() => {
    if (showLogin && !loginMethod && voiceAssistant.isActive) {
      setTimeout(() => voiceAssistant.narratePage('login_method'), 500);
    }
  }, [showLogin, loginMethod, voiceAssistant.isActive]);

  // Language Selection Screen
  if (!showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col kiosk-mode">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🇮🇳</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Government of India</p>
              <p className="text-xs text-muted-foreground">Digital India Initiative</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          {/* Logo */}
          <div className="mb-8 animate-slide-up">
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shadow-lg">
              <span className="text-7xl">🏛️</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2 tracking-tight">
              SUVIDHA
            </h1>
            <p className="text-lg text-muted-foreground">
              Unified Civic Services Platform
            </p>
          </div>

          {/* Features */}
          <div className="flex justify-center gap-8 mb-12 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            {[
              { icon: Shield, label: 'One Identity' },
              { icon: FileCheck, label: 'No Repeat Data' },
              { icon: Fingerprint, label: 'Secure Access' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Language Selection */}
          <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-primary" />
              <p className="text-lg font-medium text-foreground">
                {language === 'en' ? 'Select your language to begin' : 'शुरू करने के लिए अपनी भाषा चुनें'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="group relative p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <span className="block text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {lang.nativeName}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {lang.name}
                  </span>
                  {lang.code !== 'en' && lang.code !== 'hi' && (
                    <span className="absolute -top-1 -right-1 text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2024 Ministry of Electronics & Information Technology, Government of India
          </p>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col kiosk-mode">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🏛️</span>
          </div>
          <span className="font-semibold text-primary">SUVIDHA</span>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'en' ? 'हिंदी' : 'EN'}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {!loginMethod ? (
          /* Login Method Selection */
          <div className="w-full max-w-lg animate-slide-up">
            {/* Welcome Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'en' ? 'Welcome to SUVIDHA' : 'सुविधा में आपका स्वागत है'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'en' ? 'How would you like to proceed?' : 'आप कैसे आगे बढ़ना चाहेंगे?'}
              </p>
            </div>

            {/* Two Main Entry Paths */}
            <div className="space-y-4 mb-6">
              {/* Start Self-Service */}
              <div className="kiosk-card p-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-2 mb-3">
                  {language === 'en' ? 'Choose Login Method' : 'लॉगिन विधि चुनें'}
                </p>

                {/* OTP Login Option */}
                <button
                  onClick={handleChooseOTP}
                  className="w-full p-5 rounded-2xl hover:bg-muted transition-all group text-left flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                    <QrCode className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-lg mb-0.5">
                      {language === 'en' ? 'SUVIDHA ID + OTP' : 'सुविधा ID + OTP'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Enter your ID and verify with mobile OTP' : 'अपनी ID दर्ज करें और मोबाइल OTP से सत्यापित करें'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
                </button>

                <div className="h-px bg-border mx-4" />

                {/* App Scan Option */}
                <button
                  onClick={handleChooseApp}
                  className="w-full p-5 rounded-2xl hover:bg-muted transition-all group text-left flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all shrink-0">
                    <Smartphone className="w-7 h-7 text-accent group-hover:text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-lg mb-0.5">
                      {language === 'en' ? 'SUVIDHA Mobile App' : 'सुविधा मोबाइल ऐप'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Scan QR code using SUVIDHA app' : 'सुविधा ऐप से QR कोड स्कैन करें'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent shrink-0" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground font-medium">
                {language === 'en' ? 'or need help?' : 'या मदद चाहिए?'}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Voice Assistant Entry */}
            <button
              onClick={handleVoiceStart}
              disabled={voiceAssistant.isActive}
              className="w-full p-5 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 hover:border-accent hover:shadow-lg transition-all group text-left flex items-center gap-4 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all relative shrink-0">
                <Mic className="w-7 h-7 text-accent group-hover:text-accent-foreground" />
                {!voiceAssistant.isActive && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-accent/40 animate-ping opacity-30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg mb-0.5">
                  {language === 'en' ? '🎙️ Use Voice Help Assistant' : '🎙️ आवाज़ सहायक का उपयोग करें'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? 'I will guide you step by step through voice commands'
                    : 'मैं आपको आवाज़ से कदम दर कदम मार्गदर्शन करूंगा'}
                </p>
              </div>
            </button>

            {/* Demo Credentials */}
            <div className="mt-10 p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wide">
                {language === 'en' ? 'Demo Credentials' : 'डेमो क्रेडेंशियल्स'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['SUV2024001234', 'MASTER', 'STAFF', 'DEPT_ELEC'].map((id) => (
                  <span key={id} className="px-3 py-1.5 bg-background rounded-lg font-mono text-xs border border-border">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : loginMethod === 'otp' ? (
          <OTPLogin onSuccess={handleLoginSuccess} />
        ) : (
          <AppScanLogin onSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
