import { Database, editDatabase, SetError } from './database';

import type { Config, TagCount, Time, TagInfo } from "../model";
import type { NowState } from "../states";

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

    this.config = database.config || {};
  }

  // private data
  private readonly database: Database;

  // interface NowState
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };

  readonly config: Config;

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
    const config: Config = { ...this.config };
    config.note = comment;
    this.saveConfig(config);
  }

  getAllTags(): Promise<TagCount[]> {
    return Controller.getAll(this.database.tags);
  }

  getAllTasks(): Promise<TagCount[]> {
    return Controller.getAll(this.database.tasks);
  }

  private static getAll(tags: TagInfo[]): Promise<TagCount[]> {
    const result: TagCount[] = tags.map<TagCount>((tag) => {
      return { key: tag.key, summary: tag.summary, count: 1 };
    });
    return new Promise<TagCount[]>((resolve, reject) => {
      resolve(result);
    });
  }

  saveTags(tags: string[]): void {
    const config: Config = { ...this.config };
    config.tags = tags;
    this.saveConfig(config);
  }

  saveTask(task: string): void {
    const config: Config = { ...this.config };
    config.task = task;
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
