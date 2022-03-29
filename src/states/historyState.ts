import type { Period, Config, What } from "../model";

export interface HistoryState {
  readonly periods: Period[];
  readonly config: Config;
  editHistory(when: number, what: What): void;
  getTaskDescription(task: string): string | undefined;
}
