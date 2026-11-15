import { RoutineItem, RoutinePeriod } from '../types';

export const ROUTINE_PERIODS: RoutinePeriod[] = [
  'Morning',
  'Noon',
  'Afternoon',
  'Evening',
  'Night',
];

export const DEFAULT_ROUTINE_ITEMS: Omit<RoutineItem, 'id'>[] = [];

export const GOOD_DEED_PRESETS = [
  { title: 'Prayed on time', category: 'Salah' },
  { title: 'Recited Qur’an', category: 'Qur’an' },
  { title: 'Morning or Evening Adhkar', category: 'Dhikr' },
  { title: 'Gave Sadaqah / Charity', category: 'Kindness' },
  { title: 'Helped family or someone in need', category: 'Kindness' },
  { title: 'Spoke kindly & smiled', category: 'Character' },
  { title: 'Protected my time from waste', category: 'Discipline' },
  { title: 'Made Istighfar & Dua', category: 'Dhikr' },
];

export const BAD_DEED_PRESETS = [
  { title: 'Wasted time scrolling', category: 'Time' },
  { title: 'Delayed a prayer', category: 'Salah' },
  { title: 'Lost patience or got angry', category: 'Character' },
  { title: 'Spoke harshly or gossiped', category: 'Speech' },
  { title: 'Skipped Adhkar', category: 'Dhikr' },
];

export const MOOD_STICKERS = [
  { id: 'coffee_heart', label: 'Warm & Grateful', quote: 'coffee first, barakah always' },
  { id: 'books_focus', label: 'Focused & Growing', quote: 'focus · grow · inspire' },
  { id: 'bow_calm', label: 'Peaceful Heart', quote: 'one step at a time' },
  { id: 'leaf_grateful', label: 'Gentle Progress', quote: 'good things take time' },
  { id: 'sunnah_smile', label: 'Bright & Kind', quote: 'it’s a good day to have a good day' },
];

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getOffsetDateKey(dateKey: string, offsetDays: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + offsetDays);
  return formatDateKey(d);
}

export function getLastNDaysKeys(endDateKey: string, count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(getOffsetDateKey(endDateKey, -i));
  }
  return keys;
}

export function formatFriendlyDate(dateKey: string): string {
  const todayKey = getTodayKey();
  const yesterdayKey = getOffsetDateKey(todayKey, -1);
  const d = parseDateKey(dateKey);
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  if (dateKey === todayKey) return `Today · ${formatted}`;
  if (dateKey === yesterdayKey) return `Yesterday · ${formatted}`;
  return formatted;
}

export function formatShortDay(dateKey: string): { weekday: string; dayNum: string } {
  const d = parseDateKey(dateKey);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: String(d.getDate()),
  };
}

export function getCurrentTimeLabel(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface InspirationMessage {
  headline: string;
  body: string;
  tone: 'ahead' | 'matched' | 'encourage' | 'fresh';
}

export function getDeedInspirationMessage(
  selectedGood: number,
  previousGood: number,
  selectedBad: number,
  previousBad: number,
  isToday: boolean
): InspirationMessage {
  const dayWord = isToday ? 'today' : 'on this day';
  const prevWord = isToday ? 'yesterday' : 'the day before';

  if (selectedGood === 0 && previousGood === 0) {
    return {
      headline: 'Begin with one sincere good deed',
      body: `Good things take time. Log your first small act of worship or kindness ${dayWord} — even a sincere "Alhamdulillah" or a smile counts as charity.`,
      tone: 'fresh',
    };
  }

  if (selectedGood > previousGood) {
    const diff = selectedGood - previousGood;
    const extraBadNote =
      previousBad > 0 && selectedBad < previousBad
        ? ` Plus, you kept slip-ups lower than ${prevWord} (${selectedBad} vs ${previousBad}).`
        : '';
    return {
      headline: `Masha’Allah! ${diff} more good ${diff === 1 ? 'deed' : 'deeds'} than ${prevWord}`,
      body: `You reached ${selectedGood} good ${selectedGood === 1 ? 'deed' : 'deeds'} ${dayWord} compared to ${previousGood} ${prevWord}.${extraBadNote} Small steps make big changes — keep going!`,
      tone: 'ahead',
    };
  }

  if (selectedGood === previousGood && selectedGood > 0) {
    return {
      headline: `Steady heart — you matched ${prevWord} (${selectedGood})`,
      body: `Consistency is beloved to Allah. Log just one more small act of kindness or dhikr ${dayWord} to rise above ${prevWord}!`,
      tone: 'matched',
    };
  }

  const remaining = previousGood - selectedGood;
  return {
    headline: `You can do this — ${remaining} ${remaining === 1 ? 'deed' : 'deeds'} away from ${prevWord}`,
    body: `${prevWord.charAt(0).toUpperCase() + prevWord.slice(1)} you logged ${previousGood} good ${previousGood === 1 ? 'deed' : 'deeds'}, and ${dayWord} you have ${selectedGood}. Don’t be discouraged — one prayer on time, a verse of Qur’an, or helping someone right now will lift your day!`,
    tone: 'encourage',
  };
}
