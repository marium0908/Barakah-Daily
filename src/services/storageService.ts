import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  DailyGoal,
  DailyLog,
  DeedEntry,
  DeedPreferences,
  RoutineItem,
  RoutinePeriod,
} from '../types';

const LOCAL_KEYS = {
  routine: 'barakah_routine_items_v2',
  logs: 'barakah_daily_logs_v1',
  goals: 'barakah_daily_goals_v1',
  deeds: 'barakah_deed_entries_v1',
  deedPrefs: 'barakah_deed_prefs_v1',
};

export function createSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function clampString(value: string, max: number): string {
  return value.trim().slice(0, max);
}

// ==========================================
// LOCAL STORAGE FALLBACK (GUEST / INSTANT)
// ==========================================

export function loadLocalRoutineItems(): RoutineItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.routine);
    if (raw) {
      const parsed = JSON.parse(raw) as RoutineItem[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return [];
}

export function saveLocalRoutineItems(items: RoutineItem[]): void {
  localStorage.setItem(LOCAL_KEYS.routine, JSON.stringify(items));
}

export function loadLocalDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.logs);
    return raw ? (JSON.parse(raw) as Record<string, DailyLog>) : {};
  } catch {
    return {};
  }
}

export function saveLocalDailyLogs(logs: Record<string, DailyLog>): void {
  localStorage.setItem(LOCAL_KEYS.logs, JSON.stringify(logs));
}

export function loadLocalGoals(): DailyGoal[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.goals);
    return raw ? (JSON.parse(raw) as DailyGoal[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalGoals(goals: DailyGoal[]): void {
  localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(goals));
}

export function loadLocalDeeds(): DeedEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.deeds);
    return raw ? (JSON.parse(raw) as DeedEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalDeeds(deeds: DeedEntry[]): void {
  localStorage.setItem(LOCAL_KEYS.deeds, JSON.stringify(deeds));
}

export function loadLocalDeedPreferences(): DeedPreferences {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.deedPrefs);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DeedPreferences>;
      return {
        hiddenGoodTitles: Array.isArray(parsed.hiddenGoodTitles)
          ? parsed.hiddenGoodTitles.map(String)
          : [],
        hiddenBadTitles: Array.isArray(parsed.hiddenBadTitles)
          ? parsed.hiddenBadTitles.map(String)
          : [],
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return { hiddenGoodTitles: [], hiddenBadTitles: [] };
}

export function saveLocalDeedPreferences(prefs: DeedPreferences): void {
  localStorage.setItem(LOCAL_KEYS.deedPrefs, JSON.stringify(prefs));
}

// ==========================================
// CLOUD FIRESTORE (FOREVER PERSISTENCE)
// ==========================================

export async function ensureUserInitialized(uid: string, displayName: string): Promise<void> {
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!existingSnap.exists()) {
    try {
      await setDoc(userRef, {
        ownerId: uid,
        displayName: clampString(displayName || 'Friend', 80) || 'Friend',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  }

  // Migrate any local data created before sign-in if cloud is brand new
  const routineColPath = `users/${uid}/routineItems`;
  let routineSnap;
  try {
    routineSnap = await getDocs(collection(db, 'users', uid, 'routineItems'));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, routineColPath);
  }

  if (routineSnap.empty) {
    const localRoutine = loadLocalRoutineItems();
    const localGoals = loadLocalGoals();
    const localDeeds = loadLocalDeeds();
    const localLogs = loadLocalDailyLogs();
    const localPrefs = loadLocalDeedPreferences();

    const hasAnythingToMigrate =
      localRoutine.length > 0 ||
      localGoals.length > 0 ||
      localDeeds.length > 0 ||
      Object.keys(localLogs).length > 0 ||
      localPrefs.hiddenGoodTitles.length > 0 ||
      localPrefs.hiddenBadTitles.length > 0;

    if (hasAnythingToMigrate) {
      const batch = writeBatch(db);
      localRoutine.slice(0, 30).forEach((item, index) => {
        const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '') || createSafeId('routine');
        const ref = doc(db, 'users', uid, 'routineItems', safeId);
        batch.set(ref, {
          ownerId: uid,
          title: clampString(item.title, 120) || 'Routine Step',
          timeLabel: clampString(item.timeLabel, 32) || '08:00 AM',
          period: item.period,
          durationMinutes: Math.max(1, Math.min(720, Math.round(item.durationMinutes || 20))),
          sortOrder: Math.max(0, Math.min(500, Math.round(item.sortOrder ?? index))),
          isActive: Boolean(item.isActive),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      localGoals.slice(0, 60).forEach((g) => {
        const safeId = g.id.replace(/[^a-zA-Z0-9_-]/g, '') || createSafeId('goal');
        const ref = doc(db, 'users', uid, 'goals', safeId);
        batch.set(ref, {
          ownerId: uid,
          dateKey: g.dateKey,
          title: clampString(g.title, 160) || 'Daily Goal',
          completed: Boolean(g.completed),
          isRecurring: Boolean(g.isRecurring),
          sortOrder: Math.max(0, Math.min(500, Math.round(g.sortOrder || 0))),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      localDeeds.slice(0, 80).forEach((d) => {
        const safeId = d.id.replace(/[^a-zA-Z0-9_-]/g, '') || createSafeId('deed');
        const ref = doc(db, 'users', uid, 'deeds', safeId);
        batch.set(ref, {
          ownerId: uid,
          dateKey: d.dateKey,
          type: d.type === 'bad' ? 'bad' : 'good',
          title: clampString(d.title, 140) || 'Deed',
          category: clampString(d.category, 40) || 'General',
          note: clampString(d.note || '', 400),
          timeLabel: clampString(d.timeLabel, 24) || 'Today',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      Object.values(localLogs)
        .slice(0, 30)
        .forEach((log) => {
          if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(log.dateKey)) return;
          const ref = doc(db, 'users', uid, 'dailyLogs', log.dateKey);
          batch.set(ref, {
            ownerId: uid,
            dateKey: log.dateKey,
            completedRoutineIds: (log.completedRoutineIds || []).slice(0, 40),
            reflectionNote: clampString(log.reflectionNote || '', 1000),
            moodSticker: clampString(log.moodSticker || 'coffee_heart', 40) || 'coffee_heart',
            goodCount: Math.max(0, Math.min(500, Math.round(log.goodCount || 0))),
            badCount: Math.max(0, Math.min(500, Math.round(log.badCount || 0))),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

      if (
        localPrefs.hiddenGoodTitles.length > 0 ||
        localPrefs.hiddenBadTitles.length > 0
      ) {
        const prefRef = doc(db, 'users', uid, 'preferences', 'deeds');
        batch.set(prefRef, {
          ownerId: uid,
          hiddenGoodTitles: localPrefs.hiddenGoodTitles.slice(0, 30).map((t) => clampString(t, 140)).filter(Boolean),
          hiddenBadTitles: localPrefs.hiddenBadTitles.slice(0, 30).map((t) => clampString(t, 140)).filter(Boolean),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}/migration`);
      }
    }
  }
}

export function subscribeRoutineItems(
  uid: string,
  onData: (items: RoutineItem[]) => void
): () => void {
  const path = `users/${uid}/routineItems`;
  const q = query(collection(db, 'users', uid, 'routineItems'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RoutineItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title ?? ''),
          timeLabel: String(data.timeLabel ?? ''),
          period: (data.period as RoutinePeriod) || 'Morning',
          durationMinutes: Number(data.durationMinutes ?? 20),
          sortOrder: Number(data.sortOrder ?? 0),
          isActive: Boolean(data.isActive ?? true),
        };
      });
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeDailyLogs(
  uid: string,
  onData: (logs: Record<string, DailyLog>) => void
): () => void {
  const path = `users/${uid}/dailyLogs`;
  return onSnapshot(
    collection(db, 'users', uid, 'dailyLogs'),
    (snapshot) => {
      const map: Record<string, DailyLog> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        map[d.id] = {
          dateKey: String(data.dateKey ?? d.id),
          completedRoutineIds: Array.isArray(data.completedRoutineIds)
            ? data.completedRoutineIds.map(String)
            : [],
          reflectionNote: String(data.reflectionNote ?? ''),
          moodSticker: String(data.moodSticker ?? 'coffee_heart'),
          goodCount: Number(data.goodCount ?? 0),
          badCount: Number(data.badCount ?? 0),
        };
      });
      onData(map);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeGoals(uid: string, onData: (goals: DailyGoal[]) => void): () => void {
  const path = `users/${uid}/goals`;
  const q = query(collection(db, 'users', uid, 'goals'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: DailyGoal[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          dateKey: String(data.dateKey ?? ''),
          title: String(data.title ?? ''),
          completed: Boolean(data.completed),
          isRecurring: Boolean(data.isRecurring),
          sortOrder: Number(data.sortOrder ?? 0),
        };
      });
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeDeeds(uid: string, onData: (deeds: DeedEntry[]) => void): () => void {
  const path = `users/${uid}/deeds`;
  const q = query(collection(db, 'users', uid, 'deeds'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: DeedEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          dateKey: String(data.dateKey ?? ''),
          type: data.type === 'bad' ? 'bad' : 'good',
          title: String(data.title ?? ''),
          category: String(data.category ?? 'General'),
          note: String(data.note ?? ''),
          timeLabel: String(data.timeLabel ?? ''),
        };
      });
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeDeedPreferences(
  uid: string,
  onData: (prefs: DeedPreferences, existsInCloud: boolean) => void
): () => void {
  const path = `users/${uid}/preferences/deeds`;
  return onSnapshot(
    doc(db, 'users', uid, 'preferences', 'deeds'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData({ hiddenGoodTitles: [], hiddenBadTitles: [] }, false);
        return;
      }
      const data = snapshot.data();
      onData(
        {
          hiddenGoodTitles: Array.isArray(data.hiddenGoodTitles)
            ? data.hiddenGoodTitles.map(String)
            : [],
          hiddenBadTitles: Array.isArray(data.hiddenBadTitles)
            ? data.hiddenBadTitles.map(String)
            : [],
        },
        true
      );
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export async function upsertDeedPreferencesCloud(
  uid: string,
  prefs: DeedPreferences,
  existsInCloud: boolean
): Promise<void> {
  const path = `users/${uid}/preferences/deeds`;
  const ref = doc(db, 'users', uid, 'preferences', 'deeds');
  const hiddenGoodTitles = prefs.hiddenGoodTitles
    .slice(0, 30)
    .map((t) => clampString(t, 140))
    .filter(Boolean);
  const hiddenBadTitles = prefs.hiddenBadTitles
    .slice(0, 30)
    .map((t) => clampString(t, 140))
    .filter(Boolean);

  try {
    if (!existsInCloud) {
      await setDoc(ref, {
        ownerId: uid,
        hiddenGoodTitles,
        hiddenBadTitles,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        hiddenGoodTitles,
        hiddenBadTitles,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsInCloud ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function upsertRoutineItemCloud(
  uid: string,
  item: RoutineItem,
  isNew: boolean
): Promise<void> {
  const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/routineItems/${safeId}`;
  const ref = doc(db, 'users', uid, 'routineItems', safeId);
  try {
    if (isNew) {
      await setDoc(ref, {
        ownerId: uid,
        title: clampString(item.title, 120),
        timeLabel: clampString(item.timeLabel, 32),
        period: item.period,
        durationMinutes: Math.max(1, Math.min(720, Math.round(item.durationMinutes))),
        sortOrder: Math.max(0, Math.min(500, Math.round(item.sortOrder))),
        isActive: Boolean(item.isActive),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        title: clampString(item.title, 120),
        timeLabel: clampString(item.timeLabel, 32),
        period: item.period,
        durationMinutes: Math.max(1, Math.min(720, Math.round(item.durationMinutes))),
        sortOrder: Math.max(0, Math.min(500, Math.round(item.sortOrder))),
        isActive: Boolean(item.isActive),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteRoutineItemCloud(uid: string, itemId: string): Promise<void> {
  const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/routineItems/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'routineItems', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function upsertDailyLogCloud(
  uid: string,
  log: DailyLog,
  existsInCloud: boolean
): Promise<void> {
  const path = `users/${uid}/dailyLogs/${log.dateKey}`;
  const ref = doc(db, 'users', uid, 'dailyLogs', log.dateKey);
  try {
    if (!existsInCloud) {
      await setDoc(ref, {
        ownerId: uid,
        dateKey: log.dateKey,
        completedRoutineIds: log.completedRoutineIds.slice(0, 40),
        reflectionNote: clampString(log.reflectionNote, 1000),
        moodSticker: clampString(log.moodSticker || 'coffee_heart', 40) || 'coffee_heart',
        goodCount: Math.max(0, Math.min(500, Math.round(log.goodCount))),
        badCount: Math.max(0, Math.min(500, Math.round(log.badCount))),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        completedRoutineIds: log.completedRoutineIds.slice(0, 40),
        reflectionNote: clampString(log.reflectionNote, 1000),
        moodSticker: clampString(log.moodSticker || 'coffee_heart', 40) || 'coffee_heart',
        goodCount: Math.max(0, Math.min(500, Math.round(log.goodCount))),
        badCount: Math.max(0, Math.min(500, Math.round(log.badCount))),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsInCloud ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function createGoalCloud(uid: string, goal: DailyGoal): Promise<void> {
  const safeId = goal.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/goals/${safeId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'goals', safeId), {
      ownerId: uid,
      dateKey: goal.dateKey,
      title: clampString(goal.title, 160),
      completed: Boolean(goal.completed),
      isRecurring: Boolean(goal.isRecurring),
      sortOrder: Math.max(0, Math.min(500, Math.round(goal.sortOrder))),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGoalCloud(
  uid: string,
  goalId: string,
  updates: Partial<Pick<DailyGoal, 'title' | 'completed' | 'isRecurring' | 'sortOrder'>>
): Promise<void> {
  const safeId = goalId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/goals/${safeId}`;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (typeof updates.title === 'string') payload.title = clampString(updates.title, 160);
  if (typeof updates.completed === 'boolean') payload.completed = updates.completed;
  if (typeof updates.isRecurring === 'boolean') payload.isRecurring = updates.isRecurring;
  if (typeof updates.sortOrder === 'number') {
    payload.sortOrder = Math.max(0, Math.min(500, Math.round(updates.sortOrder)));
  }
  try {
    await updateDoc(doc(db, 'users', uid, 'goals', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGoalCloud(uid: string, goalId: string): Promise<void> {
  const safeId = goalId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/goals/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'goals', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createDeedCloud(uid: string, deed: DeedEntry): Promise<void> {
  const safeId = deed.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/deeds/${safeId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'deeds', safeId), {
      ownerId: uid,
      dateKey: deed.dateKey,
      type: deed.type === 'bad' ? 'bad' : 'good',
      title: clampString(deed.title, 140),
      category: clampString(deed.category, 40),
      note: clampString(deed.note || '', 400),
      timeLabel: clampString(deed.timeLabel, 24),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDeedCloud(
  uid: string,
  deedId: string,
  updates: Partial<Pick<DeedEntry, 'type' | 'title' | 'category' | 'note' | 'timeLabel'>>
): Promise<void> {
  const safeId = deedId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/deeds/${safeId}`;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.type === 'good' || updates.type === 'bad') payload.type = updates.type;
  if (typeof updates.title === 'string') {
    const cleanTitle = clampString(updates.title, 140);
    if (cleanTitle) payload.title = cleanTitle;
  }
  if (typeof updates.category === 'string') {
    payload.category = clampString(updates.category, 40) || 'General';
  }
  if (typeof updates.note === 'string') {
    payload.note = clampString(updates.note, 400);
  }
  if (typeof updates.timeLabel === 'string') {
    payload.timeLabel = clampString(updates.timeLabel, 24) || 'Today';
  }
  try {
    await updateDoc(doc(db, 'users', uid, 'deeds', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDeedCloud(uid: string, deedId: string): Promise<void> {
  const safeId = deedId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `users/${uid}/deeds/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'deeds', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
