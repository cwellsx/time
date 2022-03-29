import { showDay, showTime } from './date';
import { IsoWeek, nextWeek, Weeks } from './weeks';

import type { Period, What } from "../model";

export interface IShow {
  getKey(): string;
  getId(): string;
  getWhat(): What | undefined;
  getMinutes(): number;
  getClass(): string;
  getStop(): number | undefined;
}

class Span implements IShow {
  private readonly period: Period;
  readonly start: Date;
  private readonly stop: Date;
  constructor(period: Period) {
    this.period = period;
    this.start = new Date(period.start);
    this.stop = new Date(period.stop);
  }
  getKey(): string {
    return `${this.start.getTime()}`;
  }
  getId(): string {
    return `${showTime(this.start)}–${showTime(this.stop)}`;
  }
  getWhat(): What | undefined {
    return this.period;
  }
  getMinutes(): number {
    return (this.period.stop - this.period.start) / 60000;
  }
  getClass(): string {
    return "span";
  }
  getStop(): number | undefined {
    return this.period.stop;
  }
}

class Day implements IShow {
  readonly spans: Span[];
  readonly date: Date;
  constructor(span: Span) {
    this.spans = [span];
    this.date = span.start;
  }
  next(span: Span): boolean {
    if (!isSameDay(span.start, this.date)) return false;
    this.spans.push(span);
    return true;
  }
  getKey(): string {
    return `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`;
  }
  getId(): string {
    return showDay(this.date);
  }
  getWhat(): What | undefined {
    return undefined;
  }
  getMinutes(): number {
    return this.spans.reduce((x, y) => x + y.getMinutes(), 0);
  }
  getClass(): string {
    return "day";
  }
  getStop(): number | undefined {
    return undefined;
  }
}

class Week implements IShow {
  readonly weekId: IsoWeek;
  readonly days: Day[];
  constructor(day: Day | undefined, weekId: IsoWeek) {
    this.weekId = weekId;
    this.days = day ? [day] : [];
  }
  getKey(): string {
    return `${this.weekId.year}-w${this.weekId.week}`;
  }
  next(day: Day, weekId: IsoWeek): boolean {
    if (!isSameWeek(weekId, this.weekId)) return false;
    this.days.push(day);
    return true;
  }
  getId(): string {
    return `Week ${this.weekId.week}`;
  }
  getWhat(): What | undefined {
    return undefined;
  }
  getMinutes(): number {
    return this.days.reduce((x, y) => x + y.getMinutes(), 0);
  }
  getClass(): string {
    return "week";
  }
  getStop(): number | undefined {
    return undefined;
  }
}

function isSameDay(x: Date, y: Date): boolean {
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

function isSameWeek(x: IsoWeek, y: IsoWeek): boolean {
  return x.week === y.week && x.year === y.year;
}

export function aggregate(periods: Period[]): IShow[] {
  const result: Week[] = [];
  const weeks = new Weeks();
  let day: Day | undefined;
  let week: Week | undefined;

  function newDay(span: Span): void {
    day = new Day(span);
    const weekId = weeks.getWeekId(day.date);
    if (week?.next(day, weekId)) return;
    // new week
    if (week) {
      // fill any skipped weeks
      for (let i = nextWeek(week.weekId); !isSameWeek(i, weekId); i = nextWeek(i)) result.push(new Week(undefined, i));
    }
    week = new Week(day, weekId);
    result.push(week);
  }

  for (const period of periods) {
    const span = new Span(period);
    if (!day || !day.next(span)) newDay(span);
  }

  return flatten(result);
}

function flatten(weeks: Week[]): IShow[] {
  const result: IShow[] = [];
  for (const week of weeks.reverse()) {
    result.push(week);
    for (const day of week.days) {
      result.push(day);
      for (const span of day.spans) {
        result.push(span);
      }
    }
  }
  return result;
}
