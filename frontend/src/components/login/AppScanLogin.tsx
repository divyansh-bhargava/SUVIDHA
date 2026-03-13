import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Smartphone, QrCode, RefreshCw, Check, Scan, Shield } from 'lucide-react';

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
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50 p-6">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 shadow-lg border-2 border-accent/20 animate-pulse-subtle">
            <Smartphone className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Scan with SUVIDHA App' : 'सुविधा ऐप से स्कैन करें'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'en' 
              ? 'Open SUVIDHA app and scan this QR code'
              : 'सुविधा ऐप खोलें और इस QR कोड को स्कैन करें'}
          </p>
        </div>

        {/* Main Content - QR Code and Instructions Side by Side */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Left: QR Code Display */}
          <div className="flex flex-col items-center justify-center">
            <div className={`w-64 h-64 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-2 flex flex-col items-center justify-center transition-all duration-500 shadow-lg ${
              scanState === 'waiting' ? 'border-slate-300 dark:border-slate-600' : 
              scanState === 'scanned' ? 'border-warning bg-warning/5 shadow-warning/20' : 'border-success bg-success/5 shadow-success/20'
            }`}>
          
          {scanState === 'waiting' && (
            <>
              {qrExpiry > 0 ? (
                <>
                  <div className="relative">
                    <div className="w-36 h-36 bg-foreground/5 rounded-xl flex items-center justify-center border border-border">
                      <QrCode className="w-28 h-28 text-foreground" strokeWidth={0.8} />
                    </div>
                    {/* Scanning animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent absolute animate-bounce" 
                           style={{ animationDuration: '2s' }} />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-3 border-l-3 border-primary rounded-tl" />
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-3 border-r-3 border-primary rounded-tr" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-3 border-l-3 border-primary rounded-bl" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-3 border-r-3 border-primary rounded-br" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-success" />
              </div>
              <p className="text-success font-bold text-xl">
                {language === 'en' ? 'Login Successful!' : 'लॉगिन सफल!'}
              </p>
            </div>
          )}
            </div>

            {/* Timer */}
            {scanState === 'waiting' && qrExpiry > 0 && (
              <div className="text-center mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {language === 'en' ? 'Valid for' : 'वैध'} {formatTime(qrExpiry)}
                </span>
              </div>
            )}

            {/* Demo Button */}
            
          </div>

          {/* Right: Instructions */}
          <div className="flex flex-col justify-center -mt-5">

            {scanState === 'waiting' && (
              <button
                onClick={handleSimulateScan}
                className="mt-4 w-full h-12 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] my-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>{language === 'en' ? 'Simulate Scan (Demo)' : 'स्कैन सिमुलेट करें (डेमो)'}</span>
              </button>
            )}

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 shadow-md">
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-base">📱</span>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {language === 'en' ? 'How it works' : 'यह कैसे काम करता है'}
                </h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { step: '1', icon: '📲', text: language === 'en' ? 'Open SUVIDHA app on your phone' : 'अपने फोन पर सुविधा ऐप खोलें' },
                  { step: '2', icon: '🎯', text: language === 'en' ? 'Tap "Scan to Login" in the app' : 'ऐप में "स्कैन टू लॉगिन" पर टैप करें' },
                  { step: '3', icon: '📸', text: language === 'en' ? 'Point camera at this QR code' : 'कैमरा इस QR कोड पर ले जाएं' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {step}
                      </div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-xs text-foreground font-medium leading-relaxed">
                        <span className="mr-1">{icon}</span>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="font-medium">
                    {language === 'en' ? 'Secure & Fast Authentication' : 'सुरक्षित और तेज़ प्रमाणीकरण'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppScanLogin;
