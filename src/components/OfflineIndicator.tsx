import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      id="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-fade-in"
    >
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <span>Offline Mode — Cached assets available. Cloud AI models paused.</span>
    </div>
  );
};
