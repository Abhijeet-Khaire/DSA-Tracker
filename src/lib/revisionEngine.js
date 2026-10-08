import { addDays, format, isBefore, isToday, parseISO, startOfDay } from 'date-fns';

export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export function getNextRevisionDate(solvedDate, revisionCount = 0) {
  const baseDate = solvedDate ? new Date(solvedDate) : new Date();
  const intervalDays = REVISION_INTERVALS_DAYS[Math.min(revisionCount, REVISION_INTERVALS_DAYS.length - 1)];
  const nextDate = addDays(baseDate, intervalDays);
  return format(nextDate, 'yyyy-MM-dd');
}

export function getRevisionStatus(nextRevisionDateStr) {
  if (!nextRevisionDateStr) return { status: 'none', label: 'No Revision Set', color: 'text-slate-400' };

  const today = startOfDay(new Date());
  const revDate = startOfDay(parseISO(nextRevisionDateStr));

  if (isBefore(revDate, today)) {
    return { status: 'overdue', label: 'Overdue', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  } else if (isToday(revDate)) {
    return { status: 'today', label: 'Due Today', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold animate-pulse' };
  } else {
    return { status: 'upcoming', label: `Due ${nextRevisionDateStr}`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  }
}
