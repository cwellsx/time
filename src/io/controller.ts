import { Database, EditDatabase, getPeriods } from './database';
import { persist } from './persist';

import type { SetError } from "../appContext";
import type { Config, Period, TagCount, TagInfo, Time, WhatType, RequiredType, What, TimeStop } from "../model";
import type { HistoryState, NowState, SettingsState, WhatState } from "../states";

interface Tasks {
  [index: string]:
    | {
        tagInfo: TagInfo;
        usedDate: number;
      }
    | undefined;
}

export class Controller implements NowState, WhatState, HistoryState, SettingsState {
  // private data
  private readonly database: Database;
  private readonly editDatabase: () => Promise<EditDatabase>;
  private readonly reload: () => void;
  private readonly setError: SetError;
  private readonly tasks: Tasks;

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

    this.tasks = {};
    for (const task of database.tasks) this.tasks[task.key] = { tagInfo: task, usedDate: 0 };

    for (const time of times) {
      if (time.type != "start") {
        const task = time.task;
        if (task) {
          const found = this.tasks[task];
          if (found) found.usedDate = time.when;
        }
      }
    }
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
  saveWhat(what: What): void {
    this.config.note = what.note;
    this.config.tags = what.tags;
    this.config.task = what.task;
    this.saveConfig(this.config);
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
    this.config.tagsRequired = value;
    this.saveConfig(this.config);
  }
  setTaskRequired(value: RequiredType): void {
    this.config.taskRequired = value;
    this.saveConfig(this.config);
  }
  setHistoryEditable(value: boolean): void {
    this.config.historyEditable = value;
    this.saveConfig(this.config);
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
    this.config.whatType = whatType;
    this.saveConfig(this.config);
  }
  keyAlreadyExists(whatType: WhatType, key: string): boolean {
    const all = this.getAllWhat(whatType);
    const found = all.find((it) => it.key === key);
    return !!found;
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
  getTaskDescription(task: string): string | undefined {
    const found = this.tasks[task];
    return found ? found.tagInfo.summary : undefined;
  }

  // EditWhatState
  getAllTags(): TagCount[] {
    return Controller.getAllTagCounts(this.database.tags);
  }
  getAllTasks(): TagCount[] {
    return Controller.getAllTagCounts(this.database.tasks);
  }

  // private
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
}
