import * as DB from './database';
import { persisted } from './persist';

import type { Time, TimeStop, TestResult, Period, TestResults, TagInfo } from "../model";

type Test = {
  title: string;
  run: () => Promise<any>;
};

function assert(b: boolean) {
  if (!b) throw new Error("assertion failed");
}

function isTimeStop(time: Time): time is TimeStop {
  return time.type !== "start";
}

function createTimes(year: number, nDays: number, nTimesPerDay: number): Time[] {
  assert(nDays <= 360 && nTimesPerDay <= 20 && nTimesPerDay > 1);
  const result: Time[] = [];
  for (let i = 0; i < nDays; ++i) {
    const month = Math.floor(i / 20);
    const day = i % 20;
    for (let j = 0; j < nTimesPerDay; ++j) {
      const when = new Date(year, month, day, Math.floor((j + 1) / 2), (j + 1) % 2 ? 30 : 0).valueOf();
      const note = j % 2 ? "hello" : undefined;
      const task = Math.floor(j / 2) % 2 ? "task-142" : undefined;
      const tags = Math.floor(j / 4) % 2 ? ["coding"] : undefined;
      if (j === 0) result.push({ type: "start", when: when });
      else if (j === nTimesPerDay - 1) result.push({ type: "stop", when, note, task, tags });
      else result.push({ type: "next", when, note, task, tags });
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
    title: "create tags",
    run: async () => {
      const tags: TagInfo[] = [
        { key: "coding", summary: "the art of programming" },
        { key: "social", summary: "social media" },
        { key: "bicycling" },
      ];
      const tasks: TagInfo[] = [
        { key: "task-142", summary: "This is a sample task with a fairly long description but not very long" },
        {
          key: "task-143",
          summary:
            "This is a sample task with a really long description, almost ridiculously long, certainly longer than I'd ever really expect to see used in practice",
        },
      ];
      const edit = await DB.editDatabase("test");
      for (const tag of tags) {
        await edit.addWhat("tags", tag);
      }
      for (const task of tasks) {
        await edit.addWhat("tasks", task);
      }
    },
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
  {
    title: "persisted 100 times",
    run: async () => {
      for (let i = 0; i < 100; ++i) {
        await persisted();
      }
    },
  },
];

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
  return { title: test.title, msec, ok };
}

export async function getTestResults(): Promise<TestResults> {
  const results: TestResult[] = [];
  for (let test of tests) results.push(await getResult(test));
  const db = await DB.fetchDatabase("test");
  const periods: Period[] = DB.getPeriods(db.times);
  return { results, periods };
}
