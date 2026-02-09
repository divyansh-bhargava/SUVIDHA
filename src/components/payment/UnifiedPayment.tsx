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
}

type PaymentStep = 'review' | 'method' | 'processing' | 'success' | 'failure';

const UnifiedPayment: React.FC<UnifiedPaymentProps> = ({ details, onPaymentComplete, onBack }) => {
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
    { id: 'upi', label: language === 'en' ? 'UPI / QR Code' : 'UPI / QR कोड', desc: language === 'en' ? 'Google Pay, PhonePe, Paytm' : 'गूगल पे, फोनपे, पेटीएम', icon: Smartphone },
    { id: 'card', label: language === 'en' ? 'Debit / Credit Card' : 'डेबिट / क्रेडिट कार्ड', desc: language === 'en' ? 'Visa, Mastercard, RuPay' : 'वीसा, मास्टरकार्ड, रुपे', icon: CreditCard },
    { id: 'netbanking', label: language === 'en' ? 'Net Banking' : 'नेट बैंकिंग', desc: language === 'en' ? 'SBI, HDFC, PNB and more' : 'SBI, HDFC, PNB और अधिक', icon: Landmark },
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
    return (
      <div className="space-y-6 animate-scale-in">
        {/* Service & Department Header */}
        <div className="kiosk-card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                {language === 'en' ? details.department : details.departmentHi}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Government of India' : 'भारत सरकार'}
              </p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {language === 'en' ? details.serviceName : details.serviceNameHi}
          </h3>
        </div>

        {/* Bill Details Card */}
        <div className="kiosk-card">
          <h3 className="text-lg font-semibold text-foreground mb-5 pb-3 border-b border-border">
            {language === 'en' ? 'Bill Details' : 'बिल विवरण'}
          </h3>
          <div className="space-y-3">
            {[
              { label: language === 'en' ? 'Consumer Name' : 'उपभोक्ता नाम', value: language === 'en' ? details.consumerName : details.consumerNameHi },
              { label: t('consumerNo'), value: details.consumerNumber, mono: true },
              { label: t('period'), value: details.period },
              { label: t('dueDate'), value: details.dueDate, warning: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold text-foreground ${row.mono ? 'font-mono' : ''}`}>
                  {row.warning && <Clock className="w-4 h-4 inline mr-1 text-warning" />}
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-4 mt-2 bg-primary/5 -mx-6 px-6 rounded-b-3xl">
              <span className="text-xl font-medium text-foreground">{t('amount')}</span>
              <span className="text-3xl font-bold text-primary">₹{details.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button onClick={handleProceedToPayment} className="kiosk-btn-success w-full flex items-center justify-center gap-3">
          <CreditCard className="w-6 h-6" />
          {t('payNow')}
        </button>
        <button onClick={onBack} className="kiosk-btn-ghost w-full">{t('back')}</button>
      </div>
    );
  }

  // Step: Payment Method
  if (step === 'method') {
    return (
      <div className="space-y-6 animate-scale-in">
        <div className="kiosk-card">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {language === 'en' ? 'Select Payment Method' : 'भुगतान विधि चुनें'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'en' ? 'Choose how you want to pay' : 'भुगतान का तरीका चुनें'}
          </p>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="kiosk-card bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">{language === 'en' ? 'Service' : 'सेवा'}</span>
            <span className="font-semibold text-foreground">{language === 'en' ? details.serviceName : details.serviceNameHi}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">{language === 'en' ? 'Consumer' : 'उपभोक्ता'}</span>
            <span className="text-foreground">{language === 'en' ? details.consumerName : details.consumerNameHi}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">{t('consumerNo')}</span>
            <span className="font-mono text-foreground">{details.consumerNumber}</span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-foreground">{language === 'en' ? 'Total Amount' : 'कुल राशि'}</span>
            <span className="text-2xl font-bold text-primary">₹{details.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* UPI QR */}
        {selectedMethod === 'upi' && (
          <div className="kiosk-card text-center">
            <p className="text-lg font-semibold text-foreground mb-4">
              {language === 'en' ? 'Scan QR to Pay' : 'भुगतान के लिए QR स्कैन करें'}
            </p>
            <div className="w-48 h-48 mx-auto mb-4 bg-background rounded-2xl p-3 flex items-center justify-center border-2 border-dashed border-primary/30">
              <QrCode className="w-28 h-28 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Or enter UPI ID: suvidha@upi' : 'या UPI ID दर्ज करें: suvidha@upi'}
            </p>
          </div>
        )}

        <button onClick={handleConfirmPayment} className="kiosk-btn-success w-full flex items-center justify-center gap-3">
          <CreditCard className="w-6 h-6" />
          {language === 'en' ? `Pay ₹${details.amount.toLocaleString()}` : `₹${details.amount.toLocaleString()} भुगतान करें`}
        </button>
        <button onClick={() => setStep('review')} className="kiosk-btn-ghost w-full">{t('back')}</button>
      </div>
    );
  }

  // Step: Processing
  if (step === 'processing') {
    return (
      <div className="text-center py-16 animate-scale-in">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Processing Payment...' : 'भुगतान प्रक्रिया में...'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Please wait while we process your payment' : 'कृपया प्रतीक्षा करें'}
        </p>
      </div>
    );
  }

  // Step: Success
  return (
    <div className="text-center animate-scale-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
        <CheckCircle2 className="w-14 h-14 text-success" />
      </div>

      <h2 className="text-3xl font-bold text-success mb-2">{t('paymentSuccess')}</h2>
      <p className="text-muted-foreground mb-6">
        {language === 'en'
          ? 'A confirmation SMS has been sent to your registered mobile number.'
          : 'आपके पंजीकृत मोबाइल नंबर पर पुष्टि SMS भेजा गया है।'}
      </p>

      {/* Receipt */}
      <div className="receipt mb-6">
        <p className="text-center text-muted-foreground mb-4 font-semibold">
          {language === 'en' ? '📄 Transaction Receipt' : '📄 लेनदेन रसीद'}
        </p>
        <div className="space-y-3 text-left">
          {[
            { label: 'Txn ID', value: txnId, mono: true },
            { label: language === 'en' ? 'Service' : 'सेवा', value: language === 'en' ? details.serviceName : details.serviceNameHi },
            { label: language === 'en' ? 'Department' : 'विभाग', value: language === 'en' ? details.department : details.departmentHi },
            { label: language === 'en' ? 'Consumer' : 'उपभोक्ता', value: language === 'en' ? details.consumerName : details.consumerNameHi },
            { label: t('consumerNo'), value: details.consumerNumber, mono: true },
            { label: t('amount'), value: `₹${details.amount.toLocaleString()}`, highlight: true },
            { label: language === 'en' ? 'Payment Method' : 'भुगतान विधि', value: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Card' : 'Net Banking' },
            { label: language === 'en' ? 'Date' : 'दिनांक', value: new Date().toLocaleDateString() },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`${row.mono ? 'font-mono' : ''} ${row.highlight ? 'font-bold text-success text-lg' : 'text-foreground'} font-semibold`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QR Receipt */}
      <div className="kiosk-card mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
          {language === 'en' ? 'Scan QR to save receipt on your phone' : 'फोन पर रसीद सेव करने के लिए QR स्कैन करें'}
        </p>
        <div className="w-32 h-32 mx-auto bg-background rounded-xl p-2 flex items-center justify-center border border-border">
          <QrCode className="w-24 h-24 text-primary" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-3">
        <button className="kiosk-btn-secondary flex-1 flex items-center justify-center gap-2">
          <Printer className="w-5 h-5" />
          {language === 'en' ? 'Print' : 'प्रिंट'}
        </button>
        <button className="kiosk-btn-primary flex-1 flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          {t('downloadReceipt')}
        </button>
      </div>
      <button className="kiosk-btn-accent w-full flex items-center justify-center gap-2">
        <Smartphone className="w-5 h-5" />
        {language === 'en' ? 'Send to Mobile' : 'मोबाइल पर भेजें'}
      </button>
    </div>
  );
};

export default UnifiedPayment;
