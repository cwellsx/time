import { DBSchema, deleteDB, IDBPDatabase, openDB } from "idb";

import { persisted } from "./persist";

import type { Config, NewTime, Period, TagInfo, Time, TimeStop } from "../model";

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
  cancelLast(time: Time | undefined): Promise<void> {
    if (!time) {
      throw new Error("cancelLast -- !time");
    }
    switch (time.type) {
      case "start":
        return this.db.delete("times", time.when);
      case "next":
        const stop = { ...time };
        stop.type = "stop";
        const promise = this.db.put("times", stop);
        // https://stackoverflow.com/a/32961289/49942
        return promise.then(() => {});
      case "stop":
        throw new Error("cancelLast -- time.type=='stop'");
      default:
        throw new Error("cancelLast -- unhandled time.type");
    }
  }
  addTimes(times: Time[]): Promise<number[]> {
    const tx = this.db.transaction("times", "readwrite");
    const store = tx.objectStore("times");
    return Promise.all(times.map(async (time) => store.add(time)));
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

export async function clearDatabase(dbName: DbName): Promise<void> {
  console.log("clearDatabase");
  const db = await open(dbName);
  await db.clear("times");
  await db.clear("config");
  await db.clear("tags");
  await db.clear("tasks");
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

export function getPeriods(times: Time[]): Period[] {
  const result: Period[] = [];
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
          const period: Period = {
            start: prev.when,
            stop: time.when,
            task: time.task,
            note: time.note,
            tags: time.tags,
          };
          result.push(period);
      }
      prev = time;
    }
  }
  return result;
}
