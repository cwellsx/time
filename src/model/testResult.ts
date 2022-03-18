import { Period } from "./period";

export type TestResult = {
  readonly title: string;
  readonly msec: number;
  readonly ok: boolean;
};

export type TestResults = {
  readonly results: TestResult[];
  readonly periods: Period[];
};
