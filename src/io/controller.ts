import { Database, EditDatabase, getPeriods } from './database';
import { persist } from './persist';

import type { SetError } from "../appContext";
import type { Config, Period, TagCount, TagInfo, Time, WhatType, RequiredType, What, TimeStop } from "../model";
import type { HistoryState, NowState, SettingsState, WhatState } from "../states";

export class Controller implements NowState, WhatState, HistoryState, SettingsState {
  // private data
  private readonly database: Database;
  private readonly editDatabase: () => Promise<EditDatabase>;
  private readonly reload: () => void;
  private readonly setError: SetError;

  constructor(database: Database, editDatabase: () => Promise<EditDatabase>, reload: () => void, setError: SetError) {
    console.log("controller");
    this.database = database;
    this.editDatabase = editDatabase;
    this.reload = reload;
    this.setError = setError;

    const times = database.times;
    const length = times.length;
    this.last = length ? times[length - 1] : undefined;
    this.config = database.config || {};
    this.persisted = database.persisted;
    this.periods = getPeriods(times);
  }

  // interface NowState
  readonly last: Time | undefined;
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

  saveComment(comment: string | undefined): void {
    const config: Config = { ...this.config };
    config.note = comment;
    this.saveConfig(config);
  }
  saveTags(tags: string[] | undefined): void {
    const config: Config = { ...this.config };
    config.tags = tags;
    this.saveConfig(config);
  }
  saveTask(task: string | undefined): void {
    const config: Config = { ...this.config };
    config.task = task;
    this.saveConfig(config);
  }

  getAllTags(): TagCount[] {
    return Controller.getAllTagCounts(this.database.tags);
  }

  getAllTasks(): TagCount[] {
    return Controller.getAllTagCounts(this.database.tasks);
  }

  private static getAllTagCounts(tags: TagInfo[]): TagCount[] {
    return tags.map<TagCount>((tag) => {
      return { key: tag.key, summary: tag.summary, count: 1 };
    });
  }

  private saveConfig(config: Config): void {
    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.putConfig(config);
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
  getDatabaseAsJson(): string {
    return JSON.stringify(this.database, null, 2);
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
  setHistoryEditable(value: boolean): void {
    const config: Config = { ...this.config };
    config.historyEditable = value;
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
  editHistory(when: number, what: What): void {
    const found = this.database.times.find((it) => it.when === when);
    if (!found) {
      this.setError("editHistory -- specified time not found");
      return;
    }
    const type = found.type;
    if (type === "start") {
      this.setError("editHistory -- specified time unexpected type");
      return;
    }
    const stop: TimeStop = { when, type, note: what.note, tags: what.tags, task: what.task };

    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.editHistory(stop);
          this.reload();
        } catch (e) {
          this.setError(e);
        }
      })
      .catch((error) => this.setError(error));
  }
}
