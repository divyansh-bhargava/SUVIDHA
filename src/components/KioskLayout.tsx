import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Globe, Home, LogOut, User, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import india from "/img/india-emblem.png";

interface KioskLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBackButton?: boolean;
  alwaysShowHeader?: boolean;
}

const KioskLayout: React.FC<KioskLayoutProps> = ({ 
  children, 
  showHeader = true,
  showBackButton = true,
  alwaysShowHeader = false
}) => {
  const { 
    t, 
    language, 
    setLanguage, 
    isListening, 
    setIsListening, 
    voiceTranscript,
    setVoiceTranscript,
    citizen, 
    logout,
    sessionTimeout,
    resetSessionTimeout,
    isAdmin
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Session timeout countdown
  useEffect(() => {
    if (!citizen) return;
    
    const interval = setInterval(() => {
      resetSessionTimeout();
    }, 1000);

    return () => clearInterval(interval);
  }, [citizen, resetSessionTimeout]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const isWelcomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 dark:from-slate-900 dark:to-slate-950 kiosk-mode flex flex-col relative">
      {/* Enhanced Header - Sticky Navigation */}
      {showHeader && (citizen || alwaysShowHeader) && (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-white to-green-600 px-3 md:px-6 py-3 flex items-center justify-between shadow-lg border-b-4 border-orange-600 backdrop-blur-sm">
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-2 md:gap-3">
            {showBackButton && !isWelcomePage && location.pathname !== '/dashboard' && location.pathname !== '/register' && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-2 rounded-lg md:rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-all shadow-md font-medium text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('back')}</span>
              </button>
            )}
            {location.pathname !== '/dashboard' && location.pathname !== '/register' && (
              <button
                onClick={handleHome}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg md:rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-all shadow-md"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium text-xs md:text-sm hidden sm:inline">{t('home')}</span>
              </button>
            )}
            {location.pathname === '/register' && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg md:rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white transition-all shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium text-xs md:text-sm hidden sm:inline">{t('back')}</span>
              </button>
            )}
            {/* Government Branding */}
            {location.pathname === '/dashboard' && (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img src={india} alt="Emblem of India" className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-xs md:text-sm leading-tight hidden lg:block">
                  <p className="font-bold text-slate-800">Government of India</p>
                  <p className="text-[10px] text-slate-600">Digital India Initiative</p>
                </div>
              </div>
            )}
          </div>

          {/* Center Section - SUVIDHA Branding */}
          <div className="flex items-center gap-2 md:gap-3">
            {location.pathname !== '/dashboard' && (
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <img src={india} alt="Emblem of India" className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            )}
            <div className={location.pathname === '/dashboard' ? "text-right" : "text-center"}>
              <h1 className="text-lg md:text-2xl font-black text-primary tracking-tight">SUVIDHA</h1>
              <p className="text-[8px] md:text-[10px] text-slate-600 uppercase tracking-wider">Smart Service Kiosk</p>
            </div>
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* User Info Card - Only show when logged in */}
            {citizen && (
              <div className="hidden md:flex items-center gap-3 px-3 md:px-4 py-2 rounded-xl bg-white/90 shadow-md border border-slate-200">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <div className="text-right">
                  <p className="font-semibold text-xs md:text-sm text-slate-800">{language === 'en' ? citizen.name : citizen.nameHi}</p>
                  <p className="text-[10px] md:text-xs text-slate-600">{citizen.suvidhaId}</p>
                </div>
              </div>
            )}
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 py-2 rounded-lg md:rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md"
            >
              <Globe className="w-4 h-4" />
              <span className="font-bold text-xs md:text-sm">{language === 'en' ? 'हिंदी' : 'EN'}</span>
            </button>
            
            {/* Logout - Only show when logged in */}
            {citizen && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg md:rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-xs md:text-sm hidden sm:inline">{t('logout')}</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content - With proper spacing for sticky header */}
      <main className="flex-1 overflow-auto min-h-[calc(100vh-140px)]">
        <div className="h-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      {citizen && (
        <footer className="bg-slate-100 dark:bg-slate-900 px-6 py-2.5 border-t-2 border-slate-300 dark:border-slate-800 z-10">
          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
            <p>
              {language === 'en' 
                ? '🔒 Secure session • For assistance, contact the help desk or administrator' 
                : '🔒 सुरक्षित सत्र • सहायता के लिए, हेल्प डेस्क या व्यवस्थापक से संपर्क करें'}
            </p>
            <p>© 2024 MeitY, Government of India</p>
          </div>
        </footer>
      )}

      {/* Session Timeout Warning - enhanced */}
      {citizen && sessionTimeout <= 30 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-2xl animate-pulse flex items-center gap-3 border-2 border-white">
          <span className="text-2xl">⚠️</span>
          <span className="text-lg">
            {language === 'en' 
              ? `Session ending in ${sessionTimeout}s` 
              : `सत्र ${sessionTimeout} सेकंड में समाप्त होगा`}
          </span>
        </div>
      )}
    </div>
  );
};

export default KioskLayout;
