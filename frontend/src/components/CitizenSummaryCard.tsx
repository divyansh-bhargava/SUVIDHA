import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { User, MapPin, CreditCard, Settings } from 'lucide-react';

const CitizenSummaryCard: React.FC = () => {
  const { citizen, language, t } = useApp();

  if (!citizen) return null;

  return (
    <div className="kiosk-card p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-primary" />
          </div>
          
          {/* Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'en' ? citizen.name : citizen.nameHi}
            </h2>
            
            <div className="flex items-center gap-6">
              {/* SUVIDHA ID */}
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-mono font-bold text-primary text-base">
                  {citizen.suvidhaId}
                </span>
              </div>
              
              {/* City/Ward */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span className="text-base font-medium">
                  {language === 'en' ? 'Sector 12, New Delhi' : 'सेक्टर 12, नई दिल्ली'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings button - hidden for simplicity */}
        <button
          className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all opacity-60 hover:opacity-100 hover:scale-110"
          title={language === 'en' ? 'Edit Profile' : 'प्रोफ़ाइल संपादित करें'}
        >
          <Settings className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default CitizenSummaryCard;
