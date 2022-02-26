import { Database } from './database';
import { Event } from './model';

export interface NowState {
  readonly last?: Event;
  save(event: Event): void;
}

export class Controller implements NowState {
  constructor(database: Database) {
    this.database = database;
    this.last = undefined;
  }
  // private data
  private readonly database: Database;
  // interface NowState
  readonly last?: Event;
  save(event: Event): void {}
}
