import { DBSchema, deleteDB, IDBPDatabase, openDB } from "idb";

import { persisted } from "./persist";

import type { Config, NewTime, PeriodEx, TagInfo, Time, TimeStop } from "../model";

export type DbName = "production" | "test";

export type Edge = {
  child: string;
  parent: string;
};

// we only store on Config instance in the table, not several,
// so use this value as the key of that object in its table
const configVersion = 1;

interface Schema extends DBSchema {
  times: {
    key: number;
    value: Time;
  };
  config: {
    key: number;
    value: Config;
  };
  tags: {
    key: string;
    value: TagInfo;
  };
  tasks: {
    key: string;
    value: TagInfo;
  };
  taskParents: {
    key: string;
    value: Edge;
  };
  tagParents: {
    key: string;
    value: Edge;
  };
}

export type Database = IDBPDatabase<Schema>;

export async function open(dbName: DbName): Promise<Database> {
  const db: Database = await openDB<Schema>(dbName, 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("times", {
          keyPath: "when",
        });
        db.createObjectStore("config");
        db.createObjectStore("tags", {
          keyPath: "key",
        });
        db.createObjectStore("tasks", {
          keyPath: "key",
        });
      }
      if (oldVersion < 2) {
        db.createObjectStore("taskParents", {
          keyPath: "child",
        });
        db.createObjectStore("tagParents", {
          keyPath: "child",
        });
      }
    },
  });
  return db;
}

export type Fetched = {
  readonly dbName: DbName;
  readonly times: Time[];
  readonly tags: TagInfo[];
  readonly tasks: TagInfo[];
  readonly taskParents: Edge[];
  readonly tagParents: Edge[];
  readonly config?: Config;
  readonly persisted: boolean;
};

export class EditDatabase {
  protected readonly db: Database;
  constructor(db: Database) {
    this.db = db;
  }
  putConfig(config: Config): Promise<number> {
    return this.db.put("config", config, configVersion);
  }
  async addTime(time: NewTime): Promise<number> {
    const tx = this.db.transaction("times");
    const cursor = await tx.objectStore("times").openCursor(null, "prev");
    const last = cursor?.key ?? null;
    if (last !== time.last) throw new Error("unexpected previous time -- refresh the browser window and try agtain");
    return this.db.add("times", time);
  }
  async cancelLast(time: Time | undefined): Promise<void> {
    if (!time) {
      throw new Error("cancelLast -- !time");
    }
    switch (time.type) {
      case "start":
        await this.db.delete("times", time.when);
        return;
      case "next":
        const stop = { ...time };
        stop.type = "stop";
        await this.db.put("times", stop);
        return;
      case "stop":
        throw new Error("cancelLast -- time.type=='stop'");
      default:
        throw new Error("cancelLast -- unhandled time.type");
    }
  }
  async addTimes(times: Time[]): Promise<number[]> {
    const tx = this.db.transaction("times", "readwrite");
    const store = tx.objectStore("times");
    const result: number[] = [];
    for (const time of times) {
      result.push(await store.add(time));
    }
    await tx.done;
    return result;
    //return Promise.all(times.map(async (time) => store.add(time)));
  }
  addWhat(whatType: "tags" | "tasks", tag: TagInfo): Promise<string> {
    return this.db.add(whatType, tag);
  }
  editSummary(whatType: "tags" | "tasks", key: string, summary: string): Promise<string> {
    const tag: TagInfo = { key, summary };
    return this.db.put(whatType, tag);
  }
  setParent(whatType: "tags" | "tasks", child: string, parent: string | undefined): Promise<string | void> {
    const table = whatType === "tasks" ? "taskParents" : "tagParents";
    if (parent) return this.db.put(table, { child, parent });
    else return this.db.delete(table, child);
  }
  editWhat(timeStop: TimeStop): Promise<number> {
    return this.db.put("times", timeStop);
  }
  async editWhen(deleted: number[], inserted: Time[]): Promise<void> {
    const tx = this.db.transaction("times", "readwrite");
    const store = tx.objectStore("times");
    for (const when of deleted) {
      console.log(`delete ${JSON.stringify(when)}`);
      await store.delete(when);
    }
    for (const time of inserted) {
      console.log(`add ${JSON.stringify(time)}`);
      await store.add(time);
    }
    await tx.done;
  }
  async overwrite(fetched: Fetched): Promise<void> {
    const storeNames = Array.from(this.db.objectStoreNames);
    const tx = this.db.transaction(storeNames, "readwrite");
    for (const storeName of storeNames) {
      await tx.objectStore(storeName).clear();
      if (storeName === "config") {
        const config = fetched[storeName];
        if (config) await tx.objectStore("config").put(config, configVersion);
        continue;
      }
      const imported = fetched[storeName];
      for (const row of imported) await tx.objectStore(storeName).add(row);
    }
    await tx.done;
  }
}

export async function fetchDatabase(dbName: DbName): Promise<Fetched> {
  console.log("fetchDatabase");
  const db = await open(dbName);
  const tx = db.transaction(["times", "config", "tags", "tasks", "taskParents", "tagParents"]);
  const times = await tx.objectStore("times").getAll();
  const config = await tx.objectStore("config").get(configVersion);
  const tags = await tx.objectStore("tags").getAll();
  const tasks = await tx.objectStore("tasks").getAll();
  const taskParents = await tx.objectStore("taskParents").getAll();
  const tagParents = await tx.objectStore("tagParents").getAll();
  return { dbName, times, tags, tasks, taskParents, tagParents, config, persisted: await persisted() };
}

export async function fetchConfig(dbName: DbName): Promise<Config | undefined> {
  console.log("fetchDatabase");
  const db = await open(dbName);
  const tx = db.transaction(["config"]);
  const config = await tx.objectStore("config").get(configVersion);
  return config;
}

export async function clearDatabase(dbName: DbName): Promise<void> {
  console.log("clearDatabase");
  const db = await open(dbName);
  await db.clear("times");
  await db.clear("config");
  await db.clear("tags");
  await db.clear("tasks");
  await db.clear("taskParents");
  await db.clear("tagParents");
}

export async function deleteDatabase(dbName: DbName): Promise<void> {
  console.log("deleteDatabase");
  try {
    await deleteDB(dbName);
    console.log("deleteDatabase done");
  } catch (e) {
    console.error(e);
    console.log("deleteDatabase error");
  }
}

export async function editDatabase(dbName: DbName): Promise<EditDatabase> {
  const db = await open(dbName);
  return new EditDatabase(db);
}

export function getPeriods(times: Time[]): PeriodEx[] {
  const result: PeriodEx[] = [];
  const length = times.length;
  if (length > 0) {
    let prev: Time = times[0];
    for (const time of times) {
      switch (time.type) {
        case "next":
        case "stop":
          if (prev.type === "stop") {
            throw Error("period must start after stop");
          }
          const period: PeriodEx = {
            start: prev.when,
            stop: time.when,
            task: time.task,
            note: time.note,
            tags: time.tags,
            startYear: new Date(prev.when).getFullYear(),
          };
          result.push(period);
      }
      prev = time;
    }
  }
  return result;
}
