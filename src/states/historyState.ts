import type { Period, Config, What } from "../model";
import type { EditWhatState } from "./editWhatState";

export type HistoryState = EditWhatState & {
  readonly periods: Period[];
  readonly config: Config;
  editHistory(when: number, what: What): void;
  getTaskDescription(task: string): string | undefined;
};
