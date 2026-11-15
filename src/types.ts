export type RoutinePeriod =
  | 'Morning'
  | 'Noon'
  | 'Afternoon'
  | 'Evening'
  | 'Night'
  | 'Fajr'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Isha';

export type DeedType = 'good' | 'bad';

export interface RoutineItem {
  id: string;
  title: string;
  timeLabel: string;
  period: RoutinePeriod;
  durationMinutes: number;
  sortOrder: number;
  isActive: boolean;
}

export interface DailyGoal {
  id: string;
  dateKey: string;
  title: string;
  completed: boolean;
  isRecurring: boolean;
  sortOrder: number;
}

export interface DeedEntry {
  id: string;
  dateKey: string;
  type: DeedType;
  title: string;
  category: string;
  note: string;
  timeLabel: string;
}

export interface DailyLog {
  dateKey: string;
  completedRoutineIds: string[];
  reflectionNote: string;
  moodSticker: string;
  goodCount: number;
  badCount: number;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
}

export interface DeedPreferences {
  hiddenGoodTitles: string[];
  hiddenBadTitles: string[];
}

export type StorageMode = 'cloud' | 'local';
