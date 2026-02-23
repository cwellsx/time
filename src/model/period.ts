import type { What } from "./what";

export type Period = What & {
  start: number;
  stop: number;
};

export type PeriodEx = Period & {
  startYear: number;
};
