import { showTime } from './helpDate';

import type { Period, Time } from "../model";

export type FindTime = (when: number) => Time | undefined;

export function helpEditWhen(period: Period, altered: Period, periods: Period[], findTime: FindTime) {
  const getDifferences = (): { deleted: number[]; inserted: Time[] } => {
    const deleted: number[] = [];
    const inserted: Time[] = [];

    function changeTime(newTime: Time, oldWhen: number) {
      deleted.push(oldWhen);
      inserted.push(newTime);
    }
    function assert(b: boolean, message: string): void {
      if (!b) throw message;
    }

    assert(altered.start < altered.stop, "assert on altered.start < altered.stop");
    assert(new Date(altered.start).getFullYear() > 1980, "assert on altered later than 1980");

    if (!startEqual) {
      const when = altered.start;
      const oldTime = findTime(period.start);
      if (!oldTime) throw Error("Unexpected start time not found");

      if (previous) {
        const previousTime = findTime(previous.stop);
        if (!previousTime || previousTime.type === "start") throw Error("Unexpected previous period");

        if (previous.stop >= when) {
          // they're now at the same time and may need to be merged -- i.e. event type: "next"
          if (previousTime.type === "stop") {
            assert(oldTime.type === "start" && previousTime.when < oldTime.when, "assert on previousTime===stop");
            // merge
            changeTime({ ...previousTime, type: "next", when }, previousTime.when);
            deleted.push(oldTime.when);
          } else {
            assert(previousTime.type === "next" && oldTime === previousTime, "assert on previousTime===next");
            // no merge
            changeTime({ ...oldTime, when }, oldTime.when);
          }
        } else {
          // they're now at different times and may need to be split -- i.e. event types: "stop" and "start"
          if (previousTime.type === "stop") {
            assert(oldTime.type === "start" && previousTime.when < oldTime.when, "assert on previousTime===stop");
            // no split
            changeTime({ ...oldTime, when }, oldTime.when);
          } else {
            assert(previousTime.type === "next" && oldTime === previousTime, "assert on previousTime===next");
            // split
            changeTime({ ...previousTime, type: "stop" }, previousTime.when);
            inserted.push({ type: "start", when });
          }
        }
      } else {
        assert(oldTime.type === "start", "assert on !previous");
        changeTime({ ...oldTime, when }, oldTime.when);
      }
    }

    if (!stopEqual) {
      const when = altered.stop;
      const oldTime = findTime(period.stop);
      if (!oldTime) throw Error("Unexpected stop time not found");

      if (next) {
        const nextTime = findTime(next.start);
        if (!nextTime || nextTime.type === "stop") throw Error("Unexpected next period");

        if (next.start <= when) {
          // they're now at the same time and may need to be merged -- i.e. event type: "next"
          if (nextTime.type === "start") {
            assert(oldTime.type === "stop" && oldTime.when < nextTime.when, "assert on nextTime===start");
            // merge
            changeTime({ ...oldTime, type: "next", when }, oldTime.when);
            deleted.push(nextTime.when);
          } else {
            assert(nextTime.type === "next" && oldTime === nextTime, "assert on nextTime===next");
            // no merge
            changeTime({ ...oldTime, when }, oldTime.when);
          }
        } else {
          // they're now at different times and may need to be split -- i.e. event types: "stop" and "start"
          if (nextTime.type === "start") {
            assert(oldTime.type === "stop" && oldTime.when < nextTime.when, "assert on nextTime===start");
            // no split
            changeTime({ ...oldTime, when }, oldTime.when);
          } else {
            assert(nextTime.type === "next" && oldTime === nextTime, "assert on previousTime===next");
            // split
            changeTime({ ...oldTime, type: "stop", when }, oldTime.when);
            inserted.push({ type: "start", when: nextTime.when });
          }
        }
      } else {
        assert(oldTime.type === "stop", "assert on !next");
        changeTime({ ...oldTime, when }, oldTime.when);
      }
    }

    return { deleted, inserted };
  };

  const equals = (x: number, y: number): boolean => showTime(new Date(x)) === showTime(new Date(y));
  const startEqual = equals(period.start, altered.start);
  const stopEqual = equals(period.stop, altered.stop);
  const index = periods.findIndex((it) => it.start === period.start);
  const previous = !index ? undefined : periods[index - 1];
  const next = index === periods.length - 1 ? undefined : periods[index + 1];
  const significant = 24 * 62 * 60 * 1000;
  const min = previous && period.start - previous.start < significant ? previous.start : undefined;
  const max = next && next.stop - period.stop < significant ? next.stop : undefined;
  const isModified = !(startEqual && stopEqual);

  return { min, max, isModified, getDifferences };
}
