import date from 'date-and-time';

// see https://github.com/knowledgecode/date-and-time

const shortFormat = date.compile("HH:mm");
const longFormat = date.compile("HH:mm ddd, MMM DD");

export function showWhen(when: number): string {
  const it = new Date(when);
  const now = new Date();
  const today =
    it.getFullYear() === now.getFullYear() && it.getMonth() === now.getMonth() && it.getDate() === now.getDate();
  return date.format(it, today ? shortFormat : longFormat);
}

const dayFormat = date.compile("dd DD MMM");

export function showDay(it: Date): string {
  return date.format(it, dayFormat);
}

export function showTime(it: Date): string {
  return date.format(it, shortFormat);
}

const isoDayFormat = date.compile("YYYY-MM-DD");

export function showIsoDay(it: Date): string {
  return date.format(it, isoDayFormat);
}

export function debugDateTime(when: Date | number | undefined): string {
  if (when === undefined) return "undefined";
  const result = new Date(when);
  return date.format(result, isoDayFormat) + "T" + showTime(result);
}

export function roundDate(when: number | Date, incrementMinutes: number): Date {
  const result = new Date(when);
  if (!result.getMilliseconds() && !result.getSeconds()) return result;
  result.setMilliseconds(0);
  result.setSeconds(0);
  return date.addMinutes(result, incrementMinutes);
}

const isoTimeFormat = date.compile("YYYY-MM-DD HH:mm");

export function makeDate(it: Date, shortTime: string, addDay: boolean): Date {
  const dateString = `${showIsoDay(it)} ${shortTime}`;
  const result: Date = date.parse(dateString, isoTimeFormat);
  return !addDay ? result : date.addDays(result, 1);
}
