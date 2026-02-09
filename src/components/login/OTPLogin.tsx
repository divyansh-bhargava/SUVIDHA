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
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Enter SUVIDHA ID' : 'सुविधा ID दर्ज करें'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'OTP will be sent to your registered mobile'
              : 'OTP आपके पंजीकृत मोबाइल पर भेजा जाएगा'}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
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
              className="w-full h-16 px-6 text-xl text-center tracking-wider font-mono rounded-2xl border-2 border-input bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              autoFocus
            />
            {error && (
              <p className="mt-3 text-destructive text-sm text-center bg-destructive/10 p-3 rounded-xl">{error}</p>
            )}
          </div>

          <button
            onClick={handleSendOTP}
            disabled={!suvidhaId.trim()}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            <span>{language === 'en' ? 'Send OTP' : 'OTP भेजें'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
          <MessageSquare className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Enter OTP' : 'OTP दर्ज करें'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? `6-digit code sent to ${maskedPhone}`
            : `${maskedPhone} पर 6-अंक का कोड भेजा गया`}
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-background transition-all ${
                digit 
                  ? 'border-primary bg-primary/5' 
                  : 'border-input focus:border-primary focus:ring-4 focus:ring-primary/20'
              }`}
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-xl">{error}</p>
        )}

        <button
          onClick={handleVerifyOTP}
          disabled={otp.join('').length !== 6 || isVerifying}
          className="w-full h-16 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setStep('id');
              setOtp(['', '', '', '', '', '']);
              setError('');
            }}
            className="text-primary font-medium text-sm hover:underline"
          >
            {language === 'en' ? 'Change ID' : 'ID बदलें'}
          </button>
          
          {resendTimer > 0 ? (
            <p className="text-muted-foreground text-sm">
              {language === 'en' 
                ? `Resend in ${resendTimer}s`
                : `${resendTimer}s में पुनः भेजें`}
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-primary font-medium text-sm hover:underline"
            >
              {language === 'en' ? 'Resend OTP' : 'OTP पुनः भेजें'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
