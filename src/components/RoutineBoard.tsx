import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { ROUTINE_PERIODS } from '../data/defaults';
import { RoutineItem, RoutinePeriod } from '../types';
import { StackedBooksSticker } from './Stickers';

interface RoutineBoardProps {
  items: RoutineItem[];
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  onAddItem: (item: Omit<RoutineItem, 'id' | 'sortOrder'>) => void;
  onUpdateItem: (item: RoutineItem) => void;
  onDeleteItem: (id: string) => void;
  onMoveItem: (id: string, direction: 'up' | 'down') => void;
  friendlyDateLabel: string;
}

export const RoutineBoard: React.FC<RoutineBoardProps> = ({
  items,
  completedIds,
  onToggleComplete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  friendlyDateLabel,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('07:00 AM');
  const [newPeriod, setNewPeriod] = useState<RoutinePeriod>('Morning');
  const [newDuration, setNewDuration] = useState(25);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPeriod, setEditPeriod] = useState<RoutinePeriod>('Morning');
  const [editDuration, setEditDuration] = useState(20);

  const activeItems = items.filter((item) => item.isActive);
  const completedCount = activeItems.filter((item) => completedIds.includes(item.id)).length;
  const totalMinutes = activeItems
    .filter((item) => completedIds.includes(item.id))
    .reduce((sum, item) => sum + item.durationMinutes, 0);
  const progressPct =
    activeItems.length > 0 ? Math.round((completedCount / activeItems.length) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddItem({
      title: trimmed,
      timeLabel: newTime.trim() || '08:00 AM',
      period: newPeriod,
      durationMinutes: Math.max(1, Math.min(720, Number(newDuration) || 20)),
      isActive: true,
    });
    setNewTitle('');
  };

  const LEGACY_PERIOD_MAP: Record<string, RoutinePeriod> = {
    Fajr: 'Morning',
    Dhuhr: 'Noon',
    Asr: 'Afternoon',
    Maghrib: 'Evening',
    Isha: 'Night',
  };

  const startEdit = (item: RoutineItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditTime(item.timeLabel);
    setEditPeriod(LEGACY_PERIOD_MAP[item.period] || item.period);
    setEditDuration(item.durationMinutes);
  };

  const saveEdit = (item: RoutineItem) => {
    if (!editTitle.trim()) return;
    onUpdateItem({
      ...item,
      title: editTitle.trim(),
      timeLabel: editTime.trim() || item.timeLabel,
      period: editPeriod,
      durationMinutes: Math.max(1, Math.min(720, Number(editDuration) || 20)),
    });
    setEditingId(null);
  };

  return (
    <section
      id="routine"
      aria-labelledby="routine-heading"
      className="sticker-cream relative scroll-mt-20 rounded-[24px] p-4 sm:rounded-[26px] sm:p-7"
    >
      {/* Subtle kraft washi tape strip */}
      <div
        className="washi-tape pointer-events-none absolute -top-3 left-6 h-6 w-24 -rotate-2 rounded-sm sm:left-10 sm:w-28"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 border-b border-[#2D1B12]/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <StackedBooksSticker className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <div>
            <p className="text-xs font-medium text-[#6C4D3B]">{friendlyDateLabel}</p>
            <h2
              id="routine-heading"
              className="font-display text-2xl font-semibold tracking-tight text-[#2D1B12]"
            >
              Daily Muslim Routine
            </h2>
            <p className="mt-0.5 text-sm text-[#6C4D3B]">
              <span className="font-mono-num font-medium text-[#2D1B12]">
                {completedCount}/{activeItems.length}
              </span>{' '}
              completed <span aria-hidden="true">·</span>{' '}
              <span className="font-mono-num">{totalMinutes}m</span> intentional time
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCustomizing((prev) => !prev);
            setEditingId(null);
          }}
          className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E3222] ${
            isCustomizing
              ? 'bg-[#4E3222] text-[#E8D1B2]'
              : 'border border-[#2D1B12]/20 bg-[#E8D1B2] text-[#2D1B12] hover:bg-[#DFC3A1]'
          }`}
        >
          {isCustomizing ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Done Customizing
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Customize Routine
            </>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[#6C4D3B]">
          <span>Daily rhythm progress</span>
          <span className="font-mono-num font-medium text-[#2D1B12]">{progressPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#2D1B12]/10">
          <div
            className="h-full rounded-full bg-[#4E3222] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Add new routine block form when customizing or when routine is empty */}
      {(isCustomizing || items.length === 0) && (
        <form
          onSubmit={handleAddSubmit}
          className="mt-5 rounded-2xl border border-[#2D1B12]/15 bg-[#E8D1B2]/65 p-4"
        >
          <p className="text-sm font-semibold text-[#2D1B12]">
            Add a forever routine block
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <label htmlFor="routine-title" className="sr-only">
                Activity name
              </label>
              <input
                id="routine-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Morning Prayer, Qur’an, or Study"
                maxLength={120}
                className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm text-[#2D1B12] placeholder:text-[#6C4D3B]/75 focus:border-[#4E3222] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="routine-time" className="sr-only">
                Time label
              </label>
              <input
                id="routine-time"
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="09:00 AM"
                maxLength={32}
                className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm text-[#2D1B12] font-mono-num focus:border-[#4E3222] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="routine-period" className="sr-only">
                Time of day
              </label>
              <select
                id="routine-period"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value as RoutinePeriod)}
                className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-2 text-sm text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
              >
                {ROUTINE_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="routine-duration" className="sr-only">
                Duration in minutes
              </label>
              <input
                id="routine-duration"
                type="number"
                min={1}
                max={720}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                aria-label="Minutes"
                className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm text-[#2D1B12] font-mono-num focus:border-[#4E3222] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#4E3222] px-4 py-2 text-sm font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Save to My Routine
            </button>
          </div>
        </form>
      )}

      {/* Routine checklist or editor list */}
      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#2D1B12]/20 p-6 text-center">
          <p className="font-display text-lg text-[#2D1B12]">No routine blocks yet</p>
          <p className="mt-1 text-sm text-[#6C4D3B]">
            Add your own daily prayers, Qur’an, study, or rest blocks above — they will save forever.
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-[#2D1B12]/10">
          {items.map((item, idx) => {
            const isChecked = completedIds.includes(item.id);
            const isEditing = editingId === item.id;

            if (isEditing) {
              return (
                <li key={item.id} className="py-3">
                  <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#E8D1B2]/70 p-3 sm:grid-cols-12">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={120}
                      aria-label="Edit activity title"
                      className="min-h-[44px] rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm sm:col-span-5"
                    />
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      maxLength={32}
                      aria-label="Edit time"
                      className="min-h-[44px] rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm font-mono-num sm:col-span-3"
                    />
                    <select
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value as RoutinePeriod)}
                      aria-label="Edit period"
                      className="min-h-[44px] rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-2 text-sm sm:col-span-2"
                    >
                      {ROUTINE_PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      aria-label="Edit duration minutes"
                      className="min-h-[44px] rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-2 text-sm font-mono-num sm:col-span-2"
                    />
                    <div className="flex items-center justify-end gap-2 sm:col-span-12">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[#2D1B12]/20 px-3 text-xs font-medium text-[#6C4D3B] hover:bg-[#DFC3A1]/60"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(item)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-xl bg-[#4E3222] px-4 text-xs font-medium text-[#E8D1B2] hover:bg-[#3A2419]"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Save
                      </button>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                <div
                  className={`flex gap-2.5 rounded-2xl px-2 py-2 transition-colors hover:bg-[#E8D1B2]/35 ${
                    isCustomizing
                      ? 'flex-col sm:flex-row sm:items-center sm:justify-between'
                      : 'items-center justify-between'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => !isCustomizing && onToggleComplete(item.id)}
                    disabled={isCustomizing}
                    className="flex min-h-[44px] flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E3222]"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                        isChecked
                          ? 'border-[#4E3222] bg-[#4E3222] text-[#E8D1B2]'
                          : 'border-[#6C4D3B]/50 bg-[#E8D1B2]'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.8]" aria-hidden="true" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium transition-colors sm:text-[15px] ${
                          isChecked ? 'text-[#6C4D3B] line-through' : 'text-[#2D1B12]'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6C4D3B]">
                        <span className="inline-flex items-center gap-1 font-mono-num">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {item.timeLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.period}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{item.durationMinutes} min</span>
                      </p>
                    </div>
                  </button>

                  {isCustomizing ? (
                    <div className="flex items-center justify-end gap-1 border-t border-[#2D1B12]/8 pt-2 sm:border-t-0 sm:pt-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => onMoveItem(item.id, 'up')}
                        disabled={idx === 0}
                        aria-label={`Move ${item.title} up`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#2D1B12]/10 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem(item.id, 'down')}
                        disabled={idx === items.length - 1}
                        aria-label={`Move ${item.title} down`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#2D1B12]/10 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4E3222] hover:bg-[#2D1B12]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#4E3222]/10 hover:text-[#2D1B12]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                        isChecked ? 'text-[#4E3222]' : 'text-[#6C4D3B]/70'
                      }`}
                    >
                      {isChecked ? 'Done' : 'Pending'}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
