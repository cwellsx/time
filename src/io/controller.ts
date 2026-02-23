import { Edge, EditDatabase, Fetched, getPeriods } from "./database";
import { persist } from "./persist";

import type { SetError } from "../error";
import type {
  Config,
  NewTime,
  Parents,
  PeriodEx,
  RequiredType,
  TagCount,
  TagInfo,
  Time,
  TimeStop,
  What,
  WhatType,
} from "../model";
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
  private readonly onEditDatabase: () => Promise<EditDatabase>;
  private readonly reload: () => void;
  private readonly setError: SetError;
  private readonly tasks: Tasks;
  private readonly tags: Tags;

  constructor(fetched: Fetched, onEditDatabase: () => Promise<EditDatabase>, reload: () => void, setError: SetError) {
    console.log("controller");
    this.fetched = fetched;
    this.onEditDatabase = onEditDatabase;
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

    function toParents(edges: Edge[]): Parents {
      const result: Parents = {};
      for (const edge of edges) {
        result[edge.child] = edge.parent;
      }
      return result;
    }

    this.taskParents = toParents(fetched.taskParents);
    this.tagParents = toParents(fetched.tagParents);
  }

  // interface NowState
  readonly last: Time | undefined;
  readonly config: Config;

  async editDatabase(fn: (edit: EditDatabase) => Promise<unknown>, reload = true): Promise<void> {
    try {
      this.setError("");
      const edit = await this.onEditDatabase();
      await fn(edit);
      if (reload) this.reload();
    } catch (e) {
      this.setError(e);
    }
  }
  async saveTime(time: NewTime): Promise<void> {
    await this.editDatabase(async (edit) => await edit.addTime(time));
  }
  async saveWhat(what: What): Promise<void> {
    this.config.note = what.note;
    this.config.tags = what.tags;
    this.config.task = what.task;
    await this.saveConfig(this.config);
  }
  async cancelLast(): Promise<void> {
    await this.editDatabase(async (edit) => await edit.cancelLast(this.last));
  }

  // interface SettingsState
  readonly persisted: boolean;

  async persist(): Promise<void> {
    try {
      await persist();
      this.reload();
    } catch (e) {
      this.setError(e);
    }
  }
  getDatabaseAsJson(): string {
    return JSON.stringify(this.fetched, null, 2);
  }
  async setTagsRequired(value: RequiredType): Promise<void> {
    this.config.tagsRequired = value;
    await this.saveConfig(this.config);
  }
  async setTaskRequired(value: RequiredType): Promise<void> {
    this.config.taskRequired = value;
    await this.saveConfig(this.config);
  }
  async setHistoryEditable(value: boolean): Promise<void> {
    this.config.historyEditable = value;
    await this.saveConfig(this.config);
  }
  async overwriteDatabaseAsJson(json: string): Promise<void> {
    const fetched: Fetched = JSON.parse(json);
    await this.editDatabase(async (edit) => await edit.overwrite(fetched));
  }

  // interface WhatState
  readonly taskParents: Parents;
  readonly tagParents: Parents;

  getAllWhat(whatType: WhatType): TagInfo[] {
    return whatType === "tags" ? this.fetched.tags : this.fetched.tasks;
  }
  async createWhat(whatType: WhatType, tag: TagInfo): Promise<void> {
    await this.editDatabase(async (edit) => await edit.addWhat(whatType, tag));
  }
  async editSummary(whatType: WhatType, key: string, summary: string): Promise<void> {
    await this.editDatabase(async (edit) => await edit.editSummary(whatType, key, summary));
  }
  async saveWhatType(whatType: WhatType): Promise<void> {
    this.config.whatType = whatType;
    await this.saveConfig(this.config);
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
  async setParent(whatType: WhatType, child: string, parent: string | undefined): Promise<void> {
    await this.editDatabase(async (edit) => await edit.setParent(whatType, child, parent));
  }

  // interface HistoryState
  readonly periods: PeriodEx[];

  async editWhat(when: number, what: What): Promise<void> {
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
    await this.editDatabase(async (edit) => await edit.editWhat(stop));
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
  async editWhen(deleted: number[], inserted: Time[]): Promise<void> {
    await this.editDatabase(async (edit) => await edit.editWhen(deleted, inserted));
  }
  async setYear(year: string | undefined): Promise<void> {
    this.config.year = year ?? "";
    await this.saveConfig(this.config);
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
  private async saveConfig(config: Config): Promise<void> {
    await this.editDatabase(async (edit) => await edit.putConfig(config), false);
  }
}
