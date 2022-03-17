import date from "date-and-time";

const shortFormat = date.compile("HH:mm");
const longFormat = date.compile("HH:mm ddd, MMM DD");

export function showWhen(when: number): string {
  const it = new Date(when);
  const now = new Date();
  const today =
    it.getFullYear() === now.getFullYear() && it.getMonth() === now.getMonth() && it.getDate() === now.getDate();
  return date.format(it, today ? shortFormat : longFormat);
}
