export type TermForDates = {
  id: number;
  name: string;
  year: number;
  start: string | null;
  end: string | null;
};

export type CalendarPeriodForDates = {
  year?: number | null;
  kind: string;
  start_date: string;
  end_date: string;
};

export const WEEKDAYS = [
  { name: "月", day: 1 },
  { name: "火", day: 2 },
  { name: "水", day: 3 },
  { name: "木", day: 4 },
  { name: "金", day: 5 },
] as const;

const EXCLUDED_KINDS = new Set(["closed", "no_classes", "makeup_period"]);
const FULL_YEAR_TERM_NAMES = new Set(["第1", "第3", "第4"]);

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function isValidRange(
  range: Pick<TermForDates, "start" | "end">,
): range is { start: string; end: string } {
  return Boolean(range.start && range.end && range.start <= range.end);
}

function getTermRanges(
  term: TermForDates,
  allTerms: TermForDates[],
): Array<{ start: string; end: string }> {
  if (term.name !== "通年") {
    return isValidRange(term) ? [{ start: term.start, end: term.end }] : [];
  }

  // 本学の通年科目は第2タームを除く、第1・第3・第4タームで構成する。
  const componentRanges = allTerms
    .filter(
      (candidate) =>
        Number(candidate.year) === Number(term.year) &&
        FULL_YEAR_TERM_NAMES.has(candidate.name) &&
        isValidRange(candidate),
    )
    .map((candidate) => ({
      start: candidate.start as string,
      end: candidate.end as string,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (componentRanges.length > 0) {
    return componentRanges;
  }

  // 構成タームが未登録の場合だけ、通年レコード自身の範囲を使用する。
  return isValidRange(term) ? [{ start: term.start, end: term.end }] : [];
}

function isExcludedDate(
  dateKey: string,
  year: number,
  calendarPeriods: CalendarPeriodForDates[],
): boolean {
  return calendarPeriods.some(
    (period) =>
      EXCLUDED_KINDS.has(period.kind) &&
      (period.year == null || Number(period.year) === Number(year)) &&
      period.start_date <= dateKey &&
      dateKey <= period.end_date,
  );
}

export function getClassDates(
  term: TermForDates,
  weekday: number,
  allTerms: TermForDates[],
  calendarPeriods: CalendarPeriodForDates[] = [],
): string[] {
  const dates: string[] = [];

  for (const range of getTermRanges(term, allTerms)) {
    let date = parseDateKey(range.start);
    const end = parseDateKey(range.end);

    while (date <= end) {
      const dateKey = toDateKey(date);

      if (
        date.getUTCDay() === weekday &&
        !isExcludedDate(dateKey, term.year, calendarPeriods)
      ) {
        dates.push(dateKey);
      }

      date = addDays(date, 1);
    }
  }

  return [...new Set(dates)].sort();
}

export function formatClassDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${month}/${day}`;
}
