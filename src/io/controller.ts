import { persist } from "./persist";

import type { SetError } from "../error";
import type { Database, EditDatabase } from "./database";
import type { Config, TagCount, Time, TagInfo, WhatType } from "../model";
import type { NowState, SettingsState, WhatState } from "../states";

export class Controller implements NowState, SettingsState, WhatState {
  private readonly editDatabase: () => Promise<EditDatabase>;
  private readonly reload: () => void;
  private readonly setError: SetError;
  constructor(database: Database, editDatabase: () => Promise<EditDatabase>, reload: () => void, setError: SetError) {
    this.database = database;
    this.editDatabase = editDatabase;
    this.reload = reload;
    this.setError = setError;

    const times = database.times;
    const length = times.length;
    const last = length ? times[length - 1] : undefined;
    this.last = last ? { type: last.type, when: last.when } : undefined;

    this.config = database.config || {};

    this.persisted = database.persisted;
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
    this.editDatabase()
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
    return Controller.getAllPromised(this.database.tags);
  }

  getAllTasks(): Promise<TagCount[]> {
    return Controller.getAllPromised(this.database.tasks);
  }

  private static getAllPromised(tags: TagInfo[]): Promise<TagCount[]> {
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
    this.editDatabase()
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

  // interface SettingsState
  readonly persisted: boolean;
  persist(): void {
    persist()
      .then(() => this.reload)
      .catch((error) => this.setError(error));
  }

  // interface WhatState
  getAll(whatType: WhatType): TagInfo[] {
    return whatType === "tags" ? this.database.tags : this.database.tasks;
  }

  create(what: WhatType, tag: TagInfo): void {
    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.addWhat(what, tag);
          this.reload();
        } catch (e) {
          this.setError(e);
        }
      })
      .catch((error) => this.setError(error));
  }

  saveWhatType(whatType: WhatType): void {
    const config: Config = { ...this.config };
    config.whatType = whatType;
    this.saveConfig(config);
  }
}
