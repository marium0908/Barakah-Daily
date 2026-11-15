import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#4E3222] px-4 py-2 text-xs font-semibold text-[#E8D1B2] shadow-sm hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3.5 py-2 text-xs font-semibold text-[#2D1B12] hover:bg-[#DFC3A1] transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-[#4E3222]" aria-hidden="true" />
          <span>Install on iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E110A]/70 p-4 backdrop-blur-xs"
          >
            <div className="sticker-cream w-full max-w-sm rounded-[24px] p-6">
              <div className="flex items-start justify-between gap-3">
                <h3
                  id="ios-install-title"
                  className="font-display text-xl font-semibold text-[#2D1B12]"
                >
                  Install Barakah Daily
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#2D1B12]/10"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#4E3222]">
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#2D1B12]">1.</span>
                  <span>
                    Tap the <strong className="inline-flex items-center gap-1 text-[#2D1B12]">Share <Share className="inline h-3.5 w-3.5" aria-hidden="true" /></strong> button in Safari’s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#2D1B12]">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-[#2D1B12]">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#2D1B12]">3.</span>
                  <span>
                    Tap <strong className="text-[#2D1B12]">Add</strong> to open Barakah Daily like a native app.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#4E3222] px-4 text-sm font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <span
      role="status"
      aria-label="Offline"
      title="Offline"
      className="inline-flex items-center justify-center text-black shrink-0"
    >
      <WifiOff className="h-4 w-4 text-black" aria-hidden="true" />
    </span>
  );
};
