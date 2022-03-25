import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';

import { persisted } from './persist';

import type { Config, Time, TagInfo, Period } from "../model";

export type DbName = "production" | "test";

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
}

async function open(dbName: DbName): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>(dbName, 1, {
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
    },
  });
  return db;
}

export class Database {
  constructor(
    dbName: DbName,
    times: Time[],
    tags: TagInfo[],
    tasks: TagInfo[],
    config: Config | undefined,
    persisted: boolean
  ) {
    this.dbName = dbName;
    this.times = times;
    this.tags = tags;
    this.tasks = tasks;
    this.config = config;
    this.persisted = persisted;
  }
  readonly dbName: DbName;
  readonly times: Time[];
  readonly tags: TagInfo[];
  readonly tasks: TagInfo[];
  readonly config?: Config;
  readonly persisted: boolean;
}

export class EditDatabase {
  private readonly db: IDBPDatabase<Schema>;
  constructor(db: IDBPDatabase<Schema>) {
    this.db = db;
  }
  putConfig(config: Config): Promise<number> {
    return this.db.put("config", config, configVersion);
  }
  addTime(time: Time): Promise<number> {
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
  addWhat(what: "tags" | "tasks", tag: TagInfo): Promise<string> {
    return this.db.add(what, tag);
  }
}

export async function fetchDatabase(dbName: DbName): Promise<Database> {
  const db = await open(dbName);
  const tx = db.transaction(["times", "config", "tags", "tasks"]);
  const times = await tx.objectStore("times").getAll();
  const config = await tx.objectStore("config").get(configVersion);
  const tags = await tx.objectStore("tags").getAll();
  const tasks = await tx.objectStore("tasks").getAll();
  return new Database(dbName, times, tags, tasks, config, await persisted());
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
