import type { Config, RequiredType } from "../model";

export type SetRequiredType = (value: RequiredType) => Promise<void>;

export interface SettingsState {
  readonly config: Config;
  readonly persisted: boolean;
  persist(): Promise<void>;
  getDatabaseAsJson(): string;
  setTagsRequired: SetRequiredType;
  setTaskRequired: SetRequiredType;
  setHistoryEditable(value: boolean): Promise<void>;
  overwriteDatabaseAsJson(json: string): Promise<void>;
}
