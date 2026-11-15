import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Calendar, CheckSquare, Clock, Heart, History, LogIn, LogOut } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import {
  MOOD_STICKERS,
  formatFriendlyDate,
  formatShortDay,
  getCurrentTimeLabel,
  getLastNDaysKeys,
  getOffsetDateKey,
  getTodayKey,
} from './data/defaults';
import {
  AppUser,
  DailyGoal,
  DailyLog,
  DeedEntry,
  DeedPreferences,
  DeedType,
  RoutineItem,
} from './types';
import {
  createDeedCloud,
  createGoalCloud,
  createSafeId,
  deleteDeedCloud,
  deleteGoalCloud,
  deleteRoutineItemCloud,
  ensureUserInitialized,
  loadLocalDailyLogs,
  loadLocalDeedPreferences,
  loadLocalDeeds,
  loadLocalGoals,
  loadLocalRoutineItems,
  saveLocalDailyLogs,
  saveLocalDeedPreferences,
  saveLocalDeeds,
  saveLocalGoals,
  saveLocalRoutineItems,
  subscribeDailyLogs,
  subscribeDeedPreferences,
  subscribeDeeds,
  subscribeGoals,
  subscribeRoutineItems,
  updateDeedCloud,
  updateGoalCloud,
  upsertDailyLogCloud,
  upsertDeedPreferencesCloud,
  upsertRoutineItemCloud,
} from './services/storageService';
import { BrandBowLogo, MoodStickerGraphic, RibbonBowSticker, StarStickerIcon } from './components/Stickers';
import { RoutineBoard } from './components/RoutineBoard';
import { DailyGoalsPad } from './components/DailyGoalsPad';
import { DeedsMuhasabah } from './components/DeedsMuhasabah';
import { HistoryOverview } from './components/HistoryOverview';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const todayKey = getTodayKey();
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [activeMobileTab, setActiveMobileTab] = useState<'routine' | 'goals' | 'deeds' | 'history'>('routine');
  const [showSplash, setShowSplash] = useState(true);

  const [user, setUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>(() =>
    loadLocalRoutineItems()
  );
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() =>
    loadLocalDailyLogs()
  );
  const [allGoals, setAllGoals] = useState<DailyGoal[]>(() => loadLocalGoals());
  const [allDeeds, setAllDeeds] = useState<DeedEntry[]>(() => loadLocalDeeds());
  const [deedPrefs, setDeedPrefs] = useState<DeedPreferences>(() =>
    loadLocalDeedPreferences()
  );
  const [deedPrefsExistsInCloud, setDeedPrefsExistsInCloud] = useState(false);

  const seededRecurringTodayRef = useRef<string | null>(null);

  // Auth + Cloud Firestore listeners
  useEffect(() => {
    let unsubRoutine: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;
    let unsubGoals: (() => void) | null = null;
    let unsubDeeds: (() => void) | null = null;
    let unsubPrefs: (() => void) | null = null;

    const cleanupSubs = () => {
      unsubRoutine?.();
      unsubLogs?.();
      unsubGoals?.();
      unsubDeeds?.();
      unsubPrefs?.();
      unsubRoutine = null;
      unsubLogs = null;
      unsubGoals = null;
      unsubDeeds = null;
      unsubPrefs = null;
    };

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      cleanupSubs();
      if (fbUser) {
        const nextUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Friend',
          email: fbUser.email,
          photoURL: fbUser.photoURL,
        };
        setUser(nextUser);
        setAuthReady(true);
        try {
          await ensureUserInitialized(fbUser.uid, nextUser.displayName);
          unsubRoutine = subscribeRoutineItems(fbUser.uid, setRoutineItems);
          unsubLogs = subscribeDailyLogs(fbUser.uid, setDailyLogs);
          unsubGoals = subscribeGoals(fbUser.uid, setAllGoals);
          unsubDeeds = subscribeDeeds(fbUser.uid, setAllDeeds);
          unsubPrefs = subscribeDeedPreferences(fbUser.uid, (prefs, exists) => {
            setDeedPrefs(prefs);
            setDeedPrefsExistsInCloud(exists);
          });
        } catch (err) {
          setErrorBanner(
            err instanceof Error
              ? 'Could not sync with cloud storage right now. Your changes remain safe locally.'
              : 'Cloud sync error.'
          );
        }
      } else {
        setUser(null);
        setAuthReady(true);
        setRoutineItems(loadLocalRoutineItems());
        setDailyLogs(loadLocalDailyLogs());
        setAllGoals(loadLocalGoals());
        setAllDeeds(loadLocalDeeds());
        setDeedPrefs(loadLocalDeedPreferences());
        setDeedPrefsExistsInCloud(false);
      }
    });

    return () => {
      cleanupSubs();
      unsubAuth();
    };
  }, []);

  // Auto-seed recurring goals onto today's list once per session if missing
  useEffect(() => {
    if (!authReady) return;
    if (seededRecurringTodayRef.current === `${user?.uid ?? 'local'}-${todayKey}`) return;

    const recurringTitles = Array.from(
      new Set(allGoals.filter((g) => g.isRecurring).map((g) => g.title.trim()))
    ).filter(Boolean);

    if (recurringTitles.length === 0) {
      seededRecurringTodayRef.current = `${user?.uid ?? 'local'}-${todayKey}`;
      return;
    }

    const todayGoalTitles = new Set(
      allGoals.filter((g) => g.dateKey === todayKey).map((g) => g.title.trim())
    );
    const missing = recurringTitles.filter((title) => !todayGoalTitles.has(title));

    seededRecurringTodayRef.current = `${user?.uid ?? 'local'}-${todayKey}`;
    if (missing.length === 0) return;

    const existingCount = allGoals.filter((g) => g.dateKey === todayKey).length;
    const createdGoals: DailyGoal[] = missing.map((title, idx) => ({
      id: createSafeId('goal'),
      dateKey: todayKey,
      title,
      completed: false,
      isRecurring: true,
      sortOrder: existingCount + idx,
    }));

    if (user) {
      createdGoals.forEach((g) => {
        void createGoalCloud(user.uid, g);
      });
    } else {
      const next = [...allGoals, ...createdGoals];
      setAllGoals(next);
      saveLocalGoals(next);
    }
  }, [authReady, user, todayKey, allGoals]);

  const handleSignIn = async () => {
    setAuthBusy(true);
    setErrorBanner(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? `Sign-in was cancelled or blocked (${err.message}).`
          : 'Could not sign in.'
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  };

  // Current day derived data
  const previousDateKey = getOffsetDateKey(selectedDateKey, -1);

  const selectedLog: DailyLog = useMemo(() => {
    return (
      dailyLogs[selectedDateKey] || {
        dateKey: selectedDateKey,
        completedRoutineIds: [],
        reflectionNote: '',
        moodSticker: 'coffee_heart',
        goodCount: 0,
        badCount: 0,
      }
    );
  }, [dailyLogs, selectedDateKey]);

  const selectedDayGoals = useMemo(
    () =>
      allGoals
        .filter((g) => g.dateKey === selectedDateKey)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allGoals, selectedDateKey]
  );

  const yesterdayUnfinishedGoals = useMemo(() => {
    const prevGoals = allGoals.filter(
      (g) => g.dateKey === previousDateKey && !g.completed
    );
    const currentTitles = new Set(selectedDayGoals.map((g) => g.title.trim()));
    return prevGoals.filter((g) => !currentTitles.has(g.title.trim()));
  }, [allGoals, previousDateKey, selectedDayGoals]);

  const selectedDayDeeds = useMemo(
    () => allDeeds.filter((d) => d.dateKey === selectedDateKey),
    [allDeeds, selectedDateKey]
  );

  const previousDayDeeds = useMemo(
    () => allDeeds.filter((d) => d.dateKey === previousDateKey),
    [allDeeds, previousDateKey]
  );

  const yesterdayGoodCount = previousDayDeeds.filter((d) => d.type === 'good').length;
  const yesterdayBadCount = previousDayDeeds.filter((d) => d.type === 'bad').length;

  const persistDailyLog = useCallback(
    (nextLog: DailyLog) => {
      const existsInCloud = Boolean(dailyLogs[nextLog.dateKey]);
      if (user) {
        void upsertDailyLogCloud(user.uid, nextLog, existsInCloud);
      } else {
        const updated = { ...dailyLogs, [nextLog.dateKey]: nextLog };
        setDailyLogs(updated);
        saveLocalDailyLogs(updated);
      }
    },
    [dailyLogs, user]
  );

  // Routine handlers
  const handleToggleRoutineComplete = (itemId: string) => {
    const exists = selectedLog.completedRoutineIds.includes(itemId);
    const nextIds = exists
      ? selectedLog.completedRoutineIds.filter((id) => id !== itemId)
      : [...selectedLog.completedRoutineIds, itemId];
    persistDailyLog({
      ...selectedLog,
      completedRoutineIds: nextIds,
    });
  };

  const handleAddRoutineItem = (item: Omit<RoutineItem, 'id' | 'sortOrder'>) => {
    const nextItem: RoutineItem = {
      ...item,
      id: createSafeId('routine'),
      sortOrder: routineItems.length,
    };
    if (user) {
      void upsertRoutineItemCloud(user.uid, nextItem, true);
    } else {
      const next = [...routineItems, nextItem];
      setRoutineItems(next);
      saveLocalRoutineItems(next);
    }
  };

  const handleUpdateRoutineItem = (item: RoutineItem) => {
    if (user) {
      void upsertRoutineItemCloud(user.uid, item, false);
    } else {
      const next = routineItems.map((r) => (r.id === item.id ? item : r));
      setRoutineItems(next);
      saveLocalRoutineItems(next);
    }
  };

  const handleDeleteRoutineItem = (id: string) => {
    if (user) {
      void deleteRoutineItemCloud(user.uid, id);
    } else {
      const next = routineItems.filter((r) => r.id !== id);
      setRoutineItems(next);
      saveLocalRoutineItems(next);
    }
  };

  const handleMoveRoutineItem = (id: string, direction: 'up' | 'down') => {
    const index = routineItems.findIndex((r) => r.id === id);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= routineItems.length) return;

    const reordered = [...routineItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(swapIndex, 0, moved);
    const withSort = reordered.map((r, idx) => ({ ...r, sortOrder: idx }));

    if (user) {
      withSort.forEach((r) => {
        void upsertRoutineItemCloud(user.uid, r, false);
      });
    } else {
      setRoutineItems(withSort);
      saveLocalRoutineItems(withSort);
    }
  };

  // Daily Goals handlers
  const handleAddGoal = (title: string, isRecurring: boolean) => {
    const newGoal: DailyGoal = {
      id: createSafeId('goal'),
      dateKey: selectedDateKey,
      title,
      completed: false,
      isRecurring,
      sortOrder: selectedDayGoals.length,
    };
    if (user) {
      void createGoalCloud(user.uid, newGoal);
    } else {
      const next = [...allGoals, newGoal];
      setAllGoals(next);
      saveLocalGoals(next);
    }
  };

  const handleToggleGoal = (goalId: string) => {
    const target = allGoals.find((g) => g.id === goalId);
    if (!target) return;
    if (user) {
      void updateGoalCloud(user.uid, goalId, { completed: !target.completed });
    } else {
      const next = allGoals.map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      );
      setAllGoals(next);
      saveLocalGoals(next);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (user) {
      void deleteGoalCloud(user.uid, goalId);
    } else {
      const next = allGoals.filter((g) => g.id !== goalId);
      setAllGoals(next);
      saveLocalGoals(next);
    }
  };

  const handleCarryOverYesterday = () => {
    if (yesterdayUnfinishedGoals.length === 0) return;
    const carried: DailyGoal[] = yesterdayUnfinishedGoals.map((g, idx) => ({
      id: createSafeId('goal'),
      dateKey: selectedDateKey,
      title: g.title,
      completed: false,
      isRecurring: g.isRecurring,
      sortOrder: selectedDayGoals.length + idx,
    }));
    if (user) {
      carried.forEach((g) => void createGoalCloud(user.uid, g));
    } else {
      const next = [...allGoals, ...carried];
      setAllGoals(next);
      saveLocalGoals(next);
    }
  };

  // Good & Bad Deeds handlers
  const handleAddDeed = (
    type: DeedType,
    title: string,
    category: string,
    note: string
  ) => {
    const newDeed: DeedEntry = {
      id: createSafeId('deed'),
      dateKey: selectedDateKey,
      type,
      title,
      category,
      note,
      timeLabel: getCurrentTimeLabel(),
    };
    const nextGood =
      selectedDayDeeds.filter((d) => d.type === 'good').length + (type === 'good' ? 1 : 0);
    const nextBad =
      selectedDayDeeds.filter((d) => d.type === 'bad').length + (type === 'bad' ? 1 : 0);

    if (user) {
      void createDeedCloud(user.uid, newDeed);
    } else {
      const next = [newDeed, ...allDeeds];
      setAllDeeds(next);
      saveLocalDeeds(next);
    }

    persistDailyLog({
      ...selectedLog,
      goodCount: nextGood,
      badCount: nextBad,
    });
  };

  const handleUpdateDeed = (updatedDeed: DeedEntry) => {
    const nextDayDeeds = selectedDayDeeds.map((d) =>
      d.id === updatedDeed.id ? updatedDeed : d
    );
    const nextGood = nextDayDeeds.filter((d) => d.type === 'good').length;
    const nextBad = nextDayDeeds.filter((d) => d.type === 'bad').length;

    if (user) {
      void updateDeedCloud(user.uid, updatedDeed.id, {
        type: updatedDeed.type,
        title: updatedDeed.title,
        category: updatedDeed.category,
        note: updatedDeed.note,
        timeLabel: updatedDeed.timeLabel,
      });
    } else {
      const next = allDeeds.map((d) => (d.id === updatedDeed.id ? updatedDeed : d));
      setAllDeeds(next);
      saveLocalDeeds(next);
    }

    if (nextGood !== selectedLog.goodCount || nextBad !== selectedLog.badCount) {
      persistDailyLog({
        ...selectedLog,
        goodCount: nextGood,
        badCount: nextBad,
      });
    }
  };

  const handleDeleteDeed = (deedId: string) => {
    const target = allDeeds.find((d) => d.id === deedId);
    const nextGood = Math.max(
      0,
      selectedDayDeeds.filter((d) => d.type === 'good').length -
        (target?.type === 'good' ? 1 : 0)
    );
    const nextBad = Math.max(
      0,
      selectedDayDeeds.filter((d) => d.type === 'bad').length -
        (target?.type === 'bad' ? 1 : 0)
    );

    if (user) {
      void deleteDeedCloud(user.uid, deedId);
    } else {
      const next = allDeeds.filter((d) => d.id !== deedId);
      setAllDeeds(next);
      saveLocalDeeds(next);
    }

    persistDailyLog({
      ...selectedLog,
      goodCount: nextGood,
      badCount: nextBad,
    });
  };

  const handleSaveReflectionNote = (note: string) => {
    persistDailyLog({
      ...selectedLog,
      reflectionNote: note,
    });
  };

  const handleSelectMoodSticker = (moodId: string) => {
    persistDailyLog({
      ...selectedLog,
      moodSticker: moodId,
    });
  };

  const handleHidePreset = (type: DeedType, title: string) => {
    const nextPrefs: DeedPreferences =
      type === 'good'
        ? {
            ...deedPrefs,
            hiddenGoodTitles: Array.from(new Set([...deedPrefs.hiddenGoodTitles, title])),
          }
        : {
            ...deedPrefs,
            hiddenBadTitles: Array.from(new Set([...deedPrefs.hiddenBadTitles, title])),
          };
    if (user) {
      void upsertDeedPreferencesCloud(user.uid, nextPrefs, deedPrefsExistsInCloud);
    } else {
      setDeedPrefs(nextPrefs);
      saveLocalDeedPreferences(nextPrefs);
    }
  };

  const handleRestorePresets = (type: DeedType) => {
    const nextPrefs: DeedPreferences =
      type === 'good'
        ? { ...deedPrefs, hiddenGoodTitles: [] }
        : { ...deedPrefs, hiddenBadTitles: [] };
    if (user) {
      void upsertDeedPreferencesCloud(user.uid, nextPrefs, deedPrefsExistsInCloud);
    } else {
      setDeedPrefs(nextPrefs);
      saveLocalDeedPreferences(nextPrefs);
    }
  };

  const sevenDayStrip = useMemo(() => getLastNDaysKeys(todayKey, 7), [todayKey]);
  const activeMood =
    MOOD_STICKERS.find((m) => m.id === selectedLog.moodSticker) || MOOD_STICKERS[0];

  const routineDoneCount = routineItems.filter(
    (r) => r.isActive && selectedLog.completedRoutineIds.includes(r.id)
  ).length;
  const goalsDoneCount = selectedDayGoals.filter((g) => g.completed).length;
  const goodDeedsCount = selectedDayDeeds.filter((d) => d.type === 'good').length;

  return (
    <div className="min-h-screen overflow-x-hidden pb-24 md:pb-16">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {/* Top Bar — Strict 3-Zone Contract */}
      <header className="border-b border-[#E8D1B2]/12 bg-[#2B1910]/90 backdrop-blur-md md:sticky md:top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-8 sm:px-6 sm:py-3.5">
          {/* Zone 1: Brand wordmark + logo */}
          <a
            href="#top"
            className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-[#E8D1B2] whitespace-nowrap shrink-0 sm:gap-2.5 sm:text-xl"
          >
            <BrandBowLogo className="h-8 w-8 sm:h-9 sm:w-9" roundedClass="rounded-xl" />
            <span>Barakah Daily</span>
          </a>

          {/* Zone 2: Clean single-line nav links */}
          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#E8D1B2]"
          >
            <a
              href="#routine"
              className="hover:text-[#E8D1B2] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Routine
            </a>
            <a
              href="#goals"
              className="hover:text-[#E8D1B2] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Daily Goals
            </a>
            <a
              href="#deeds"
              className="hover:text-[#E8D1B2] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Good &amp; Bad Deeds
            </a>
            <a
              href="#history"
              className="hover:text-[#E8D1B2] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              History
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <OfflineIndicator />
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={authBusy}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#E8D1B2]/25 bg-[#4E3222] px-3 py-2 text-xs font-medium text-[#E8D1B2] hover:bg-[#5E3C29] transition-colors whitespace-nowrap shrink-0 sm:px-4"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="max-w-[96px] truncate sm:max-w-[130px]">{user.displayName}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={authBusy}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#E8D1B2] px-3 py-2 text-xs font-semibold text-[#2D1B12] hover:bg-[#DFC3A1] transition-colors whitespace-nowrap shrink-0 sm:gap-2 sm:px-4"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Forever</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl space-y-8 px-4 pt-7 sm:px-6 sm:pt-9">
        {errorBanner && (
          <div
            role="status"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8D1B2]/30 bg-[#9D4E42] px-4 py-3 text-sm text-[#E8D1B2]"
          >
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-xs font-semibold underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cozy Sticker Sheet Hero Header & Date Scroller */}
        <section className="sticker-cream relative rounded-[24px] p-4 sm:rounded-[28px] sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-start gap-3.5 sm:gap-5">
              <div className="relative shrink-0">
                <StarStickerIcon
                  className="h-14 w-14 sm:h-20 sm:w-20"
                  roundedClass="rounded-2xl"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#6C4D3B]">
                  {user
                    ? `Assalamu Alaikum, ${user.displayName} · Saved in your forever journal`
                    : 'Assalamu Alaikum'}
                </p>
                <h1
                  className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#2D1B12] sm:text-4xl"
                  style={{ textWrap: 'balance' }}
                >
                  {formatFriendlyDate(selectedDateKey)}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6C4D3B] sm:text-sm">
                  <span>
                    <strong className="font-mono-num text-[#2D1B12]">
                      {routineDoneCount}/{routineItems.filter((r) => r.isActive).length}
                    </strong>{' '}
                    routine blocks
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="font-mono-num text-[#2D1B12]">
                      {goalsDoneCount}/{selectedDayGoals.length}
                    </strong>{' '}
                    daily goals
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="font-mono-num text-[#2D1B12]">
                      {goodDeedsCount}
                    </strong>{' '}
                    good deeds
                  </span>
                </p>
              </div>
            </div>

            {/* Sticker Mood Card right side */}
            <div className="flex w-full items-center gap-3 rounded-2xl border border-[#2D1B12]/12 bg-[#E8D1B2]/80 px-3.5 py-3 lg:w-auto lg:shrink-0">
              <MoodStickerGraphic moodId={activeMood.id} className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#6C4D3B]">Today’s sticker note</p>
                <p className="font-display truncate text-sm font-medium italic text-[#2D1B12] sm:text-base">
                  “{activeMood.quote}”
                </p>
                <div className="mt-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {MOOD_STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => handleSelectMoodSticker(sticker.id)}
                      aria-label={`Choose sticker: ${sticker.label}`}
                      title={sticker.label}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform hover:scale-105 ${
                        activeMood.id === sticker.id
                          ? 'border-[#4E3222] bg-[#E8D1B2]'
                          : 'border-transparent bg-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <MoodStickerGraphic moodId={sticker.id} className="h-7 w-7" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Horizontal Date Scroller + Any-Day Date Picker */}
          <div className="mt-5 flex flex-col gap-3 border-t border-[#2D1B12]/10 pt-4 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:pt-5">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 snap-x">
              {sevenDayStrip.map((dateKey) => {
                const { weekday, dayNum } = formatShortDay(dateKey);
                const isSelected = dateKey === selectedDateKey;
                const isCurrentToday = dateKey === todayKey;
                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`flex min-h-[54px] min-w-[48px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl px-3 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#4E3222] text-[#E8D1B2]'
                        : 'border border-[#2D1B12]/12 bg-[#E8D1B2] text-[#2D1B12] hover:bg-[#DFC3A1]'
                    }`}
                  >
                    <span className="text-[11px] opacity-80">{weekday}</span>
                    <span className="font-mono-num text-sm font-semibold">
                      {dayNum}
                    </span>
                    {isCurrentToday && !isSelected && (
                      <span className="mt-0.5 text-[9px] font-medium text-[#6C4D3B]">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RibbonBowSticker className="hidden sm:block h-8 w-11" />
              <PWAInstallButton />
              <label
                htmlFor="jump-to-date"
                className="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-[#2D1B12]/15 bg-[#E8D1B2] px-3 py-2 text-xs font-medium text-[#2D1B12] sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#6C4D3B]" aria-hidden="true" />
                  <span>Jump to date</span>
                </span>
                <input
                  id="jump-to-date"
                  type="date"
                  value={selectedDateKey}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDateKey(e.target.value);
                  }}
                  className="font-mono-num bg-transparent text-xs text-[#2D1B12] focus:outline-none"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Main 2-Column Workspace: Daily Muslim Routine + Daily Goals Notepad */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RoutineBoard
              items={routineItems}
              completedIds={selectedLog.completedRoutineIds}
              onToggleComplete={handleToggleRoutineComplete}
              onAddItem={handleAddRoutineItem}
              onUpdateItem={handleUpdateRoutineItem}
              onDeleteItem={handleDeleteRoutineItem}
              onMoveItem={handleMoveRoutineItem}
              friendlyDateLabel={formatFriendlyDate(selectedDateKey)}
            />
          </div>

          <div className="lg:col-span-5">
            <DailyGoalsPad
              goals={selectedDayGoals}
              yesterdayUnfinishedCount={yesterdayUnfinishedGoals.length}
              onAddGoal={handleAddGoal}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              onCarryOverYesterday={handleCarryOverYesterday}
            />
          </div>
        </div>

        {/* Good & Bad Deeds Daily Reflection + Inspiring Comparison Message */}
        <DeedsMuhasabah
          selectedDateKey={selectedDateKey}
          isToday={selectedDateKey === todayKey}
          todayDeeds={selectedDayDeeds}
          yesterdayGoodCount={yesterdayGoodCount}
          yesterdayBadCount={yesterdayBadCount}
          reflectionNote={selectedLog.reflectionNote}
          hiddenGoodTitles={deedPrefs.hiddenGoodTitles}
          hiddenBadTitles={deedPrefs.hiddenBadTitles}
          onAddDeed={handleAddDeed}
          onUpdateDeed={handleUpdateDeed}
          onDeleteDeed={handleDeleteDeed}
          onHidePreset={handleHidePreset}
          onRestorePresets={handleRestorePresets}
          onSaveReflectionNote={handleSaveReflectionNote}
        />

        {/* Forever Journal History */}
        <HistoryOverview
          selectedDateKey={selectedDateKey}
          routineItems={routineItems}
          dailyLogs={dailyLogs}
          allGoals={allGoals}
          allDeeds={allDeeds}
          onSelectDate={setSelectedDateKey}
        />
      </main>

      <footer className="mx-auto mt-10 flex max-w-6xl items-center justify-center gap-2.5 px-4 text-center text-xs text-[#DFC3A1]/75 sm:mt-12 sm:px-6">
        <BrandBowLogo className="h-6 w-6" roundedClass="rounded-lg" />
        <p>
          Barakah Daily · One step at a time · Every sincere intention and good deed is worth recording
        </p>
      </footer>

      {/* Mobile Bottom Thumb-Zone Navigation (md:hidden, <= 15% sticky height cap) */}
      <nav
        aria-label="Mobile sections"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8D1B2]/15 bg-[#2B1910]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-4 items-center">
          <a
            href="#routine"
            onClick={() => setActiveMobileTab('routine')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeMobileTab === 'routine' ? 'text-[#E8D1B2]' : 'text-[#DFC3A1]/75'
            }`}
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
            <span>Routine</span>
          </a>
          <a
            href="#goals"
            onClick={() => setActiveMobileTab('goals')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeMobileTab === 'goals' ? 'text-[#E8D1B2]' : 'text-[#DFC3A1]/75'
            }`}
          >
            <CheckSquare className="h-5 w-5" aria-hidden="true" />
            <span>Goals</span>
          </a>
          <a
            href="#deeds"
            onClick={() => setActiveMobileTab('deeds')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeMobileTab === 'deeds' ? 'text-[#E8D1B2]' : 'text-[#DFC3A1]/75'
            }`}
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <span>Deeds</span>
          </a>
          <a
            href="#history"
            onClick={() => setActiveMobileTab('history')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeMobileTab === 'history' ? 'text-[#E8D1B2]' : 'text-[#DFC3A1]/75'
            }`}
          >
            <History className="h-5 w-5" aria-hidden="true" />
            <span>History</span>
          </a>
        </div>
      </nav>

    </div>
  );
}
