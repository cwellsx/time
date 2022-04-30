import { EditWhenState, getTestEditWhen } from '../io';
import { Period, Time } from '../model';
import { FindTime, helpEditWhen } from './helpEditWhen';

type TTime = [number, "start" | "stop" | "next"];
type TTime3 = [number, "start" | "stop" | "next", string];
type Expected = TTime | TTime3;

type TestCase = {
  inputs: TTime[];
  period: number;
  altered: [number, number];
  expected: Expected[];
};

const testCases: TestCase[] = [
  {
    // separate
    inputs: [
      [10, "start"],
      [20, "stop"],
      [30, "start"],
      [40, "stop"],
      [50, "start"],
      [60, "stop"],
    ],
    period: 30,
    // still separate
    altered: [25, 45],
    expected: [
      [10, "start"],
      [20, "stop"],
      [25, "start"],
      [45, "stop", "40"],
      [50, "start"],
      [60, "stop"],
    ],
  },
  {
    // separate
    inputs: [
      [10, "start"],
      [20, "stop"],
      [30, "start"],
      [40, "stop"],
      [50, "start"],
      [60, "stop"],
    ],
    period: 30,
    // merged
    altered: [15, 55],
    expected: [
      [10, "start"],
      [15, "next", "20"],
      [55, "next", "40"],
      [60, "stop"],
    ],
  },
  {
    // separate
    inputs: [
      [10, "start"],
      [20, "stop"],
      [30, "start"],
      [40, "stop"],
      [50, "start"],
      [60, "stop"],
    ],
    period: 30,
    // merged (equals)
    altered: [20, 50],
    expected: [
      [10, "start"],
      [20, "next", "20"],
      [50, "next", "40"],
      [60, "stop"],
    ],
  },

  {
    // merged
    inputs: [
      [10, "start"],
      [20, "next"],
      [40, "next"],
      [60, "stop"],
    ],
    period: 20,
    // still merged
    altered: [15, 55],
    expected: [
      [10, "start"],
      [15, "next", "20"],
      [55, "next", "40"],
      [60, "stop"],
    ],
  },
  {
    // merged
    inputs: [
      [10, "start"],
      [20, "next"],
      [40, "next"],
      [60, "stop"],
    ],
    period: 20,
    // split
    altered: [25, 35],
    expected: [
      [10, "start"],
      [20, "stop"],
      [25, "start"],
      [35, "stop", "40"],
      [40, "start"],
      [60, "stop"],
    ],
  },

  {
    // solo
    inputs: [
      [30, "start"],
      [40, "stop"],
    ],
    period: 30,
    // solo
    altered: [25, 35],
    expected: [
      [25, "start"],
      [35, "stop", "40"],
    ],
  },
];

export async function testEditWhen(): Promise<boolean> {
  const db = await getTestEditWhen();
  for (const testCase of testCases) {
    try {
      await testOne(db, testCase);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  return true;
}

async function testOne(db: EditWhenState, testCase: TestCase): Promise<void> {
  await db.clear();
  const times = getTimes(testCase.inputs);
  await db.addTimes(times);
  const periods = await db.getPeriods();
  const period = periods.find((it) => it.start === testCase.period * 60000);
  if (!period) throw Error("Input period not found");
  const altered: Period = { start: testCase.altered[0] * 60000, stop: testCase.altered[1] * 60000 };
  const findTime: FindTime = (it: number) => times.find((time) => time.when === it);
  const { getDifferences } = helpEditWhen(period, altered, periods, findTime);
  const { deleted, inserted } = getDifferences();
  console.log(`editing ${JSON.stringify(deleted)} ${JSON.stringify(inserted)}`);
  for (const it of deleted) if (!findTime(it)) throw Error(`deleted not found ${it}`);
  db.editWhen(deleted, inserted);
  const result = await db.getTimes();
  assertTimes(getTimes(testCase.expected), result);
}

function getTimes(from: Expected[]): Time[] {
  return from.map((it) => {
    const when = it[0] * 60000;
    const type = it[1];
    const note = it.length === 3 ? it[2] : "" + it[0];
    return type === "start" ? { when, type } : { when, type, note };
  });
}

function assertTimes(expected: Time[], actual: Time[]): void {
  if (expected.length !== actual.length) throw Error(`assertTimes expected=${expected.length} actual=${actual.length}`);
  for (let i = 0; i < actual.length; ++i) {
    assertTime(expected[i], actual[i]);
  }
}

function assertTime(expected: Time, actual: Time): void {
  function getNote(time: Time): string | undefined {
    return time.type === "start" ? undefined : time.note;
  }
  if (expected.when !== actual.when || expected.type !== actual.type || getNote(expected) !== getNote(actual))
    throw Error(`assertTime expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}
