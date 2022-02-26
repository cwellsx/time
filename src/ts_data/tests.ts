import * as DB from './database';

type Test = {
  title: string;
  run: () => Promise<void>;
};

const tests: Test[] = [
  {
    title: "fetchDatabase",
    run: async () => {
      const db = await DB.fetchDatabase();
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
  return await Promise.all(tests.map(getResult));
}
