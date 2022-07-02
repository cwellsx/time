import { EditDatabase, Fetched, getPeriods } from './database';
import { persist } from './persist';

import type { SetError } from "../error";
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

interface Tags {
  [index: string]:
    | {
        tagInfo: TagInfo;
        count: number;
      }
    | undefined;
}

export class Controller implements NowState, WhatState, HistoryState, SettingsState {
  // private data
  private readonly fetched: Fetched;
  private readonly editDatabase: () => Promise<EditDatabase>;
  private readonly reload: () => void;
  private readonly setError: SetError;
  private readonly tasks: Tasks;
  private readonly tags: Tags;

  constructor(fetched: Fetched, editDatabase: () => Promise<EditDatabase>, reload: () => void, setError: SetError) {
    console.log("controller");
    this.fetched = fetched;
    this.editDatabase = editDatabase;
    this.reload = reload;
    this.setError = setError;

    const times = fetched.times;
    const length = times.length;
    this.last = length ? times[length - 1] : undefined;
    this.config = fetched.config || {};
    this.persisted = fetched.persisted;
    this.periods = getPeriods(times);

    this.tasks = {};
    for (const task of fetched.tasks) this.tasks[task.key] = { tagInfo: task, usedDate: 0 };
    this.tags = {};
    for (const tag of fetched.tags) this.tags[tag.key] = { tagInfo: tag, count: 0 };

    for (const time of times) {
      if (time.type !== "start") {
        const task = time.task;
        if (task) {
          const found = this.tasks[task];
          if (found) found.usedDate = time.when;
        }
        const tags = time.tags;
        if (tags) {
          for (const tag of tags) {
            const found = this.tags[tag];
            if (found) ++found.count;
          }
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
    return JSON.stringify(this.fetched, null, 2);
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
    return whatType === "tags" ? this.fetched.tags : this.fetched.tasks;
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
  keyIsReferenced(whatType: WhatType, key: string): boolean {
    if (whatType === "tags") {
      const found = this.tags[key];
      return !!found && found.count > 0;
    } else {
      const found = this.tasks[key];
      return !!found && found.usedDate > 0;
    }
  }

  // interface HistoryState
  readonly periods: Period[];

  editWhat(when: number, what: What): void {
    const found = this.findTime(when);
    if (!found) {
      this.setError("editWhat -- specified time not found");
      return;
    }
    const type = found.type;
    if (type === "start") {
      this.setError("editWhat -- specified time unexpected type");
      return;
    }
    const stop: TimeStop = { when, type, note: what.note, tags: what.tags, task: what.task };
    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.editWhat(stop);
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
  getTagDescription(tag: string): string | undefined {
    const found = this.tags[tag];
    return found ? found.tagInfo.summary : undefined;
  }
  findTime(when: number): Time | undefined {
    return this.fetched.times.find((it) => it.when === when);
  }
  editWhen(deleted: number[], inserted: Time[]): void {
    this.editDatabase()
      .then(async (edit) => {
        try {
          await edit.editWhen(deleted, inserted);
          this.reload();
        } catch (e) {
          this.setError(e);
        }
      })
      .catch((error) => this.setError(error));
  }

  // EditWhatState
  getAllTags(): TagCount[] {
    const result: TagCount[] = [];
    for (const key in this.tags) {
      const count = this.tags[key]!.count;
      const summary = this.tags[key]!.tagInfo.summary;
      result.push({ key, summary, count });
    }
    return result;
  }
  getAllTasks(): TagCount[] {
    const result: TagCount[] = [];
    for (const key in this.tasks) {
      const count = this.tasks[key]!.usedDate;
      const summary = this.tasks[key]!.tagInfo.summary;
      result.push({ key, summary, count });
    }
    return result;
  }

  // private
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
