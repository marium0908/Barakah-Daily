# Barakah Daily

A cozy, coffee-sticker aesthetic **Muslim Daily Routine, Goals & Muhasabah (Good & Bad Deeds) Journal** designed to help you protect your time, build consistent daily habits, and reflect sincerely every day — saved forever across devices and installable directly from Chrome as a Progressive Web App (PWA).    

<img width="1920" height="3423" alt="screencapture-localhost-3000-2026-11-15-10_50_44" src="https://github.com/user-attachments/assets/f82935d4-8583-4911-8f86-b0635b6a372f" />

---

## Features

- **Welcome Splash Screen**: Opens with the **Barakah Daily** bow emblem and `"Bismillah · One step at a time"` greeting.
- **Customizable Daily Routine**: Starts clean with no clutter so you can create your own forever routine blocks (title, time, `Morning` / `Noon` / `Afternoon` / `Evening` / `Night`, and duration in minutes), reorder them, edit anytime, and check them off day by day.
- **Daily Goals Notepad**: A paperclipped kraft notepad for daily priorities with **Repeat daily forever** recurring goals and one-tap **Carry over from yesterday** for unfinished tasks.
- **Good & Bad Deeds Reflection (*Muhasabah*)**:
  - **Day-over-Day Encouragement Banner**: Celebrates when you log more good deeds than yesterday and gives gentle, uplifting encouragement (`"You can do this"`) whenever you need a boost.
  - **Quick-Log Options with `+` / `-` Controls**: Tap `+` to log a suggested good deed or slip-up to improve, or tap `-` to hide any quick option you do not need (with a one-click restore option).
  - **Custom Logging, Editing & Notes**: Add your own deeds with reflection notes, edit or switch deed types anytime, and save an evening **Daily Reflection Note**.
- **Forever Journal History**: Check any past date with the 7-day scroller, jump-to-date picker, or expand **Details** inside **Forever Journal History** to review past progress.
- **Mood Stickers**: Pick a cozy daily sticker note to match your day.
- **Local + Cloud Sync ("Save Forever")**: Works instantly in your browser via `localStorage` and syncs across devices with Google Sign-In powered by Firebase Auth & Cloud Firestore.
- **Installable PWA & Mobile-Responsive**: Built mobile-first with a bottom thumb-zone bar, offline caching, and one-tap **Install App** support in Chrome (plus Safari Add to Home Screen instructions on iOS).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **PWA**: `vite-plugin-pwa` (Workbox offline precaching, web app manifest, `beforeinstallprompt` install hook)
- **Backend / Persistence**: Firebase Authentication (Google Sign-In) & Cloud Firestore with local browser fallback

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Typecheck & build for production**
   ```bash
   npm run lint
   npm run build
   ```

---

## Security Note

Before sharing your deployment broadly, review `firestore.rules` and `firebase-blueprint.json` to ensure all access rules match your intended usage.
