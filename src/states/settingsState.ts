import type { Config, RequiredType } from "../model";

export type SetRequiredType = (value: RequiredType) => void;

export interface SettingsState {
  readonly config: Config;
  readonly persisted: boolean;
  persist(): void;
  getDatabaseAsJson(): string;
  setTagsRequired: SetRequiredType;
  setTaskRequired: SetRequiredType;
  setHistoryEditable(value: boolean): void;
}
