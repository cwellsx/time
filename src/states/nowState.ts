import type { Config, NewTime, Time, What } from "../model";
import type { EditWhatState } from "./editWhatState";

export type NowState = EditWhatState & {
  readonly last: Time | undefined;
  readonly config: Config;

  saveTime(time: NewTime): void;
  saveWhat(what: What): void;
  cancelLast(): void;
};
