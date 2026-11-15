import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { formatFriendlyDate, getLastNDaysKeys, getTodayKey } from '../data/defaults';
import { DailyGoal, DailyLog, DeedEntry, RoutineItem } from '../types';

interface HistoryOverviewProps {
  selectedDateKey: string;
  routineItems: RoutineItem[];
  dailyLogs: Record<string, DailyLog>;
  allGoals: DailyGoal[];
  allDeeds: DeedEntry[];
  onSelectDate: (dateKey: string) => void;
}

export const HistoryOverview: React.FC<HistoryOverviewProps> = ({
  selectedDateKey,
  routineItems,
  dailyLogs,
  allGoals,
  allDeeds,
  onSelectDate,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const todayKey = getTodayKey();
  const recentSeven = getLastNDaysKeys(todayKey, 7).reverse();

  // Also include any older dates that have saved logs/goals/deeds so nothing is ever lost
  const knownDates = new Set<string>(recentSeven);
  Object.keys(dailyLogs).forEach((k) => knownDates.add(k));
  allGoals.forEach((g) => knownDates.add(g.dateKey));
  allDeeds.forEach((d) => knownDates.add(d.dateKey));

  const sortedDates = Array.from(knownDates)
    .filter((d) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d))
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 14);

  const totalRoutineCount = routineItems.filter((r) => r.isActive).length;

  return (
    <section
      id="history"
      aria-labelledby="history-heading"
      className="sticker-cream scroll-mt-20 rounded-[24px] p-4 sm:rounded-[26px] sm:p-7"
    >
      <div
        className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
          showDetails ? 'border-b border-[#2D1B12]/10 pb-4' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8D1B2] text-[#4E3222]">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="history-heading"
              className="font-display text-2xl font-semibold text-[#2D1B12]"
            >
              Forever Journal History
            </h2>
            <p className="text-xs text-[#6C4D3B]">
              Select any past day to review what you accomplished and how your deeds grew
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-expanded={showDetails}
          aria-controls="history-details-panel"
          className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 sm:w-auto ${
            showDetails
              ? 'bg-[#4E3222] text-[#E8D1B2] hover:bg-[#3A2419]'
              : 'border border-[#2D1B12]/20 bg-[#E8D1B2] text-[#2D1B12] hover:bg-[#DFC3A1]'
          }`}
        >
          <span>{showDetails ? 'Hide Details' : 'Details'}</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showDetails && (
        <div id="history-details-panel">
      {/* Mobile Touch-Friendly Card List */}
      <ul className="mt-4 divide-y divide-[#2D1B12]/10 md:hidden">
        {sortedDates.map((dateKey) => {
          const log = dailyLogs[dateKey];
          const routineDone = log ? log.completedRoutineIds.length : 0;
          const dayGoals = allGoals.filter((g) => g.dateKey === dateKey);
          const goalsDone = dayGoals.filter((g) => g.completed).length;
          const dayDeeds = allDeeds.filter((d) => d.dateKey === dateKey);
          const goodCount = dayDeeds.filter((d) => d.type === 'good').length;
          const badCount = dayDeeds.filter((d) => d.type === 'bad').length;
          const isSelected = dateKey === selectedDateKey;

          return (
            <li
              key={dateKey}
              className={`py-3 ${isSelected ? 'rounded-2xl bg-[#E8D1B2]/45 px-3 -mx-1' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2D1B12]">
                    {formatFriendlyDate(dateKey)}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6C4D3B]">
                    <span>
                      Routine{' '}
                      <strong className="font-mono-num text-[#4E3222]">
                        {routineDone}/{totalRoutineCount}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Goals{' '}
                      <strong className="font-mono-num text-[#4E3222]">
                        {dayGoals.length > 0 ? `${goalsDone}/${dayGoals.length}` : '—'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Good{' '}
                      <strong className="font-mono-num text-[#4E3222]">{goodCount}</strong>
                    </span>
                    {badCount > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          Fix <strong className="font-mono-num text-[#4E3222]">{badCount}</strong>
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectDate(dateKey);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#4E3222] text-[#E8D1B2]'
                      : 'border border-[#2D1B12]/20 bg-[#E8D1B2] text-[#2D1B12] hover:bg-[#DFC3A1]'
                  }`}
                >
                  {isSelected ? 'Viewing' : 'Open'}
                  {!isSelected && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop Data Table */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#2D1B12]/10 text-xs font-medium text-[#6C4D3B]">
              <th className="py-2.5 pr-4">Date</th>
              <th className="py-2.5 px-3">Routine</th>
              <th className="py-2.5 px-3">Daily Goals</th>
              <th className="py-2.5 px-3">Good Deeds</th>
              <th className="py-2.5 px-3">To Improve</th>
              <th className="py-2.5 pl-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D1B12]/10">
            {sortedDates.map((dateKey) => {
              const log = dailyLogs[dateKey];
              const routineDone = log ? log.completedRoutineIds.length : 0;
              const dayGoals = allGoals.filter((g) => g.dateKey === dateKey);
              const goalsDone = dayGoals.filter((g) => g.completed).length;
              const dayDeeds = allDeeds.filter((d) => d.dateKey === dateKey);
              const goodCount = dayDeeds.filter((d) => d.type === 'good').length;
              const badCount = dayDeeds.filter((d) => d.type === 'bad').length;
              const isSelected = dateKey === selectedDateKey;

              return (
                <tr
                  key={dateKey}
                  className={`transition-colors ${
                    isSelected ? 'bg-[#E8D1B2]/55' : 'hover:bg-[#E8D1B2]/25'
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-[#2D1B12]">
                    {formatFriendlyDate(dateKey)}
                  </td>
                  <td className="font-mono-num py-3 px-3 text-[#4E3222]">
                    {routineDone}/{totalRoutineCount}
                  </td>
                  <td className="font-mono-num py-3 px-3 text-[#4E3222]">
                    {dayGoals.length > 0 ? `${goalsDone}/${dayGoals.length}` : '—'}
                  </td>
                  <td className="font-mono-num py-3 px-3 font-semibold text-[#4E3222]">
                    {goodCount}
                  </td>
                  <td className="font-mono-num py-3 px-3 text-[#4E3222]">{badCount}</td>
                  <td className="py-2 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDate(dateKey);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`inline-flex min-h-[40px] items-center gap-1 rounded-xl px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#4E3222] text-[#E8D1B2]'
                          : 'border border-[#2D1B12]/20 bg-[#E8D1B2] text-[#2D1B12] hover:bg-[#DFC3A1]'
                      }`}
                    >
                      {isSelected ? 'Viewing' : 'View Day'}
                      {!isSelected && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </div>
      )}
    </section>
  );
};
