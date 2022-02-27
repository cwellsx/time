import * as DB from './database';
import { isTimeStop, Time } from './model';

type Test = {
  title: string;
  run: () => Promise<any>;
};

function assert(b: boolean) {
  if (!b) throw new Error("assertion failed");
}

function createTimes(year: number, nDays: number, nTimesPerDay: number): Time[] {
  assert(nDays <= 360 && nTimesPerDay <= 20 && nTimesPerDay > 1);
  const result: Time[] = [];
  for (let i = 0; i < nDays; ++i) {
    const month = Math.floor(i / 20);
    const day = i % 20;
    for (let j = 0; j < nTimesPerDay; ++j) {
      const when = new Date(year, month, day, j + 1).valueOf();
      if (j === 0) result.push({ type: "start", when: when });
      else if (j === nTimesPerDay - 1) result.push({ type: "stop", when: when, note: "hello", what: [] });
      else result.push({ type: "next", when: when, note: "hello", what: [] });
    }
  }
  assert(result.length === nDays * nTimesPerDay);
  return result;
}

const tests: Test[] = [
  {
    title: "deleteDatabase",
    run: async () => await DB.deleteDatabase("test"),
  },
  {
    title: "fetchDatabase",
    run: async () => await DB.fetchDatabase("test"),
  },
  {
    title: "save two times",
    run: async () => {
      const edit = await DB.editDatabase("test");
      for (let time of createTimes(2020, 1, 2)) {
        const pushed = await edit.addTime(time);
        assert(pushed === time.when);
      }
    },
  },
  {
    title: "assert two times",
    run: async () => {
      const db = await DB.fetchDatabase("test");
      assert(db.times.length === 2);
      createTimes(2020, 1, 2).forEach((time, index) => {
        const found = db.times[index];
        assert(found.when === time.when);
        assert(found.type === time.type);
        if (isTimeStop(found)) {
          if (!isTimeStop(time)) assert(false);
          else assert(found.note === time.note);
        }
      });
    },
  },
  {
    title: "save 4000 times",
    run: async () => {
      const edit = await DB.editDatabase("test");
      if (false) {
        // this takes 20 seconds (5 msec each) because each is in its own transaction
        await Promise.all(createTimes(2021, 200, 20).map(async (time) => await edit.addTime(time)));
      } else {
        // this takes 600 msec, it's implemented using one transaction
        await edit.addTimes(createTimes(2021, 200, 20));
      }
    },
  },
  {
    title: "read 4000 times",
    run: async () => {
      const db = await DB.fetchDatabase("test");
      assert(db.times.length === 4002);
    },
  },
];

export class TestResult {
  constructor(title: string, msec: number, ok: boolean) {
    this.title = title;
    this.msec = msec;
    this.ok = ok;
  }
  readonly title: string;
  readonly msec: number;
  readonly ok: boolean;
}

async function getResult(test: Test): Promise<TestResult> {
  let ok: boolean;
  const startTime = performance.now();
  try {
    await test.run();
    ok = true;
  } catch {
    ok = false;
  }
  const endTime = performance.now();
  const msec = Math.round(endTime - startTime);
  return new TestResult(test.title, msec, ok);
}

export async function getTestResults(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (let test of tests) results.push(await getResult(test));
  return results;
}
