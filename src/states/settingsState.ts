export interface SettingsState {
  readonly persisted: boolean;
  persist(): void;
}
