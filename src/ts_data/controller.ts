import { editDatabase } from '.';
import { SetError } from '../ts_hooks';
import { Database } from './database';
import { isTimeStop, Time, TimeStop, What } from './model';

export interface NowState {
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly prev?: {
    readonly what: What[];
    readonly note: string;
  };
  save(time: Time): void;
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
    const prev = Controller.getPrev(times);
    this.prev = prev ? { what: prev.what, note: prev.note } : undefined;
  }
  private static getPrev(times: Time[]): TimeStop | undefined {
    for (let i = times.length - 1; i >= 0; --i) {
      const time = times[i];
      if (isTimeStop(time)) return time;
    }
    return undefined;
  }

  // private data
  private readonly database: Database;

  // interface NowState
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly prev?: {
    readonly what: What[];
    readonly note: string;
  };
  save(time: Time): void {
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
}
