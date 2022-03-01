import { Config, editDatabase } from '.';
import { Database, SetError } from './database';
import { Time } from './model';

export interface NowState {
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly config?: Config;
  saveTime(time: Time): void;
  saveComment(comment: string): void;
}

export class Controller implements NowState {
  private readonly reload: () => void;
  private readonly setError: SetError;
  constructor(database: Database, reload: () => void, setError: SetError) {
    this.database = database;
    this.reload = reload;
    this.setError = setError;

    const times = database.times;
    const length = times.length;
    const last = length ? times[length - 1] : undefined;
    this.last = last ? { type: last.type, when: last.when } : undefined;

    this.config = database.config;
  }

  // private data
  private readonly database: Database;

  // interface NowState
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly config?: Config;
  saveTime(time: Time): void {
    editDatabase(this.database.dbName)
      .then(async (edit) => {
        try {
          await edit.addTime(time);
          this.reload();
        } catch (e) {
          this.setError(e);
        }
      })
      .catch((error) => this.setError(error));
  }
  saveComment(comment: string): void {
    const config: Config = this.config || {};
    config.note = comment;
    this.saveConfig(config);
  }

  private saveConfig(config: Config): void {
    editDatabase(this.database.dbName)
      .then(async (edit) => {
        try {
          await edit.putConfig(config);
          this.reload();
        } catch (e) {
          this.setError(e);
        }
      })
      .catch((error) => this.setError(error));
  }
}
