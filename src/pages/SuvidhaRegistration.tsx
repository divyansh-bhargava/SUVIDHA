import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import KioskLayout from '@/components/KioskLayout';
import { User, Phone, MapPin, Calendar, CreditCard, CheckCircle2, Loader2, Shield, Home, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type RegistrationStep = 'basic_info' | 'aadhaar_verify' | 'otp_verify' | 'processing' | 'success';

// Memoized step components to prevent re-renders
interface StepProps {
  language: string;
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  address: string;
  aadhaarNumber: string;
  otp: string;
  otpError: string;
  generatedSuvidhaId: string;
  isBasicInfoValid: () => boolean;
  isAadhaarValid: () => boolean;
  isOtpValid: () => boolean;
  handleFullNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateOfBirthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMobileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleAadhaarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBasicInfoNext: () => void;
  handleSendOtp: () => void;
  handleVerifyOtp: () => void;
  handleResendOtp: () => void;
  handleBack: () => void;
  handleGoHome: () => void;
  handleLoginWithSuvidha: () => void;
  formatAadhaar: (value: string) => string;
}

const BasicInfoStepComponent: React.FC<StepProps> = memo(({
  language,
  fullName,
  dateOfBirth,
  mobileNumber,
  address,
  handleFullNameChange,
  handleDateOfBirthChange,
  handleMobileChange,
  handleAddressChange,
  isBasicInfoValid,
  handleBasicInfoNext,
}) => (
  <div className="space-y-6 animate-scale-in">
    <div className="kiosk-card">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language === 'en' ? 'Basic Information' : 'मूल जानकारी'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? 'Enter your details as per Aadhaar' : 'आधार के अनुसार विवरण दर्ज करें'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {language === 'en' ? 'Full Name' : 'पूरा नाम'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={handleFullNameChange}
            placeholder={language === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
            className="h-12 text-base focus:outline-none"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {language === 'en' ? 'Date of Birth' : 'जन्म तिथि'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
            className="h-12 text-base focus:outline-none"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-muted-foreground font-semibold text-sm">
              +91
            </span>
            <Input
              type="tel"
              value={mobileNumber}
              onChange={handleMobileChange}
              placeholder="9876543210"
              className="h-12 text-base rounded-l-none focus:outline-none"
              maxLength={10}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'en' ? '10-digit mobile number' : '10-अंकीय मोबाइल नंबर'}
          </p>
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {language === 'en' ? 'Residential Address' : 'आवासीय पता'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={address}
            onChange={handleAddressChange}
            placeholder={language === 'en' ? 'Enter complete address with PIN code' : 'पिन कोड सहित पूरा पता दर्ज करें'}
            className="w-full h-20 px-3 py-2 text-base border border-border rounded-lg focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>

    <Button
      onClick={handleBasicInfoNext}
      disabled={!isBasicInfoValid()}
      className="w-full h-12 text-lg font-semibold"
    >
      {language === 'en' ? 'Next' : 'आगे'} <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
  </div>
));

BasicInfoStepComponent.displayName = 'BasicInfoStep';

const SuvidhaRegistration: React.FC = () => {
  const { t, language } = useApp();
  const navigate = useNavigate();
  const voiceAssistant = useVoiceAssistantContext();

  const [step, setStep] = useState<RegistrationStep>('basic_info');
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generatedSuvidhaId, setGeneratedSuvidhaId] = useState('');

  // Validation functions
  const isBasicInfoValid = useCallback(() => {
    const nameValid = fullName.trim().length >= 3;
    const dobValid = dateOfBirth !== '';
    const phoneValid = /^\d{10}$/.test(mobileNumber);
    const addressValid = address.trim().length >= 10;
    return nameValid && dobValid && phoneValid && addressValid;
  }, [fullName, dateOfBirth, mobileNumber, address]);

  const isAadhaarValid = useCallback(() => {
    return /^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''));
  }, [aadhaarNumber]);

  const isOtpValid = useCallback(() => {
    return /^\d{6}$/.test(otp);
  }, [otp]);

  // Memoized handlers to prevent focus loss on re-render
  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  }, []);

  const handleDateOfBirthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateOfBirth(e.target.value);
  }, []);

  const handleMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
  }, []);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
  }, []);

  const handleAadhaarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarNumber(e.target.value.replace(/\D/g, ''));
  }, []);

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
    setOtpError('');
  }, []);

  // Voice narration on step changes
  useEffect(() => {
    if (!voiceAssistant.isActive) return;
    const timer = setTimeout(() => {
      voiceAssistant.narratePage(`registration_${step}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [step, voiceAssistant.isActive]);

  const handleBasicInfoNext = useCallback(() => {
    if (isBasicInfoValid()) {
      setStep('aadhaar_verify');
    }
  }, [isBasicInfoValid]);

  const handleSendOtp = useCallback(() => {
    if (isAadhaarValid()) {
      setOtpError('');
      setOtp('');
      setStep('otp_verify');
      // Voice narration
      if (voiceAssistant.isActive) {
        const msg = language === 'en' 
          ? 'OTP sent to your Aadhaar registered mobile number. Please enter the 6-digit code.'
          : 'आधार पंजीकृत मोबाइल नंबर पर OTP भेजा गया है। कृपया 6-अंकीय कोड दर्ज करें।';
        voiceAssistant.speak(msg);
      }
    }
  }, [isAadhaarValid, voiceAssistant, language]);

  const handleVerifyOtp = useCallback(() => {
    if (isOtpValid()) {
      setStep('processing');
      // Simulate backend processing
      setTimeout(() => {
        // Generate SUVIDHA ID
        const id = `SUV${new Date().getFullYear()}${String(Math.floor(Math.random() * 900000) + 100000)}`;
        setGeneratedSuvidhaId(id);
        setStep('success');
        
        // Voice success message
        if (voiceAssistant.isActive) {
          const msg = language === 'en'
            ? `Your SUVIDHA ID has been created successfully. Your ID is ${id}. You will receive it by post and SMS. You can now log in and access all civic services.`
            : `आपकी सुविधा ID सफलतापूर्वक बन गई है। आपकी ID है ${id}। आपको डाक और SMS द्वारा प्राप्त होगी। अब आप लॉगिन करके सभी सेवाओं का उपयोग कर सकते हैं।`;
          voiceAssistant.speak(msg);
        }
      }, 3000);
    } else {
      setOtpError(language === 'en' ? 'Please enter a valid 6-digit OTP' : 'कृपया वैध 6-अंकीय OTP दर्ज करें');
    }
  }, [isOtpValid, voiceAssistant, language]);

  const handleResendOtp = useCallback(() => {
    setOtp('');
    setOtpError('');
    if (voiceAssistant.isActive) {
      const msg = language === 'en' ? 'OTP resent to your mobile number.' : 'OTP आपके मोबाइल नंबर पर पुनः भेजा गया।';
      voiceAssistant.speak(msg);
    }
  }, [voiceAssistant, language]);

  const handleLoginWithSuvidha = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'aadhaar_verify':
        setStep('basic_info');
        break;
      case 'otp_verify':
        setStep('aadhaar_verify');
        setOtp('');
        setOtpError('');
        break;
      default:
        navigate('/');
    }
  }, [step, navigate]);

  // Format Aadhaar number with spaces
  const formatAadhaar = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  }, []);

  // Step indicator
  const StepIndicator = useMemo(() => () => {
    const steps = [
      { id: 'basic_info', num: 1 },
      { id: 'aadhaar_verify', num: 2 },
      { id: 'otp_verify', num: 3 },
      { id: 'success', num: 4 },
    ];
    const currentIndex = steps.findIndex(s => s.id === step || (step === 'processing' && s.id === 'success'));

    return (
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              idx < currentIndex ? 'bg-green-600 text-white' :
              idx === currentIndex ? 'bg-primary text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {idx < currentIndex ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-1 rounded ${idx < currentIndex ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }, [step]);

  // Step 1: Basic Information
  const BasicInfoStep = () => (
    <div className="space-y-6 animate-scale-in">
      <div className="kiosk-card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? 'Basic Information' : 'मूल जानकारी'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Enter your details as per Aadhaar' : 'आधार के अनुसार विवरण दर्ज करें'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              {language === 'en' ? 'Full Name' : 'पूरा नाम'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              placeholder={language === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
              className="h-12 text-base focus:outline-none"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              {language === 'en' ? 'Date of Birth' : 'जन्म तिथि'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={handleDateOfBirthChange}
              className="h-12 text-base focus:outline-none"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              {language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-muted-foreground font-semibold text-sm">
                +91
              </span>
              <Input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="9876543210"
                className="h-12 text-base rounded-l-none focus:outline-none"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'en' ? '10-digit mobile number' : '10-अंकीय मोबाइल नंबर'}
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              {language === 'en' ? 'Residential Address' : 'आवासीय पता'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={address}
              onChange={handleAddressChange}
              placeholder={language === 'en' ? 'Enter complete address with PIN code' : 'पिन कोड सहित पूरा पता दर्ज करें'}
              className="w-full h-20 px-3 py-2 text-base border border-border rounded-lg focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleBasicInfoNext}
        disabled={!isBasicInfoValid()}
        className="w-full h-12 text-lg font-semibold"
      >
        {language === 'en' ? 'Next' : 'आगे'} <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  // Step 2: Aadhaar Verification
  const AadhaarVerifyStep = () => (
    <div className="space-y-6 animate-scale-in">
      <div className="kiosk-card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? 'Aadhaar Verification' : 'आधार सत्यापन'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Verify with OTP' : 'OTP से सत्यापित करें'}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {language === 'en'
              ? 'Enter your 12-digit Aadhaar number. An OTP will be sent to your registered mobile.'
              : 'अपना 12-अंकीय आधार नंबर दर्ज करें। आपके पंजीकृत मोबाइल पर OTP भेजा जाएगा।'}
          </p>
        </div>

        {/* Aadhaar Input */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {language === 'en' ? 'Aadhaar Number' : 'आधार नंबर'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            type="text"
            value={formatAadhaar(aadhaarNumber)}
            onChange={handleAadhaarChange}
            placeholder="XXXX XXXX XXXX"
            className="h-12 text-lg text-center tracking-wider font-mono focus:outline-none"
            maxLength={14}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {language === 'en' ? '12-digit Aadhaar number' : '12-अंकीय आधार नंबर'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 text-base font-semibold"
        >
          {language === 'en' ? 'Back' : 'वापस'}
        </Button>
        <Button
          onClick={handleSendOtp}
          disabled={!isAadhaarValid()}
          className="flex-1 h-12 text-base font-semibold"
        >
          {language === 'en' ? 'Send OTP' : 'OTP भेजें'}
        </Button>
      </div>
    </div>
  );

  // Step 3: OTP Verification
  const OtpVerifyStep = () => (
    <div className="space-y-6 animate-scale-in">
      <div className="kiosk-card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? 'Enter OTP' : 'OTP दर्ज करें'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? `OTP sent to ****${mobileNumber.slice(-4)}`
                : `****${mobileNumber.slice(-4)} पर OTP भेजा गया`}
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 text-center">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {language === 'en' ? '💡 Enter any 6-digit code for demo' : '💡 डेमो के लिए कोई भी 6-अंकीय कोड दर्ज करें'}
          </p>
        </div>

        {/* OTP Input */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block text-center">
            {language === 'en' ? '6-Digit OTP' : '6-अंकीय OTP'}
          </label>
          <Input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="● ● ● ● ● ●"
            className="h-14 text-3xl text-center tracking-[0.8em] font-mono focus:outline-none"
            maxLength={6}
          />
          {otpError && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center mt-2">{otpError}</p>
          )}
        </div>

        {/* Resend */}
        <div className="text-center mt-4">
          <button
            onClick={handleResendOtp}
            className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-2"
          >
            {language === 'en' ? 'Resend OTP' : 'OTP पुनः भेजें'}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 text-base font-semibold"
        >
          {language === 'en' ? 'Back' : 'वापस'}
        </Button>
        <Button
          onClick={handleVerifyOtp}
          disabled={!isOtpValid()}
          className="flex-1 h-12 text-base font-semibold"
        >
          {language === 'en' ? 'Verify' : 'सत्यापित करें'}
        </Button>
      </div>
    </div>
  );

  // Step 4: Processing
  const ProcessingStep = () => (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Creating your SUVIDHA ID...' : 'आपकी सुविधा ID बनाई जा रही है...'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Please wait a moment' : 'कृपया थोड़ी प्रतीक्षा करें'}
        </p>
      </div>
    </div>
  );

  // Step 5: Success
  const SuccessStep = () => (
    <div className="space-y-6 animate-scale-in">
      <div className="kiosk-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
            {language === 'en' ? 'ID Created Successfully!' : 'ID सफलतापूर्वक बनाई गई!'}
          </h2>
        </div>

        {/* Generated ID Display */}
        <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 dark:from-orange-950/20 dark:via-slate-900 dark:to-green-950/20 border-2 border-green-300 dark:border-green-800 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'en' ? 'Your SUVIDHA ID' : 'आपकी सुविधा ID'}
          </p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-wider font-mono">
            {generatedSuvidhaId}
          </p>
        </div>

        {/* Information Cards */}
        <div className="space-y-3 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                {language === 'en' ? 'Physical ID Card' : 'भौतिक ID कार्ड'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en'
                  ? 'Delivered to your address in 7-10 days'
                  : '7-10 दिनों में आपके पते पर पहुंचाया जाएगा'}
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                {language === 'en' ? 'Digital ID via SMS' : 'SMS द्वारा डिजिटल ID'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en'
                  ? 'Received on your registered mobile'
                  : 'आपके पंजीकृत मोबाइल पर प्राप्त'}
              </p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                {language === 'en' ? 'Use Services Immediately' : 'तुरंत सेवाएं उपयोग करें'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en'
                  ? 'Start using all services after login'
                  : 'लॉगिन के बाद सभी सेवाओं का उपयोग करें'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleGoHome}
          variant="outline"
          className="flex-1 h-12 text-base font-semibold"
        >
          <Home className="w-5 h-5 mr-2" />
          {language === 'en' ? 'Home' : 'होम'}
        </Button>
        <Button
          onClick={handleLoginWithSuvidha}
          className="flex-1 h-12 text-base font-semibold"
        >
          {language === 'en' ? 'Login Now' : 'अब लॉगिन करें'} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <KioskLayout alwaysShowHeader={true}>
      <div className="p-8 max-w-2xl mx-auto py-12">
        {/* Header Banner */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-white shadow-md animate-slide-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {language === 'en' ? 'Create SUVIDHA ID' : 'सुविधा ID बनाएं'}
              </h1>
              <p className="text-white/80 text-sm">
                {language === 'en' ? 'Complete registration in 5 minutes' : '5 मिनट में पंजीकरण पूरा करें'}
              </p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <StepIndicator />
          </div>
        </div>

        {/* Content */}
        {step === 'basic_info' && <BasicInfoStep />}
        {step === 'aadhaar_verify' && <AadhaarVerifyStep />}
        {step === 'otp_verify' && <OtpVerifyStep />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'success' && <SuccessStep />}
      </div>
    </KioskLayout>
  );
};

export default SuvidhaRegistration;
