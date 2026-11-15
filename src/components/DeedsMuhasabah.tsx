import React, { useEffect, useState } from 'react';
import {
  Check,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';
import {
  BAD_DEED_PRESETS,
  GOOD_DEED_PRESETS,
  getDeedInspirationMessage,
} from '../data/defaults';
import { DeedEntry, DeedType } from '../types';
import {
  CrescentHeartSticker,
  LeafSprigSticker,
  RibbonBowSticker,
  StarStickerIcon,
} from './Stickers';

interface DeedsMuhasabahProps {
  selectedDateKey: string;
  isToday: boolean;
  todayDeeds: DeedEntry[];
  yesterdayGoodCount: number;
  yesterdayBadCount: number;
  reflectionNote: string;
  hiddenGoodTitles: string[];
  hiddenBadTitles: string[];
  onAddDeed: (type: DeedType, title: string, category: string, note: string) => void;
  onUpdateDeed: (deed: DeedEntry) => void;
  onDeleteDeed: (id: string) => void;
  onHidePreset: (type: DeedType, title: string) => void;
  onRestorePresets: (type: DeedType) => void;
  onSaveReflectionNote: (note: string) => void;
}

export const DeedsMuhasabah: React.FC<DeedsMuhasabahProps> = ({
  selectedDateKey,
  isToday,
  todayDeeds,
  yesterdayGoodCount,
  yesterdayBadCount,
  reflectionNote,
  hiddenGoodTitles,
  hiddenBadTitles,
  onAddDeed,
  onUpdateDeed,
  onDeleteDeed,
  onHidePreset,
  onRestorePresets,
  onSaveReflectionNote,
}) => {
  const [goodInput, setGoodInput] = useState('');
  const [goodNote, setGoodNote] = useState('');
  const [badInput, setBadInput] = useState('');
  const [badNote, setBadNote] = useState('');
  const [noteDraft, setNoteDraft] = useState(reflectionNote);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editType, setEditType] = useState<DeedType>('good');

  useEffect(() => {
    setNoteDraft(reflectionNote);
    setEditingId(null);
  }, [reflectionNote, selectedDateKey]);

  const startEditingDeed = (deed: DeedEntry) => {
    setEditingId(deed.id);
    setEditTitle(deed.title);
    setEditCategory(deed.category);
    setEditNote(deed.note);
    setEditType(deed.type);
  };

  const saveEditingDeed = (deed: DeedEntry) => {
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) return;
    onUpdateDeed({
      ...deed,
      type: editType,
      title: cleanTitle,
      category: editCategory.trim() || (editType === 'good' ? 'Good Deed' : 'Improve'),
      note: editNote.trim(),
    });
    setEditingId(null);
  };

  const goodDeeds = todayDeeds.filter((d) => d.type === 'good');
  const badDeeds = todayDeeds.filter((d) => d.type === 'bad');

  const inspiration = getDeedInspirationMessage(
    goodDeeds.length,
    yesterdayGoodCount,
    badDeeds.length,
    yesterdayBadCount,
    isToday
  );

  const handleCustomGood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodInput.trim()) return;
    onAddDeed('good', goodInput.trim(), 'Good Deed', goodNote.trim());
    setGoodInput('');
    setGoodNote('');
  };

  const handleCustomBad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badInput.trim()) return;
    onAddDeed('bad', badInput.trim(), 'Improve', badNote.trim());
    setBadInput('');
    setBadNote('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflectionNote(noteDraft);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1800);
  };

  return (
    <section id="deeds" aria-labelledby="deeds-heading" className="scroll-mt-20 space-y-6">
      {/* Inspiring Day-over-Day Muhasabah Message Banner */}
      <div className="sticker-roast relative overflow-hidden rounded-[24px] p-5 sm:rounded-[26px] sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-5">
            <div className="shrink-0 pt-0.5">
              {inspiration.tone === 'ahead' ? (
                <CrescentHeartSticker className="h-12 w-12 sm:h-16 sm:w-16" />
              ) : inspiration.tone === 'encourage' ? (
                <RibbonBowSticker className="h-11 w-14 sm:h-14 sm:w-16" />
              ) : (
                <LeafSprigSticker className="h-12 w-10 sm:h-14 sm:w-12" />
              )}
            </div>
            <div className="min-w-0 max-w-2xl">
              <p className="text-xs font-medium text-[#E8D1B2]">
                Daily Muhasabah · Good &amp; Bad Deeds Reflection
              </p>
              <h2
                id="deeds-heading"
                className="font-display mt-1 text-xl font-semibold text-[#E8D1B2] sm:text-3xl"
                style={{ textWrap: 'balance' }}
              >
                {inspiration.headline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#EAD8C3] sm:text-[15px]">
                {inspiration.body}
              </p>
            </div>
          </div>

          {/* Crisp numeric comparison (tabular-nums) */}
          <div className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-[#E8D1B2]/15 bg-[#2D1B12]/55 p-3.5 text-center sm:p-4 lg:w-auto lg:shrink-0 lg:gap-3">
            <div>
              <p className="text-[11px] text-[#DFC3A1]">
                {isToday ? 'Today Good' : 'Day Good'}
              </p>
              <p className="font-mono-num mt-1 text-xl font-semibold text-[#E8D1B2] sm:text-2xl">
                {goodDeeds.length}
              </p>
            </div>
            <div className="border-x border-[#E8D1B2]/15 px-2 sm:px-3">
              <p className="text-[11px] text-[#DFC3A1]">
                {isToday ? 'Yesterday' : 'Prev Day'}
              </p>
              <p className="font-mono-num mt-1 text-xl font-semibold text-[#E8D1B2] sm:text-2xl">
                {yesterdayGoodCount}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#DFC3A1]">To Improve</p>
              <p className="font-mono-num mt-1 text-xl font-semibold text-[#E8D1B2] sm:text-2xl">
                {badDeeds.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Good vs Bad Deeds Logging */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Good Deeds Column */}
        <div className="sticker-cream relative rounded-[24px] p-4 sm:rounded-[26px] sm:p-7">
          <div
            className="washi-tape pointer-events-none absolute -top-3 left-6 h-6 w-20 -rotate-1 rounded-sm sm:left-8 sm:w-24"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-3 border-b border-[#2D1B12]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <StarStickerIcon className="h-9 w-9" roundedClass="rounded-xl" />
              <div>
                <h3 className="font-display text-xl font-semibold text-[#2D1B12]">
                  Good Deeds Logged
                </h3>
                <p className="text-xs text-[#6C4D3B]">
                  Tap a quick deed or write your own
                </p>
              </div>
            </div>
            <span className="font-mono-num inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#4E3222]">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              {goodDeeds.length}
            </span>
          </div>

          {/* Quick-tap Good Deed presets with + log and - remove options */}
          {(() => {
            const visibleGoodPresets = GOOD_DEED_PRESETS.filter(
              (p) => !hiddenGoodTitles.includes(p.title)
            );
            return (
              <div className="mt-4">
                {visibleGoodPresets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {visibleGoodPresets.map((preset) => (
                      <div
                        key={preset.title}
                        className="inline-flex min-h-[44px] items-stretch overflow-hidden rounded-xl border border-[#2D1B12]/15 bg-[#E8D1B2]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onAddDeed('good', preset.title, preset.category, '')
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-[#2D1B12] hover:bg-[#DFC3A1]/70 transition-colors"
                        >
                          <Plus
                            className="h-3.5 w-3.5 shrink-0 text-[#4E3222]"
                            aria-hidden="true"
                          />
                          <span>{preset.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onHidePreset('good', preset.title)}
                          aria-label={`Remove option ${preset.title}`}
                          title={`Remove "${preset.title}" option`}
                          className="inline-flex min-w-[38px] items-center justify-center border-l border-[#2D1B12]/12 px-2 text-[#6C4D3B] hover:bg-[#E8D1B2]/70 hover:text-[#2D1B12] transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {hiddenGoodTitles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onRestorePresets('good')}
                    className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-[#6C4D3B] underline underline-offset-4 hover:text-[#2D1B12]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Restore {hiddenGoodTitles.length} removed quick{' '}
                    {hiddenGoodTitles.length === 1 ? 'option' : 'options'}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Custom Good Deed Form */}
          <form onSubmit={handleCustomGood} className="mt-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="custom-good-deed" className="sr-only">
                Custom good deed
              </label>
              <input
                id="custom-good-deed"
                type="text"
                value={goodInput}
                onChange={(e) => setGoodInput(e.target.value)}
                placeholder="Log another good deed..."
                maxLength={140}
                className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3.5 text-sm text-[#2D1B12] placeholder:text-[#6C4D3B]/60 focus:border-[#4E3222] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#4E3222] px-4 text-sm font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0 sm:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Log Good
              </button>
            </div>
            <input
              type="text"
              value={goodNote}
              onChange={(e) => setGoodNote(e.target.value)}
              placeholder="Optional short note (e.g. felt peaceful after Fajr)"
              maxLength={400}
              aria-label="Optional good deed note"
              className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/15 bg-[#E8D1B2]/70 px-3.5 text-xs text-[#2D1B12] placeholder:text-[#6C4D3B]/60 focus:border-[#4E3222] focus:outline-none"
            />
          </form>

          {/* Logged Good Deeds list */}
          {goodDeeds.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-[#2D1B12]/15 p-5 text-center text-xs text-[#6C4D3B]">
              No good deeds logged for this day yet. Tap any button above to begin.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#2D1B12]/10">
              {goodDeeds.map((deed) => {
                const isEditing = editingId === deed.id;
                if (isEditing) {
                  return (
                    <li key={deed.id} className="py-3">
                      <div className="space-y-2 rounded-2xl border border-[#2D1B12]/15 bg-[#E8D1B2] p-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={140}
                          aria-label="Edit good deed title"
                          className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                        />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            maxLength={40}
                            placeholder="Category"
                            aria-label="Edit deed category"
                            className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                          />
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as DeedType)}
                            aria-label="Edit deed type"
                            className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                          >
                            <option value="good">Good Deed</option>
                            <option value="bad">Slip-up to Improve</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          maxLength={400}
                          placeholder="Optional reflection note..."
                          aria-label="Edit deed note"
                          className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#2D1B12]/20 px-3.5 text-xs font-medium text-[#6C4D3B] hover:bg-[#E8D1B2]/40"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditingDeed(deed)}
                            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-[#4E3222] px-4 text-xs font-medium text-[#E8D1B2] hover:bg-[#3A2419]"
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
                  <li
                    key={deed.id}
                    className="flex items-start justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2D1B12]">{deed.title}</p>
                      <p className="mt-0.5 text-xs text-[#6C4D3B]">
                        <span>{deed.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-num">{deed.timeLabel}</span>
                      </p>
                      {deed.note && (
                        <p className="mt-1 text-xs italic text-[#4E3222]">{deed.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingDeed(deed)}
                        aria-label={`Edit ${deed.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4E3222] hover:bg-[#2D1B12]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDeed(deed.id)}
                        aria-label={`Delete ${deed.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#4E3222]/10 hover:text-[#2D1B12]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Bad Deeds / Slip-ups to Improve Column */}
        <div className="sticker-cream relative rounded-[24px] p-4 sm:rounded-[26px] sm:p-7">
          <div
            className="washi-tape pointer-events-none absolute -top-3 right-6 h-6 w-20 rotate-2 rounded-sm sm:right-8 sm:w-24"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-3 border-b border-[#2D1B12]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <StarStickerIcon className="h-9 w-9" roundedClass="rounded-xl" />
              <div>
                <h3 className="font-display text-xl font-semibold text-[#2D1B12]">
                  Slip-ups &amp; Things to Improve
                </h3>
                <p className="text-xs text-[#6C4D3B]">
                  Honest reflection so tomorrow is even better
                </p>
              </div>
            </div>
            <span className="font-mono-num shrink-0 text-sm font-semibold text-[#4E3222]">
              {badDeeds.length}
            </span>
          </div>

          {/* Quick-tap Bad Deed presets with + log and - remove options */}
          {(() => {
            const visibleBadPresets = BAD_DEED_PRESETS.filter(
              (p) => !hiddenBadTitles.includes(p.title)
            );
            return (
              <div className="mt-4">
                {visibleBadPresets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {visibleBadPresets.map((preset) => (
                      <div
                        key={preset.title}
                        className="inline-flex min-h-[44px] items-stretch overflow-hidden rounded-xl border border-[#2D1B12]/15 bg-[#E8D1B2]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onAddDeed('bad', preset.title, preset.category, '')
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-[#2D1B12] hover:bg-[#DFC3A1]/70 transition-colors"
                        >
                          <Plus
                            className="h-3.5 w-3.5 shrink-0 text-[#4E3222]"
                            aria-hidden="true"
                          />
                          <span>{preset.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onHidePreset('bad', preset.title)}
                          aria-label={`Remove option ${preset.title}`}
                          title={`Remove "${preset.title}" option`}
                          className="inline-flex min-w-[38px] items-center justify-center border-l border-[#2D1B12]/12 px-2 text-[#6C4D3B] hover:bg-[#E8D1B2]/70 hover:text-[#2D1B12] transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {hiddenBadTitles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onRestorePresets('bad')}
                    className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-[#6C4D3B] underline underline-offset-4 hover:text-[#2D1B12]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Restore {hiddenBadTitles.length} removed quick{' '}
                    {hiddenBadTitles.length === 1 ? 'option' : 'options'}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Custom Bad Deed Form */}
          <form onSubmit={handleCustomBad} className="mt-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="custom-bad-deed" className="sr-only">
                Custom slip-up to improve
              </label>
              <input
                id="custom-bad-deed"
                type="text"
                value={badInput}
                onChange={(e) => setBadInput(e.target.value)}
                placeholder="Note a mistake or wasted time..."
                maxLength={140}
                className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3.5 text-sm text-[#2D1B12] placeholder:text-[#6C4D3B]/60 focus:border-[#4E3222] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#4E3222] px-4 text-sm font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0 sm:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Log to Fix
              </button>
            </div>
            <input
              type="text"
              value={badNote}
              onChange={(e) => setBadNote(e.target.value)}
              placeholder="How I’ll make tomorrow better (e.g. put phone away before Isha)"
              maxLength={400}
              aria-label="How to improve tomorrow"
              className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/15 bg-[#E8D1B2]/70 px-3.5 text-xs text-[#2D1B12] placeholder:text-[#6C4D3B]/60 focus:border-[#4E3222] focus:outline-none"
            />
          </form>

          {/* Logged Slip-ups list */}
          {badDeeds.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-[#2D1B12]/15 p-5 text-center text-xs text-[#6C4D3B]">
              Alhamdulillah — no slip-ups logged for this day.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#2D1B12]/10">
              {badDeeds.map((deed) => {
                const isEditing = editingId === deed.id;
                if (isEditing) {
                  return (
                    <li key={deed.id} className="py-3">
                      <div className="space-y-2 rounded-2xl border border-[#2D1B12]/15 bg-[#E8D1B2] p-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={140}
                          aria-label="Edit slip-up title"
                          className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-sm text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                        />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            maxLength={40}
                            placeholder="Category"
                            aria-label="Edit slip-up category"
                            className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                          />
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as DeedType)}
                            aria-label="Edit deed type"
                            className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                          >
                            <option value="bad">Slip-up to Improve</option>
                            <option value="good">Good Deed</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          maxLength={400}
                          placeholder="How I’ll make tomorrow better..."
                          aria-label="Edit improvement note"
                          className="min-h-[44px] w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2] px-3 text-xs text-[#2D1B12] focus:border-[#4E3222] focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-[#2D1B12]/20 px-3.5 text-xs font-medium text-[#6C4D3B] hover:bg-[#E8D1B2]/40"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditingDeed(deed)}
                            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-[#4E3222] px-4 text-xs font-medium text-[#E8D1B2] hover:bg-[#3A2419]"
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
                  <li
                    key={deed.id}
                    className="flex items-start justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2D1B12]">{deed.title}</p>
                      <p className="mt-0.5 text-xs text-[#6C4D3B]">
                        <span>{deed.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-num">{deed.timeLabel}</span>
                      </p>
                      {deed.note && (
                        <p className="mt-1 text-xs italic text-[#4E3222]">
                          Next step: {deed.note}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingDeed(deed)}
                        aria-label={`Edit ${deed.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4E3222] hover:bg-[#2D1B12]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDeed(deed.id)}
                        aria-label={`Delete ${deed.title}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#4E3222]/10 hover:text-[#2D1B12]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Evening Reflection Note Card */}
      <form
        onSubmit={handleSaveNote}
        className="sticker-kraft notepad-lines rounded-[24px] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#2D1B12]">
              Daily Reflection Note
            </h3>
            <p className="text-xs text-[#6C4D3B]">
              Write a sincere dua, gratitude, or intention for tomorrow — saved forever.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#4E3222] px-4 text-xs font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0 sm:w-auto"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {noteSavedFeedback ? 'Saved' : 'Save Note'}
          </button>
        </div>

        <label htmlFor="daily-reflection-note" className="sr-only">
          Daily reflection note
        </label>
        <textarea
          id="daily-reflection-note"
          rows={3}
          maxLength={1000}
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Alhamdulillah for today... Tomorrow I want to wake up on time for Fajr and protect my focus."
          className="mt-3 w-full rounded-xl border border-[#2D1B12]/20 bg-[#E8D1B2]/90 p-3.5 text-sm leading-relaxed text-[#2D1B12] placeholder:text-[#6C4D3B]/60 focus:border-[#4E3222] focus:outline-none"
        />
      </form>
    </section>
  );
};
