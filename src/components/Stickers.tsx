import React from 'react';

export function CoffeeCupSticker({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sticker-cut-svg ${className}`}
      aria-hidden="true"
    >
      {/* White die-cut sticker outline */}
      <circle cx="48" cy="52" r="38" fill="#E8D1B2" />
      <path d="M74 40C84 40 88 47 86 55C84 62 77 65 70 64" stroke="#E8D1B2" strokeWidth="10" strokeLinecap="round" />
      {/* Saucer */}
      <ellipse cx="47" cy="70" rx="28" ry="8" fill="#DFC3A1" stroke="#3D2417" strokeWidth="2.5" />
      {/* Cup handle */}
      <path d="M68 43C77 43 81 49 79 55C77 60 71 62 66 60" stroke="#3D2417" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Cup body */}
      <path
        d="M23 41C23 59 32 68 47 68C62 68 71 59 71 41H23Z"
        fill="#EAD4B8"
        stroke="#3D2417"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Coffee surface */}
      <ellipse cx="47" cy="41" rx="24" ry="7.5" fill="#5A3724" stroke="#3D2417" strokeWidth="2.5" />
      {/* Latte heart */}
      <path
        d="M47 45.2C47 45.2 40.5 41.2 40.5 38.2C40.5 36.7 41.8 35.6 43.3 35.6C44.8 35.6 46.1 36.5 47 37.8C47.9 36.5 49.2 35.6 50.7 35.6C52.2 35.6 53.5 36.7 53.5 38.2C53.5 41.2 47 45.2 47 45.2Z"
        fill="#F6EAD7"
      />
      {/* Steam curl */}
      <path d="M40 28C38 24 42 21 40 17" stroke="#C9A378" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M54 27C52 23 56 20 54 16" stroke="#C9A378" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function BrandBowLogo({
  className = 'w-10 h-10',
  roundedClass = 'rounded-xl',
}: {
  className?: string;
  roundedClass?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden border-2 border-[#E8D1B2] bg-[#E8D1B2] shadow-[0_4px_10px_rgba(18,9,4,0.28)] shrink-0 ${roundedClass} ${className}`}
    >
      <img
        src="/assets/brand-logo.jpg"
        alt="Barakah Daily ribbon bow logo"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover object-[50%_46%] scale-[1.38]"
      />
    </span>
  );
}

export function StarStickerIcon({
  className = 'h-9 w-9',
  roundedClass = 'rounded-xl',
}: {
  className?: string;
  roundedClass?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border-2 border-[#E8D1B2] bg-[#E8D1B2] ring-1 ring-[#2D1B12]/10 shadow-[0_4px_10px_rgba(45,27,18,0.14)] ${roundedClass} ${className}`}
    >
      <img
        src="/assets/sticker-accent.jpg"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-[49%_47%] scale-[1.6]"
      />
    </span>
  );
}

export function RibbonBowSticker({ className = 'w-14 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 110 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sticker-cut-svg ${className}`}
      aria-hidden="true"
    >
      <path
        d="M19 16C34 14 48 26 55 33C62 26 76 14 91 16C98 17 101 27 97 36C93 45 81 47 72 44L83 63L65 59L55 44L45 59L27 63L38 44C29 47 17 45 13 36C9 27 12 17 19 16Z"
        fill="#E8D1B2"
        stroke="#E8D1B2"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path d="M47 38L29 61L42 57L52 41Z" fill="#5A3826" stroke="#2D1B12" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M63 38L81 61L68 57L58 41Z" fill="#5A3826" stroke="#2D1B12" strokeWidth="2.2" strokeLinejoin="round" />
      <path
        d="M52 34C42 20 20 15 16 24C12 33 23 44 48 39Z"
        fill="#6D4530"
        stroke="#2D1B12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M58 34C68 20 90 15 94 24C98 33 87 44 62 39Z"
        fill="#6D4530"
        stroke="#2D1B12"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="48" y="29" width="14" height="12" rx="5" fill="#4A2E1F" stroke="#2D1B12" strokeWidth="2.2" />
    </svg>
  );
}

export function StackedBooksSticker({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sticker-cut-svg ${className}`}
      aria-hidden="true"
    >
      <rect x="12" y="22" width="76" height="62" rx="16" fill="#E8D1B2" />
      {/* Bottom book */}
      <rect x="16" y="62" width="68" height="16" rx="4" fill="#5E3C29" stroke="#2D1B12" strokeWidth="2.2" />
      <line x1="25" y1="70" x2="55" y2="70" stroke="#E8D1B2" strokeWidth="2" strokeLinecap="round" />
      {/* Middle book */}
      <rect x="20" y="46" width="62" height="16" rx="4" fill="#8C5F43" stroke="#2D1B12" strokeWidth="2.2" />
      <line x1="29" y1="54" x2="60" y2="54" stroke="#E8D1B2" strokeWidth="2" strokeLinecap="round" />
      {/* Top book */}
      <rect x="23" y="30" width="56" height="16" rx="4" fill="#4A2E1F" stroke="#2D1B12" strokeWidth="2.2" />
      <line x1="31" y1="38" x2="56" y2="38" stroke="#E8D1B2" strokeWidth="2" strokeLinecap="round" />
      {/* Small cup on top */}
      <path d="M39 19H61C61 25 57 29 50 29C43 29 39 25 39 19Z" fill="#F6EAD7" stroke="#2D1B12" strokeWidth="2" />
      <path d="M61 21C64 21 65 24 63 26C62 27 60 27 59 26" stroke="#2D1B12" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M50 25C50 25 47 23.2 47 21.8C47 21 47.6 20.5 48.3 20.5C49 20.5 49.6 20.9 50 21.5C50.4 20.9 51 20.5 51.7 20.5C52.4 20.5 53 21 53 21.8C53 23.2 50 25 50 25Z" fill="#6D4530" />
    </svg>
  );
}

export function LeafSprigSticker({ className = 'w-10 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sticker-cut-svg ${className}`}
      aria-hidden="true"
    >
      <path
        d="M32 86V14M32 70C20 68 14 58 18 50C24 52 30 60 32 70ZM32 54C44 52 50 42 46 34C40 36 34 44 32 54ZM32 38C20 36 16 26 20 18C26 20 30 28 32 38ZM32 22C38 14 44 10 48 12C48 18 40 24 32 22Z"
        stroke="#E8D1B2"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 85V16" stroke="#3D2417" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 70C20 68 14 58 18 50C24 52 30 60 32 70Z" fill="#8D6144" stroke="#3D2417" strokeWidth="2" />
      <path d="M32 54C44 52 50 42 46 34C40 36 34 44 32 54Z" fill="#6D4530" stroke="#3D2417" strokeWidth="2" />
      <path d="M32 38C20 36 16 26 20 18C26 20 30 28 32 38Z" fill="#9E7354" stroke="#3D2417" strokeWidth="2" />
      <path d="M32 22C38 14 44 10 48 12C48 18 40 24 32 22Z" fill="#6D4530" stroke="#3D2417" strokeWidth="2" />
    </svg>
  );
}

export function CrescentHeartSticker({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sticker-cut-svg ${className}`}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="32" fill="#E8D1B2" />
      <circle cx="40" cy="40" r="26" fill="#4E3222" stroke="#2D1B12" strokeWidth="2.2" />
      {/* Crescent moon */}
      <path
        d="M46 21C35.5 21 27 29.5 27 40C27 50.5 35.5 59 46 59C48.8 59 51.4 58.4 53.8 57.3C46.2 55.6 40.5 48.5 40.5 40C40.5 31.5 46.2 24.4 53.8 22.7C51.4 21.6 48.8 21 46 21Z"
        fill="#F6EAD7"
      />
      {/* Tiny warm heart */}
      <path
        d="M55 37C55 37 50 33.8 50 31.2C50 29.8 51.1 28.8 52.4 28.8C53.6 28.8 54.5 29.5 55 30.5C55.5 29.5 56.4 28.8 57.6 28.8C58.9 28.8 60 29.8 60 31.2C60 33.8 55 37 55 37Z"
        fill="#D6A97B"
      />
    </svg>
  );
}

export function PaperclipIcon({ className = 'w-6 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M11 16V33C11 37.4 14.6 41 19 41C23.4 41 27 37.4 27 33V12C27 6.5 22.5 2 17 2C11.5 2 7 6.5 7 12V31C7 33.8 9.2 36 12 36C14.8 36 17 33.8 17 31V13"
        stroke="#4A2E1F"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoodStickerGraphic({ moodId, className = 'w-11 h-11' }: { moodId: string; className?: string }) {
  switch (moodId) {
    case 'books_focus':
      return <StackedBooksSticker className={className} />;
    case 'bow_calm':
      return <RibbonBowSticker className={className} />;
    case 'leaf_grateful':
      return <LeafSprigSticker className={className} />;
    case 'sunnah_smile':
      return <CrescentHeartSticker className={className} />;
    case 'coffee_heart':
    default:
      return <CoffeeCupSticker className={className} />;
  }
}
