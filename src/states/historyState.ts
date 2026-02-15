import type { Config, Period, Time, What } from "../model";
import type { EditWhatState } from "./editWhatState";

export type HistoryState = EditWhatState & {
  readonly periods: Period[];
  readonly config: Config;
  editWhat(when: number, what: What): Promise<void>;
  getTaskDescription(task: string): string | undefined;
  getTagDescription(tag: string): string | undefined;
  findTime(when: number): Time | undefined;
  editWhen(deleted: number[], inserted: Time[]): Promise<void>;
};
