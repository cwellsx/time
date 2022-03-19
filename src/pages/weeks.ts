// see https://en.wikipedia.org/wiki/ISO_8601#Week_dates and https://en.wikipedia.org/wiki/ISO_week_date#Weeks_per_year
// see also http://archives.miloush.net/michkap/archive/2005/11/14/492249.html

export type IsoWeek = { year: number; week: number };
type WeeksOfMonth = IsoWeek[];
type WeeksOfYear = WeeksOfMonth[];

export class Weeks {
  readonly weeks = new Map<number, WeeksOfYear>();

  getWeekId(date: Date): IsoWeek {
    const year = date.getFullYear();
    const weeksOfYear = this.weeks.get(year) ?? this.getWeeksOfYear(year);
    const weeksOfMonth = weeksOfYear[date.getMonth()];
    return weeksOfMonth[date.getDate() - 1];
  }

  private getWeeksOfYear(year: number): WeeksOfYear {
    const result: WeeksOfYear = [];
    let [week, day] = this.getStart(year);
    for (let month = 0; month < 12; ++month) {
      const daysInMonth = getDaysInMonth(year, month);
      const weeksOfMonth: WeeksOfMonth = [];
      for (let date = 0; date < daysInMonth; ++date) {
        weeksOfMonth.push(week);
        day = ++day % 7;
        if (isFirstDayOfWeek(day)) {
          week =
            week.year !== year
              ? { week: 1, year }
              : month === 11 && date >= 29
              ? { week: 1, year: year + 1 }
              : { week: week.week + 1, year };
        }
      }
      result.push(weeksOfMonth);
    }

    this.weeks.set(year, result);
    return result;
  }

  private getStart(year: number): [week: IsoWeek, day: number] {
    const jan1 = new Date(year, 0, 1);
    const day = jan1.getDay();
    const week = !isFridaySaturdayOrSunday(day) ? 1 : isLongYear(year - 1) ? 53 : 52;
    if (!isFirstDayOfWeek(day)) {
      const last = this.getLast(year - 1);
      if (last) return [last, day];
    }
    const first = { year: week === 1 ? year : year - 1, week };
    return [first, day];
  }

  private getLast(year: number): IsoWeek | undefined {
    const weeksOfYear = this.weeks.get(year);
    if (!weeksOfYear) return undefined;
    return weeksOfYear[11][30];
  }
}

export function nextWeek(x: IsoWeek): IsoWeek {
  const week = x.week + 1;
  return week > (isLongYear(x.year) ? 53 : 52) ? { week: 1, year: x.year + 1 } : { week, year: x.year };
}

const daysPerMonth = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 0..6 is Sunday..Saturday
const enum Day {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

function getDaysInMonth(year: number, month: number) {
  const days = daysPerMonth[month];
  return days ? days : isLeapYear(year) ? 29 : 28;
}

function isLeapYear(year: number): boolean {
  return year % 4 ? false : year % 100 ? true : year % 400 ? false : true;
}

function isLongYear(year: number): boolean {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay();
  // any year starting on Thursday and any leap year starting on Wednesday
  return day === Day.Thursday || (day === Day.Wednesday && isLeapYear(year));
}

function isFirstDayOfWeek(day: number): boolean {
  return day === Day.Monday;
}
function isFridaySaturdayOrSunday(day: number): boolean {
  switch (day) {
    case Day.Friday:
    case Day.Saturday:
    case Day.Sunday:
      return true;
    default:
      return false;
  }
}
