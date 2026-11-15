import React, { useState } from 'react';
import { Check, Plus, Repeat, RotateCcw, Trash2 } from 'lucide-react';
import { DailyGoal } from '../types';
import { PaperclipIcon } from './Stickers';

interface DailyGoalsPadProps {
  goals: DailyGoal[];
  yesterdayUnfinishedCount: number;
  onAddGoal: (title: string, isRecurring: boolean) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onCarryOverYesterday: () => void;
}

export const DailyGoalsPad: React.FC<DailyGoalsPadProps> = ({
  goals,
  yesterdayUnfinishedCount,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onCarryOverYesterday,
}) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const completedCount = goals.filter((g) => g.completed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goalTitle.trim();
    if (!trimmed) return;
    onAddGoal(trimmed, isRecurring);
    setGoalTitle('');
  };

  return (
    <section
      id="goals"
      aria-labelledby="goals-heading"
      className="sticker-kraft notepad-lines relative flex scroll-mt-20 flex-col justify-between rounded-[24px] p-4 sm:rounded-[26px] sm:p-7"
    >
      {/* Cute paperclip & tape inspired by the Reminder sticker in the uploaded image */}
      <div
        className="washi-tape pointer-events-none absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-1 rounded-sm"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-4 right-5 sm:right-7" aria-hidden="true">
        <PaperclipIcon className="h-9 w-6 sm:h-10 sm:w-7" />
      </div>

      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[#2D1B12]/15 pb-4">
          <div>
            <p className="text-xs font-medium text-[#6C4D3B]">
              Small steps, big changes
            </p>
            <h2
              id="goals-heading"
              className="font-display text-2xl font-semibold tracking-tight text-[#2D1B12]"
            >
              Daily Goals
            </h2>
          </div>
          <span className="font-mono-num text-sm font-medium text-[#4E3222]">
            {completedCount}/{goals.length}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="daily-goal-input" className="sr-only">
              Add a daily goal
            </label>
            <input
              id="daily-goal-input"
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Write a goal for today..."
              maxLength={160}
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#2D1B12]/25 bg-[#E8D1B2] px-3.5 text-sm text-[#2D1B12] placeholder:text-[#6C4D3B]/75 focus:border-[#4E3222] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#4E3222] px-4 text-sm font-medium text-[#E8D1B2] hover:bg-[#3A2419] transition-colors whitespace-nowrap shrink-0 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-xs font-medium text-[#4E3222]">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-[#4E3222] accent-[#4E3222]"
              />
              <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
              Repeat daily forever
            </label>

            {yesterdayUnfinishedCount > 0 && (
              <button
                type="button"
                onClick={onCarryOverYesterday}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-[#4E3222] underline underline-offset-4 hover:text-[#2D1B12]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Carry over {yesterdayUnfinishedCount} from yesterday
              </button>
            )}
          </div>
        </form>

        {goals.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#2D1B12]/25 bg-[#E8D1B2]/65 p-6 text-center">
            <p className="font-display text-base font-medium text-[#2D1B12]">
              No daily goals added yet
            </p>
            <p className="mt-1 text-xs text-[#6C4D3B]">
              Add 2–4 gentle priorities for today so your time stays focused and blessed.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-[#2D1B12]/10">
            {goals.map((goal) => (
              <li key={goal.id} className="py-1.5">
                <div className="flex items-center justify-between gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-[#DFC3A1]/45">
                  <button
                    type="button"
                    onClick={() => onToggleGoal(goal.id)}
                    className="flex min-h-[44px] flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E3222]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        goal.completed
                          ? 'border-[#4E3222] bg-[#4E3222] text-[#E8D1B2]'
                          : 'border-[#4E3222]/55 bg-[#E8D1B2]'
                      }`}
                    >
                      {goal.completed && (
                        <Check className="h-3.5 w-3.5 stroke-[2.8]" aria-hidden="true" />
                      )}
                    </span>
                    <span
                      className={`min-w-0 break-words text-sm ${
                        goal.completed
                          ? 'text-[#6C4D3B] line-through'
                          : 'font-medium text-[#2D1B12]'
                      }`}
                    >
                      {goal.title}
                    </span>
                    {goal.isRecurring && (
                      <span
                        title="Repeats every day"
                        className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#6C4D3B]"
                      >
                        <Repeat className="h-3 w-3" aria-hidden="true" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteGoal(goal.id)}
                    aria-label={`Remove goal ${goal.title}`}
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#6C4D3B] hover:bg-[#4E3222]/10 hover:text-[#2D1B12]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gentle bottom reminder note matching the uploaded image's REMINDER card */}
      <div className="mt-6 border-t border-[#2D1B12]/15 pt-4 text-xs text-[#6C4D3B]">
        <p className="font-medium text-[#4E3222]">
          Gentle reminder: drink water · pray on time · never give up
        </p>
      </div>
    </section>
  );
};
