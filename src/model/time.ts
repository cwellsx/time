export type TimeStart = {
  readonly when: number;
  readonly type: "start";
};

export type TimeStop = {
  readonly when: number;
  readonly type: "stop" | "next";
  readonly note?: string;
  readonly tags?: string[];
  readonly task?: string;
};

export type Time = TimeStart | TimeStop;
