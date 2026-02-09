import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import { Send, Shield, CheckCircle2, MessageSquare } from 'lucide-react';

interface OTPLoginProps {
  onSuccess: (suvidhaId: string) => void;
}

const OTPLogin: React.FC<OTPLoginProps> = ({ onSuccess }) => {
  const { language } = useApp();
  const voiceAssistant = useVoiceAssistantContext();
  const [step, setStep] = useState<'id' | 'otp'>('id');
  const [suvidhaId, setSuvidhaId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validIds = ['SUV2024001234', 'MASTER', 'DEPT_ELEC', 'DEPT_WATER', 'STAFF', 'ADMIN'];

  const handleSendOTP = () => {
    if (!suvidhaId.trim()) {
      setError(language === 'en' ? 'Please enter your SUVIDHA ID' : 'कृपया अपनी सुविधा ID दर्ज करें');
      return;
    }

    if (!validIds.includes(suvidhaId.toUpperCase())) {
      setError(language === 'en' 
        ? 'Invalid ID. Try: SUV2024001234 or MASTER' 
        : 'अमान्य ID। प्रयास करें: SUV2024001234 या MASTER');
      return;
    }

    setMaskedPhone('+91 98XXX XX210');
    setStep('otp');
    setResendTimer(30);
    setError('');
    // Voice narration for OTP step
    if (voiceAssistant.isActive) {
      voiceAssistant.narratePage('login_otp');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(language === 'en' ? 'Please enter complete OTP' : 'कृपया पूर्ण OTP दर्ज करें');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess(suvidhaId.toUpperCase());
    }, 1500);
  };

  const handleResendOTP = () => {
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
  };

  if (step === 'id') {
    return (
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-lg border-2 border-primary/20 animate-pulse-subtle">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {language === 'en' ? 'Enter SUVIDHA ID' : 'सुविधा ID दर्ज करें'}
            </h2>
            <p className="text-base text-muted-foreground">
              {language === 'en' 
                ? 'OTP will be sent to your registered mobile'
                : 'OTP आपके पंजीकृत मोबाइल पर भेजा जाएगा'}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                {language === 'en' ? 'SUVIDHA ID' : 'सुविधा ID'}
              </label>
              <input
                type="text"
                value={suvidhaId}
                onChange={(e) => {
                  setSuvidhaId(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="SUV2024XXXXXX"
                className="w-full h-16 px-6 text-xl text-center tracking-wider font-mono rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/30 transition-all shadow-sm hover:shadow-md"
                autoFocus
              />
              {error && (
                <div className="mt-2 text-destructive text-xs text-center bg-destructive/10 p-2 rounded-lg border border-destructive/20 animate-in">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleSendOTP}
              disabled={!suvidhaId.trim()}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground font-bold text-base flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>{language === 'en' ? 'Send OTP' : 'OTP भेजें'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in duration-500">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 shadow-lg border-2 border-accent/20 animate-pulse-subtle">
            <MessageSquare className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Enter OTP' : 'OTP दर्ज करें'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? `6-digit code sent to ${maskedPhone}`
              : `${maskedPhone} पर 6-अंक का कोड भेजा गया`}
          </p>
        </div>

        <div className="space-y-4">
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all duration-200 shadow-sm ${
                  digit 
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20 scale-105' 
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/30 hover:shadow-md'
                }`}
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="text-destructive text-xs text-center bg-destructive/10 p-2 rounded-lg border border-destructive/20 animate-in">
              {error}
            </div>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={otp.join('').length !== 6 || isVerifying}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-accent via-accent/95 to-accent/90 text-accent-foreground font-bold text-base flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                <span>{language === 'en' ? 'Verifying...' : 'सत्यापन हो रहा है...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{language === 'en' ? 'Verify & Login' : 'सत्यापित करें और लॉगिन करें'}</span>
              </>
            )}
          </button>

          {/* Resend & Change ID */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setStep('id');
                setOtp(['', '', '', '', '', '']);
                setError('');
              }}
              className="text-primary font-semibold text-xs hover:underline flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
            >
              <span>←</span>
              <span>{language === 'en' ? 'Change ID' : 'ID बदलें'}</span>
            </button>
            
            {resendTimer > 0 ? (
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs bg-muted px-2 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                <span>
                  {language === 'en' 
                    ? `Resend in ${resendTimer}s`
                    : `${resendTimer}s में पुनः भेजें`}
                </span>
              </div>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-primary font-semibold text-xs hover:underline px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              >
                {language === 'en' ? '🔄 Resend OTP' : '🔄 OTP पुनः भेजें'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
