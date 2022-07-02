import type { Period, Config, What, Time } from "../model";
import type { EditWhatState } from "./editWhatState";

export type HistoryState = EditWhatState & {
  readonly periods: Period[];
  readonly config: Config;
  editWhat(when: number, what: What): void;
  getTaskDescription(task: string): string | undefined;
  getTagDescription(tag: string): string | undefined;
  findTime(when: number): Time | undefined;
  editWhen(deleted: number[], inserted: Time[]): void;
};
