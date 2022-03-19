import { Database, EditDatabase, getPeriods } from "./database";
import { persist } from "./persist";

import type { SetError } from "../appContext";
import type { Config, Period, TagCount, TagInfo, Time, WhatType, RequiredType } from "../model";
import type { HistoryState, NowState, SettingsState, WhatState } from "../states";

export class Controller implements NowState, WhatState, HistoryState, SettingsState {
  // private data
  private readonly database: Database;
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
    this.periods = getPeriods(times);
  }

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

  cancelLast(): void {
    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.cancelLast(this.last);
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

  hasTags(): boolean {
    return this.database.tags.length > 0;
  }
  hasTask(): boolean {
    return this.database.tasks.length > 0;
  }

  // interface SettingsState
  readonly persisted: boolean;
  persist(): void {
    persist()
      .then(() => this.reload)
      .catch((error) => this.setError(error));
  }
  setTagsRequired(value: RequiredType): void {
    const config: Config = { ...this.config };
    config.tagsRequired = value;
    this.saveConfig(config);
  }
  setTaskRequired(value: RequiredType): void {
    const config: Config = { ...this.config };
    config.taskRequired = value;
    this.saveConfig(config);
  }

  // interface WhatState
  getAllWhat(whatType: WhatType): TagInfo[] {
    return whatType === "tags" ? this.database.tags : this.database.tasks;
  }

  createWhat(what: WhatType, tag: TagInfo): void {
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

  // interface HistoryState
  readonly periods: Period[];
}
