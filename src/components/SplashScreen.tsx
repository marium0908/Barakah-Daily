import React, { useEffect, useRef, useState } from 'react';
import { BrandBowLogo } from './Stickers';

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadingOut(true);
    }, 1350);

    const doneTimer = window.setTimeout(() => {
      onDoneRef.current();
    }, 1750);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const handleDismiss = () => {
    setFadingOut(true);
    window.setTimeout(() => onDoneRef.current(), 220);
  };

  return (
    <div
      role="dialog"
      aria-label="Barakah Daily welcome screen"
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#3A2419] px-6 transition-opacity duration-400 ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 22% 18%, rgba(128, 82, 52, 0.34) 0%, transparent 50%), radial-gradient(circle at 80% 82%, rgba(92, 56, 36, 0.28) 0%, transparent 48%)',
      }}
    >
      <div
        className={`sticker-cream relative flex w-full max-w-xs flex-col items-center rounded-[28px] px-7 py-9 text-center transition-all duration-400 sm:max-w-sm sm:px-9 sm:py-11 ${
          fadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div
          className="washi-tape pointer-events-none absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-1 rounded-sm"
          aria-hidden="true"
        />

        <BrandBowLogo
          className="h-24 w-24 sm:h-28 sm:w-28"
          roundedClass="rounded-[24px]"
        />

        <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight text-[#2D1B12] sm:text-4xl">
          Barakah Daily
        </h1>

        <p className="mt-2 text-xs font-medium text-[#6C4D3B] sm:text-sm">
          Bismillah · One step at a time
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#4E3222] px-5 py-2 text-xs font-semibold text-[#E8D1B2] hover:bg-[#3A2419] transition-colors"
        >
          Open Journal
        </button>
      </div>
    </div>
  );
};
