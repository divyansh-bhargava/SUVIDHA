import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useVoiceAssistantContext } from '@/contexts/VoiceAssistantContext';
import {
  CreditCard, CheckCircle2, QrCode, Download,
  Smartphone, Landmark, Wifi, FileText, Printer,
  ArrowLeft, Shield, Clock
} from 'lucide-react';

interface PaymentDetails {
  serviceName: string;
  serviceNameHi: string;
  department: string;
  departmentHi: string;
  consumerNumber: string;
  consumerName: string;
  consumerNameHi: string;
  amount: number;
  dueDate: string;
  period: string;
  billId?: string;
}

interface UnifiedPaymentProps {
  details: PaymentDetails;
  onPaymentComplete: (method: string) => void;
  onBack: () => void;
  onDone?: () => void;
}

type PaymentStep = 'review' | 'method' | 'processing' | 'success' | 'failure';

// Service type to gradient/icon mapping for consistent theming
const getServiceGradient = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('electricity') || name.includes('bijli')) return 'from-amber-500 to-orange-500';
  if (name.includes('water') || name.includes('jal')) return 'from-blue-500 to-cyan-500';
  if (name.includes('property') || name.includes('sampatti')) return 'from-emerald-500 to-green-500';
  if (name.includes('birth') || name.includes('death') || name.includes('janam')) return 'from-purple-500 to-violet-500';
  return 'from-primary to-primary/80';
};

const getServiceEmoji = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('electricity') || name.includes('bijli')) return '⚡';
  if (name.includes('water') || name.includes('jal')) return '💧';
  if (name.includes('property') || name.includes('sampatti')) return '🏠';
  if (name.includes('birth') || name.includes('janam')) return '👶';
  if (name.includes('death') || name.includes('mrityu')) return '📜';
  return '📋';
};

const UnifiedPayment: React.FC<UnifiedPaymentProps> = ({ details, onPaymentComplete, onBack, onDone }) => {
  const { language, t } = useApp();
  const voiceAssistant = useVoiceAssistantContext();
  const [step, setStep] = useState<PaymentStep>('review');
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [txnId] = useState(`TXN${Date.now().toString().slice(-8)}`);

  // Voice narration on step changes
  useEffect(() => {
    if (!voiceAssistant.isActive) return;
    const timer = setTimeout(() => {
      switch (step) {
        case 'review':
          voiceAssistant.narratePage('bill_view');
          break;
        case 'method':
          voiceAssistant.narratePage('payment_method');
          break;
        case 'success':
          voiceAssistant.narratePage('payment_success');
          break;
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [step, voiceAssistant.isActive]);

  const paymentMethods = [
    { id: 'upi', label: language === 'en' ? 'UPI / QR Code' : 'UPI / QR कोड', desc: language === 'en' ? 'Google Pay, PhonePe, Paytm' : 'गूगल पे, फोनपे, पेटीएम', icon: Smartphone, color: 'from-violet-500 to-purple-600' },
    { id: 'card', label: language === 'en' ? 'Debit / Credit Card' : 'डेबिट / क्रेडिट कार्ड', desc: language === 'en' ? 'Visa, Mastercard, RuPay' : 'वीसा, मास्टरकार्ड, रुपे', icon: CreditCard, color: 'from-blue-500 to-indigo-600' },
    { id: 'netbanking', label: language === 'en' ? 'Net Banking' : 'नेट बैंकिंग', desc: language === 'en' ? 'SBI, HDFC, PNB and more' : 'SBI, HDFC, PNB और अधिक', icon: Landmark, color: 'from-emerald-500 to-teal-600' },
  ];

  const handleProceedToPayment = () => setStep('method');

  const handleConfirmPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      onPaymentComplete(selectedMethod);
    }, 2000);
  };

  // Step: Bill Review
  if (step === 'review') {
    const serviceGradient = getServiceGradient(details.serviceName);
    const serviceEmoji = getServiceEmoji(details.serviceName);
    
    return (
      <div className="space-y-6 animate-scale-in">
        {/* Service Header Banner */}
        <div className={`bg-gradient-to-r ${serviceGradient} rounded-2xl p-6 text-white shadow-lg`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
              {serviceEmoji}
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium">
                {language === 'en' ? details.department : details.departmentHi}
              </p>
              <h2 className="text-xl font-bold">
                {language === 'en' ? details.serviceName : details.serviceNameHi}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">{language === 'en' ? 'Amount Due' : 'देय राशि'}</p>
              <p className="text-3xl font-bold">₹{details.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Bill Details Card */}
        <div className="kiosk-card border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            {language === 'en' ? 'Bill Details' : 'बिल विवरण'}
          </h3>
          <div className="space-y-3">
            {[
              { label: language === 'en' ? 'Consumer Name' : 'उपभोक्ता नाम', value: language === 'en' ? details.consumerName : details.consumerNameHi },
              { label: t('consumerNo'), value: details.consumerNumber, mono: true },
              { label: t('period'), value: details.period },
              { label: t('dueDate'), value: details.dueDate, warning: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold text-foreground ${row.mono ? 'font-mono bg-primary/10 px-3 py-1 rounded-lg text-primary' : ''}`}>
                  {row.warning && <Clock className="w-4 h-4 inline mr-2 text-amber-500" />}
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Summary Card */}
        <div className="kiosk-card bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-muted-foreground mb-1 text-lg">{language === 'en' ? 'Total Amount Payable' : 'कुल देय राशि'}</p>
              <p className="text-5xl font-bold text-primary">₹{details.amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en' ? 'Including all taxes & fees' : 'सभी कर और शुल्क सहित'}
              </p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleProceedToPayment} 
          className="kiosk-btn-success w-full flex items-center justify-center gap-3 py-6 text-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <CreditCard className="w-6 h-6" />
          {t('payNow')}
        </button>
        <button onClick={onBack} className="kiosk-btn-ghost w-full py-4 text-lg">{t('back')}</button>
      </div>
    );
  }

  // Step: Payment Method
  if (step === 'method') {
    return (
      <div className="space-y-6 animate-scale-in">
        {/* Header with amount reminder */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">{language === 'en' ? 'Amount to Pay' : 'देय राशि'}</p>
              <p className="text-3xl font-bold">₹{details.amount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            {language === 'en' ? '100% Secure Payment' : '100% सुरक्षित भुगतान'}
          </p>
        </div>

        <div className="kiosk-card">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {language === 'en' ? 'Select Payment Method' : 'भुगतान विधि चुनें'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'en' ? 'Choose how you want to pay' : 'भुगतान का तरीका चुनें'}
          </p>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left transform hover:scale-[1.01] ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  selectedMethod === method.id 
                    ? `bg-gradient-to-br ${method.color} shadow-lg` 
                    : 'bg-muted'
                }`}>
                  <method.icon className={`w-7 h-7 ${selectedMethod === method.id ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-foreground">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  selectedMethod === method.id 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedMethod === method.id && (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bill Summary - Compact */}
        <div className="kiosk-card bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50">
          <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {language === 'en' ? 'Bill Summary' : 'बिल सारांश'}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{language === 'en' ? 'Service' : 'सेवा'}</span>
              <span className="font-semibold text-foreground">{language === 'en' ? details.serviceName : details.serviceNameHi}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{language === 'en' ? 'Consumer' : 'उपभोक्ता'}</span>
              <span className="text-foreground">{language === 'en' ? details.consumerName : details.consumerNameHi}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('consumerNo')}</span>
              <span className="font-mono text-foreground">{details.consumerNumber}</span>
            </div>
          </div>
        </div>

        {/* UPI QR */}
        {selectedMethod === 'upi' && (
          <div className="kiosk-card text-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-2 border-violet-200 dark:border-violet-800">
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Smartphone className="w-4 h-4" />
              {language === 'en' ? 'UPI Payment' : 'UPI भुगतान'}
            </div>
            <p className="text-lg font-semibold text-foreground mb-4">
              {language === 'en' ? 'Scan QR Code to Pay' : 'भुगतान के लिए QR कोड स्कैन करें'}
            </p>
            <div className="w-52 h-52 mx-auto mb-4 bg-white rounded-2xl p-4 flex items-center justify-center border-2 border-violet-300 shadow-lg shadow-violet-500/20">
              <QrCode className="w-36 h-36 text-violet-600" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 inline-block">
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Or pay to UPI ID' : 'या UPI ID पर भुगतान करें'}
              </p>
              <p className="font-mono text-lg font-bold text-violet-600">suvidha@upi</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleConfirmPayment} 
          className="kiosk-btn-success w-full flex items-center justify-center gap-3 py-6 text-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <Shield className="w-6 h-6" />
          {language === 'en' ? `Pay ₹${details.amount.toLocaleString()} Securely` : `₹${details.amount.toLocaleString()} सुरक्षित भुगतान करें`}
        </button>
        <button onClick={() => setStep('review')} className="kiosk-btn-ghost w-full py-4 text-lg">{t('back')}</button>
      </div>
    );
  }

  // Step: Processing
  if (step === 'processing') {
    return (
      <div className="text-center py-16 animate-scale-in">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          {language === 'en' ? 'Processing Payment' : 'भुगतान प्रक्रिया में'}
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          {language === 'en' ? 'Please wait while we securely process your payment' : 'कृपया प्रतीक्षा करें, आपका भुगतान सुरक्षित रूप से संसाधित हो रहा है'}
        </p>
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">
            {language === 'en' ? 'Secured by 256-bit SSL encryption' : '256-बिट SSL एन्क्रिप्शन द्वारा सुरक्षित'}
          </span>
        </div>
      </div>
    );
  }

  // Step: Success
  return (
    <div className="text-center animate-scale-in">
      {/* Success Animation */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/40">
          <CheckCircle2 className="w-14 h-14 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-green-600 mb-2">{t('paymentSuccess')}</h2>
      <p className="text-lg text-muted-foreground mb-2">
        {language === 'en'
          ? 'Your payment has been successfully processed!'
          : 'आपका भुगतान सफलतापूर्वक संसाधित हो गया है!'}
      </p>
      <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Smartphone className="w-4 h-4" />
        {language === 'en'
          ? 'Confirmation SMS sent to your mobile'
          : 'पुष्टि SMS आपके मोबाइल पर भेजा गया'}
      </div>

      {/* Receipt Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <p className="font-bold text-lg text-foreground">
            {language === 'en' ? 'Transaction Receipt' : 'लेनदेन रसीद'}
          </p>
        </div>
        
        {/* Transaction ID - Highlighted */}
        <div className="bg-primary/10 rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
          <p className="font-mono text-xl font-bold text-primary">{txnId}</p>
        </div>

        <div className="space-y-3 text-left">
          {[
            { label: language === 'en' ? 'Service' : 'सेवा', value: language === 'en' ? details.serviceName : details.serviceNameHi },
            { label: language === 'en' ? 'Department' : 'विभाग', value: language === 'en' ? details.department : details.departmentHi },
            { label: language === 'en' ? 'Consumer' : 'उपभोक्ता', value: language === 'en' ? details.consumerName : details.consumerNameHi },
            { label: t('consumerNo'), value: details.consumerNumber, mono: true },
            { label: language === 'en' ? 'Payment Method' : 'भुगतान विधि', value: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Card' : 'Net Banking' },
            { label: language === 'en' ? 'Date & Time' : 'दिनांक और समय', value: new Date().toLocaleString() },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`${row.mono ? 'font-mono' : ''} font-semibold text-foreground`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        
        {/* Amount - Big highlight */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-foreground">{t('amount')}</span>
            <span className="text-3xl font-bold text-green-600">₹{details.amount.toLocaleString()}</span>
          </div>
          <p className="text-right text-xs text-green-600 font-medium mt-1">✓ PAID</p>
        </div>
      </div>

      {/* QR Receipt */}
      <div className="kiosk-card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-4 text-center flex items-center justify-center gap-2">
          <QrCode className="w-4 h-4" />
          {language === 'en' ? 'Scan to save receipt on phone' : 'फोन पर रसीद सेव करने के लिए स्कैन करें'}
        </p>
        <div className="w-36 h-36 mx-auto bg-white rounded-xl p-3 flex items-center justify-center border-2 border-blue-300 shadow-md">
          <QrCode className="w-28 h-28 text-blue-600" />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button className="kiosk-btn-secondary flex items-center justify-center gap-2 py-5 text-lg hover:scale-[1.02] transition-transform">
          <Printer className="w-6 h-6" />
          {language === 'en' ? 'Print' : 'प्रिंट'}
        </button>
        <button className="kiosk-btn-primary flex items-center justify-center gap-2 py-5 text-lg hover:scale-[1.02] transition-transform">
          <Download className="w-6 h-6" />
          {t('downloadReceipt')}
        </button>
      </div>
      <button className="kiosk-btn-accent w-full flex items-center justify-center gap-3 py-5 text-lg shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02]">
        <Smartphone className="w-6 h-6" />
        {language === 'en' ? 'Send Receipt to Mobile' : 'रसीद मोबाइल पर भेजें'}
      </button>

      {/* Go to Dashboard */}
      {onDone && (
        <button
          onClick={onDone}
          className="kiosk-btn-ghost w-full flex items-center justify-center gap-3 py-5 text-lg mt-4"
        >
          {language === 'en' ? '🏠 Back to Home' : '🏠 होम पर वापस जाएं'}
        </button>
      )}
    </div>
  );
};

export default UnifiedPayment;
