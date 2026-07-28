import { Prisma } from '@prisma/client';
import { RRule } from 'rrule';
import { toZonedTime } from 'date-fns-tz';

export function computeStreak(
  completions: { completedAt: Date }[],
  rruleStr: string | null,
  timezone: string,
): { streak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { streak: 0, longestStreak: 0 };
  }

  const tz = timezone || 'UTC';

  // Normalize completions to YYYY-MM-DD in the target timezone
  const completedDateStrings = new Set<string>();
  for (const c of completions) {
    const z = toZonedTime(c.completedAt, tz);
    completedDateStrings.add(
      `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`,
    );
  }

  const sortedDates = Array.from(completedDateStrings).sort();

  let streak = 0;
  let longestStreak = 0;

  if (rruleStr) {
    try {
      const ruleOptions = RRule.parseString(rruleStr);
      // Start checking from the first completion date
      const firstCompletionZ = toZonedTime(completions[0].completedAt, tz);
      // Set dtstart to the beginning of the first completion day
      ruleOptions.dtstart = new Date(
        Date.UTC(
          firstCompletionZ.getFullYear(),
          firstCompletionZ.getMonth(),
          firstCompletionZ.getDate(),
        ),
      );
      const rule = new RRule(ruleOptions);

      const now = new Date();
      const nowZ = toZonedTime(now, tz);
      const endUtc = new Date(
        Date.UTC(nowZ.getFullYear(), nowZ.getMonth(), nowZ.getDate(), 23, 59, 59),
      );

      const requiredDates = rule.between(ruleOptions.dtstart, endUtc, true);

      const todayStr = `${nowZ.getFullYear()}-${String(nowZ.getMonth() + 1).padStart(2, '0')}-${String(nowZ.getDate()).padStart(2, '0')}`;

      for (const occ of requiredDates) {
        // occ is UTC, we format it directly as it represents the "day"
        const occStr = `${occ.getUTCFullYear()}-${String(occ.getUTCMonth() + 1).padStart(2, '0')}-${String(occ.getUTCDate()).padStart(2, '0')}`;

        if (completedDateStrings.has(occStr)) {
          streak++;
          if (streak > longestStreak) longestStreak = streak;
        } else {
          // If we missed a required date, reset streak, UNLESS it's today and we just haven't completed it yet
          if (occStr !== todayStr) {
            streak = 0;
          }
        }
      }
      return { streak, longestStreak };
    } catch (e) {
      // Fallback
    }
  }

  // Fallback / Daily calculation
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currDate = new Date(y, m - 1, d);

    if (!prevDate) {
      currentStreak = 1;
      longestStreak = 1;
    } else {
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        currentStreak = 1;
      }
    }
    prevDate = currDate;
  }

  // Check if missed yesterday or today
  const tzNow = toZonedTime(new Date(), tz);
  const todayStr = `${tzNow.getFullYear()}-${String(tzNow.getMonth() + 1).padStart(2, '0')}-${String(tzNow.getDate()).padStart(2, '0')}`;
  const yesterdayZ = new Date(tzNow.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterdayZ.getFullYear()}-${String(yesterdayZ.getMonth() + 1).padStart(2, '0')}-${String(yesterdayZ.getDate()).padStart(2, '0')}`;

  const lastCompletedStr = sortedDates[sortedDates.length - 1];

  if (lastCompletedStr !== todayStr && lastCompletedStr !== yesterdayStr) {
    currentStreak = 0;
  }

  return { streak: currentStreak, longestStreak };
}
