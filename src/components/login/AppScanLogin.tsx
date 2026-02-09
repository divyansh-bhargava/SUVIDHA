import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Smartphone, QrCode, RefreshCw, Check, Scan } from 'lucide-react';

interface AppScanLoginProps {
  onSuccess: (suvidhaId: string) => void;
}

const AppScanLogin: React.FC<AppScanLoginProps> = ({ onSuccess }) => {
  const { language } = useApp();
  const [scanState, setScanState] = useState<'waiting' | 'scanned' | 'confirmed'>('waiting');
  const [qrExpiry, setQrExpiry] = useState(120);

  useEffect(() => {
    if (qrExpiry > 0 && scanState === 'waiting') {
      const timer = setTimeout(() => setQrExpiry(qrExpiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [qrExpiry, scanState]);

  const handleSimulateScan = () => {
    setScanState('scanned');
    setTimeout(() => {
      setScanState('confirmed');
      setTimeout(() => {
        onSuccess('SUV2024001234');
      }, 1000);
    }, 2000);
  };

  const handleRefreshQR = () => {
    setQrExpiry(120);
    setScanState('waiting');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
          <Smartphone className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' ? 'Scan with SUVIDHA App' : 'सुविधा ऐप से स्कैन करें'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Open SUVIDHA app and scan this QR code'
            : 'सुविधा ऐप खोलें और इस QR कोड को स्कैन करें'}
        </p>
      </div>

      {/* QR Code Display */}
      <div className="relative mb-6">
        <div className={`mx-auto w-64 h-64 rounded-3xl bg-card border-2 flex flex-col items-center justify-center transition-all duration-500 ${
          scanState === 'waiting' ? 'border-border' : 
          scanState === 'scanned' ? 'border-warning bg-warning/5' : 'border-success bg-success/5'
        }`}>
          
          {scanState === 'waiting' && (
            <>
              {qrExpiry > 0 ? (
                <>
                  <div className="relative">
                    <div className="w-44 h-44 bg-foreground/5 rounded-2xl flex items-center justify-center border border-border">
                      <QrCode className="w-36 h-36 text-foreground" strokeWidth={0.8} />
                    </div>
                    {/* Scanning animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent absolute animate-bounce" 
                           style={{ animationDuration: '2s' }} />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
                    <Scan className="w-4 h-4 animate-pulse text-primary" />
                    <span>{language === 'en' ? 'Waiting for scan...' : 'स्कैन की प्रतीक्षा...'}</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' ? 'QR code expired' : 'QR कोड समाप्त हो गया'}
                  </p>
                  <button
                    onClick={handleRefreshQR}
                    className="flex items-center gap-2 text-primary font-medium mx-auto hover:underline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {language === 'en' ? 'Generate new QR' : 'नया QR जनरेट करें'}
                  </button>
                </div>
              )}
            </>
          )}

          {scanState === 'scanned' && (
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-warning/20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-warning border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-warning font-semibold">
                {language === 'en' ? 'Confirm on your phone' : 'फोन पर पुष्टि करें'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en' ? 'Check your SUVIDHA app' : 'अपना सुविधा ऐप जांचें'}
              </p>
            </div>
          )}

          {scanState === 'confirmed' && (
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="text-success font-semibold text-lg">
                {language === 'en' ? 'Login Successful!' : 'लॉगिन सफल!'}
              </p>
            </div>
          )}
        </div>

        {/* Timer */}
        {scanState === 'waiting' && qrExpiry > 0 && (
          <div className="text-center mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {language === 'en' ? 'Valid for' : 'वैध'} {formatTime(qrExpiry)}
            </span>
          </div>
        )}
      </div>

      {/* Demo Button */}
      {scanState === 'waiting' && (
        <button
          onClick={handleSimulateScan}
          className="w-full h-14 rounded-2xl border-2 border-border bg-card text-foreground font-medium flex items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
        >
          <Smartphone className="w-5 h-5" />
          <span>{language === 'en' ? 'Simulate App Scan (Demo)' : 'ऐप स्कैन सिमुलेट करें (डेमो)'}</span>
        </button>
      )}

      {/* Instructions */}
      <div className="mt-8 p-5 rounded-2xl bg-muted/50 border border-border">
        <p className="text-sm font-semibold text-foreground mb-4">
          {language === 'en' ? 'How it works:' : 'यह कैसे काम करता है:'}
        </p>
        <div className="space-y-3">
          {[
            { step: '1', text: language === 'en' ? 'Open SUVIDHA app on your phone' : 'अपने फोन पर सुविधा ऐप खोलें' },
            { step: '2', text: language === 'en' ? 'Tap "Scan to Login" in the app' : 'ऐप में "स्कैन टू लॉगिन" पर टैप करें' },
            { step: '3', text: language === 'en' ? 'Point camera at this QR code' : 'कैमरा इस QR कोड पर ले जाएं' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </span>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppScanLogin;
