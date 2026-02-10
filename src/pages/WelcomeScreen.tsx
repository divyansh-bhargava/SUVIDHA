import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import { Globe, QrCode, Smartphone, Shield, FileCheck, ChevronRight, ArrowLeft, Fingerprint, Mic, Hand } from 'lucide-react';
import OTPLogin from '@/components/login/OTPLogin';
import AppScanLogin from '@/components/login/AppScanLogin';
import india from "/img/india-emblem.png";

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
      <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-green-50 dark:from-slate-900 dark:to-slate-950 flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 px-6 py-3 flex items-center justify-between shadow-lg border-b-4 border-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl">
                <img src={india} alt="Emblem of India" className="w-6 h-6" />
              </span>
            </div>
            <div className="text-sm leading-tight">
              <p className="font-bold text-slate-800">Government of India</p>
              <p className="text-xs text-slate-600">Digital India Initiative</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary tracking-tight">SUVIDHA</h1>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Smart Service Kiosk</p>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-4 py-2 mb-1 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md"
            >
              <Globe className="w-4 h-4" />
              <span className="font-bold text-sm">{language === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center px-8 py-6 overflow-hidden">
          <div className="w-full max-w-5xl">
            {/* Welcome Section */}
            <div className="text-center mb-8 animate-in fade-in duration-500">
              <div className="inline-block mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl shadow-lg">
                <span className="text-5xl">🏛️</span>
              </div>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm">
                {language === 'en' ? 'Welcome to SUVIDHA' : 'सुविधा में आपका स्वागत है'}
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl font-semibold text-primary dark:text-primary mb-3">
                  {language === 'en' 
                    ? 'Smart Unified Verified Integrated Digital Hub for All' 
                    : 'स्मार्ट यूनिफाइड वेरिफाइड इंटीग्रेटेड डिजिटल हब फॉर ऑल'}
                </p>

              </div>
            </div>

            {/* Main Action Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200/50 dark:border-slate-700/50 p-4 mb-6">
              {/* Start Self-Service */}
              <div>
                
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide text-center pb-2">
                    {language === 'en' ? '🌐 Select Language to Begin' : '🌐 शुरू करने के लिए भाषा चुनें'}
                  </p>

                  <div className="grid grid-cols-4 gap-3">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        disabled={lang.code !== 'en' && lang.code !== 'hi'}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                          lang.code === 'en' || lang.code === 'hi'
                            ? 'bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-700 dark:via-slate-750 dark:to-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:scale-110 hover:-translate-y-1 active:scale-95 cursor-pointer'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span className="block text-lg font-black text-foreground mb-1">
                          {lang.nativeName}
                        </span>
                        <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                          {lang.name}
                        </span>
                        {lang.code !== 'en' && lang.code !== 'hi' && (
                          <span className="absolute top-1 right-1 text-[7px] bg-slate-300 dark:bg-slate-600 px-1 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-200 via-red-300 to-red-200 dark:from-amber-900/30 dark:to-amber-800/30 border-l-4 border-amber-500 rounded-xl px-5 py-4 shadow-lg mb-6 animate-pulse-subtle">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              <div className="relative flex items-center gap-4 justify-center">
                <div className="flex-shrink-0 w-10 h-10 bg-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  <span className="text-lg">📢</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-amber-100">
                  {language === 'en' 
                    ? 'Service Alert: Water supply maintenance scheduled for Sector 5 on 15th Feb' 
                    : 'सेवा चेतावनी: 15 फरवरी को सेक्टर 5 में पानी की आपूर्ति रखरखाव निर्धारित'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 dark:bg-slate-900 px-6 py-2.5 border-t-2 border-slate-300 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
            <p>
              {language === 'en' 
                ? 'For assistance, use Voice Help or contact the help desk' 
                : 'सहायता के लिए, वॉयस हेल्प का उपयोग करें या हेल्प डेस्क से संपर्क करें'}
            </p>
            <p>© 2024 MeitY, Government of India</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-green-50 dark:from-slate-900 dark:to-slate-950 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 px-6 py-3 flex items-center justify-between shadow-lg border-b-4 border-orange-600">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-white transition-all text-sm font-medium shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-xl">🇮🇳</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-primary tracking-tight">SUVIDHA</h1>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider">Smart Service Kiosk</p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-md"
        >
          <Globe className="w-4 h-4" />
          <span className="font-bold text-sm">{language === 'en' ? 'हिंदी' : 'EN'}</span>
        </button>
      </div>

      {/* Main Content - Fixed Height */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {!loginMethod ? (
          /* Login Method Selection - ATM Style */
          <div className="w-full max-w-4xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-4 border-primary/20 p-8">
              {/* Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-slate-200 dark:border-slate-700">
                <div className="inline-flex items-center gap-3 mb-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    {language === 'en' ? 'SECURE LOGIN' : 'सुरक्षित लॉगिन'}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Choose your preferred authentication method' : 'अपनी पसंदीदा प्रमाणीकरण विधि चुनें'}
                </p>
              </div>

              {/* Login Options Grid - ATM Style */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* OTP Login */}
                <button
                  onClick={handleChooseOTP}
                  className="group p-8 rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/8 to-primary/10 hover:from-primary hover:to-primary/90 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-200 active:scale-95"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 group-hover:bg-white/20 flex items-center justify-center transition-all shadow-lg">
                      <QrCode className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-white transition-colors mb-1">
                        {language === 'en' ? 'SUVIDHA ID + OTP' : 'सुविधा ID + OTP'}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">
                        {language === 'en' ? 'Mobile OTP verification' : 'मोबाइल OTP सत्यापन'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* App Scan */}
                <button
                  onClick={handleChooseApp}
                  className="group p-8 rounded-3xl border-4 border-accent/30 bg-gradient-to-br from-accent/5 via-accent/8 to-accent/10 hover:from-accent hover:to-accent/90 hover:border-accent hover:shadow-2xl hover:shadow-accent/30 hover:-translate-y-1 transition-all duration-200 active:scale-95"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-accent/20 group-hover:bg-white/20 flex items-center justify-center transition-all shadow-lg">
                      <Smartphone className="w-10 h-10 text-accent group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-white transition-colors mb-1">
                        {language === 'en' ? 'SUVIDHA Mobile App' : 'सुविधा मोबाइल ऐप'}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-colors">
                        {language === 'en' ? 'Scan QR with your app' : 'अपने ऐप से QR स्कैन करें'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>



              {/* Demo IDs */}
              <div className="pt-5 border-t-2 border-slate-200 dark:border-slate-700">
                <p className="text-xs text-muted-foreground text-center mb-3 font-semibold uppercase tracking-wider">
                  {language === 'en' ? '🔐 Demo Credentials for Testing' : '🔐 परीक्षण के लिए डेमो क्रेडेंशियल'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['SUV2024001234', 'MASTER', 'STAFF', 'DEPT_ELEC'].map((id) => (
                    <span key={id} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-mono border-2 border-slate-300 dark:border-slate-600 font-semibold">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : loginMethod === 'otp' ? (
          <OTPLogin onSuccess={handleLoginSuccess} />
        ) : (
          <AppScanLogin onSuccess={handleLoginSuccess} />
        )}

        {/* Floating Voice Assistant Button */}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 dark:bg-slate-900 px-6 py-2.5 border-t-2 border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
          <p>
            {language === 'en' 
              ? '🔒 Secure session • For assistance, use Voice Help or contact help desk' 
              : '🔒 सुरक्षित सत्र • सहायता के लिए, वॉयस हेल्प या हेल्प डेस्क से संपर्क करें'}
          </p>
          <p>© 2024 MeitY, Government of India</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
