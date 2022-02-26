export function now(): number {
  return Date.now();
}

export enum EventType {
  Start = "start",
  Stop = "stop",
  Next = "next",
  Cancel = "cancel",
}

export class What {
  readonly id: string;
  readonly type: string;

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }
}

export class Event {
  readonly when: number;
  readonly what: What[];
  readonly note: string;

  constructor(when: number, what: What[], note: string) {
    this.when = when;
    this.what = what;
    this.note = note;
  }
}
