import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      // Hide the "reconnected" message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
        isOffline
          ? 'bg-red-600 text-white animate-in slide-in-from-top'
          : 'bg-green-600 text-white animate-in slide-in-from-top'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Form filling and navigation continue to work. Payments and submissions require internet.</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4" />
          <span>Connection restored. All services are available.</span>
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
