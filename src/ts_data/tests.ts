import * as DB from './database';
import { Event, EventType } from './model';

type Test = {
  title: string;
  run: () => Promise<any>;
};

function assert(b: boolean) {
  if (!b) throw "assertion failed";
}

function createEvents(year: number, nDays: number, nEventsPerDay: number): Event[] {
  assert(nDays <= 360 && nEventsPerDay <= 20);
  const result: Event[] = [];
  for (let i = 0; i < nDays; ++i) {
    const month = Math.floor(i / 20);
    const day = i % 20;
    for (let j = 0; j < nEventsPerDay; ++j) {
      const eventType: EventType = j == 0 ? EventType.Start : j == nEventsPerDay - 1 ? EventType.Stop : EventType.Next;
      const when = new Date(year, month, day, j + 1);
      const event = new Event(when.valueOf(), [], "hello");
      result.push(event);
    }
  }
  assert(result.length == nDays * nEventsPerDay);
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
    title: "save two events",
    run: async () => {
      const edit = await DB.editDatabase("test");
      for (let event of createEvents(2020, 1, 2)) {
        const pushed = await edit.addEvent(event);
        assert(pushed == event.when);
      }
    },
  },
  {
    title: "assert two events",
    run: async () => {
      const db = await DB.fetchDatabase("test");
      assert(db.events.length == 2);
      createEvents(2020, 1, 2).forEach((event, index) => {
        const found = db.events[index];
        assert(found.when == event.when);
        assert(found.note == event.note);
      });
    },
  },
  {
    title: "save 4000 events",
    run: async () => {
      const edit = await DB.editDatabase("test");
      if (false) {
        // this takes 20 seconds (5 msec each) because each is in its own transaction
        await Promise.all(createEvents(2021, 200, 20).map(async (event) => await edit.addEvent(event)));
      } else {
        // this takes 600 msec, it's implemented using one transaction
        await edit.addEvents(createEvents(2021, 200, 20));
      }
    },
  },
  {
    title: "read 4000 events",
    run: async () => {
      const db = await DB.fetchDatabase("test");
      assert(db.events.length == 4002);
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
