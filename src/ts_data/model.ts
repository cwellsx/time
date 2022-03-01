export interface What {
  readonly id: string;
  readonly type: string;
}

export interface TimeStart {
  readonly when: number;
  readonly type: "start";
}

export interface TimeStop {
  readonly when: number;
  readonly type: "stop" | "next";
  readonly what: What[];
  readonly note: string;
}

export function isTimeStop(time: Time): time is TimeStop {
  return time.type !== "start";
}

export type Time = TimeStart | TimeStop;

export type Config = {
  note?: string;
};

export const configVersion = 1;
