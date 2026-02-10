import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { User, MapPin, CreditCard, Settings, Sparkles } from 'lucide-react';

const CitizenWelcome: React.FC = () => {
  const { citizen, language } = useApp();

  if (!citizen) return null;

  return (
    <div className="space-y-4">
      {/* Welcome Banner with Citizen Info Combined */}
      <div className="kiosk-card overflow-hidden bg-gradient-to-br from-blue-500 via-primary to-purple-600 border-none shadow-2xl p-0">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Enhanced Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30">
                <User className="w-10 h-10 text-white" />
              </div>
              
              {/* Welcome Text & Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <p className="text-white/90 text-sm font-medium">
                    {language === 'en' ? 'Welcome back!' : 'वापसी पर स्वागत है!'}
                  </p>
                </div>
                <h2 className="text-3xl font-black text-white">
                  {language === 'en' ? citizen.name : citizen.nameHi}
                </h2>
              </div>
            </div>

            {/* Settings button */}
            <button
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-80 hover:opacity-100 hover:scale-110 border border-white/30"
              title={language === 'en' ? 'Profile Settings' : 'प्रोफ़ाइल सेटिंग्स'}
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Citizen Details */}
          <div className="flex items-center gap-6 flex-wrap">
            {/* SUVIDHA ID */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
              <CreditCard className="w-5 h-5 text-white" />
              <div>
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">
                  {language === 'en' ? 'Suvidha ID' : 'सुविधा ID'}
                </p>
                <p className="font-mono font-bold text-white text-base">
                  {citizen.suvidhaId}
                </p>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
              <MapPin className="w-5 h-5 text-white" />
              <div>
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">
                  {language === 'en' ? 'Location' : 'स्थान'}
                </p>
                <p className="font-medium text-white text-base">
                  {language === 'en' ? 'Sector 12, New Delhi' : 'सेक्टर 12, नई दिल्ली'}
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="ml-auto hidden lg:block">
              <p className="text-white/90 text-sm font-semibold italic">
                {language === 'en' 
                  ? '✨ All your government services in one place' 
                  : '✨ सभी सरकारी सेवाएं एक स्थान पर'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenWelcome;
