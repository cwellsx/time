import type { Config, TagCount, Time, What } from "../model";

export interface NowState {
  readonly last: Time | undefined;
  readonly config: Config;

  saveTime(time: Time): void;
  saveWhat(what: What): void;
  cancelLast(): void;

  getAllTags(): TagCount[];
  getAllTasks(): TagCount[];
}
