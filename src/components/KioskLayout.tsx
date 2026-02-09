import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Globe, Home, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface KioskLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBackButton?: boolean;
}

const KioskLayout: React.FC<KioskLayoutProps> = ({ 
  children, 
  showHeader = true,
  showBackButton = true 
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
    <div className="min-h-screen bg-background kiosk-mode flex flex-col">
      {/* Header */}
      {showHeader && citizen && (
        <header className="kiosk-header flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && !isWelcomePage && location.pathname !== '/dashboard' && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">{t('back')}</span>
              </button>
            )}
            {location.pathname !== '/dashboard' && (
              <button
                onClick={handleHome}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">{t('home')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Government Logo/Emblem placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">SUVIDHA</h1>
              <p className="text-sm opacity-80">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10">
              <User className="w-5 h-5" />
              <div className="text-right">
                <p className="font-medium text-sm">{language === 'en' ? citizen.name : citizen.nameHi}</p>
                <p className="text-xs opacity-80">{citizen.suvidhaId}</p>
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Language Switch Button */}
      {citizen && (
        <button
          onClick={toggleLanguage}
          className="fab-language bottom-6 left-6"
          aria-label={t('selectLanguage')}
        >
          <div className="flex flex-col items-center">
            <Globe className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-0.5">
              {language === 'en' ? 'हिं' : 'EN'}
            </span>
          </div>
        </button>
      )}

      {/* Session Timeout Warning - enhanced */}
      {citizen && sessionTimeout <= 30 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-3 rounded-2xl font-semibold shadow-lg animate-pulse flex items-center gap-3">
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
