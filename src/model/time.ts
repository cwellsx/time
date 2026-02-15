import type { What } from "./what";

export type TimeStart = {
  readonly when: number;
  readonly type: "start";
};

export type TimeStop = What & {
  readonly when: number;
  readonly type: "stop" | "next";
};

export type Time = TimeStart | TimeStop;

export type NewTime = Time & {
  readonly last: number | null;
};
