import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';

import { TagInfo } from '../tags';
import { Config, configVersion, Time } from './model';

export type DbName = "production" | "test";
export type SetError = (error: any) => void;

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
}

async function open(dbName: DbName): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>(dbName, 3, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("times", {
          keyPath: "when",
        });
      }
      if (oldVersion < 2) {
        db.createObjectStore("config");
      }
      if (oldVersion < 3) {
        db.createObjectStore("tags", {
          keyPath: "title",
        });
      }
    },
  });
  return db;
}

export class Database {
  constructor(dbName: DbName, times: Time[], tags: TagInfo[], config: Config | undefined) {
    this.dbName = dbName;
    this.times = times;
    this.tags = tags;
    this.config = config;
  }
  readonly dbName: DbName;
  readonly times: Time[];
  readonly tags: TagInfo[];
  readonly config?: Config;
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
  addTimes(times: Time[]): Promise<number[]> {
    const tx = this.db.transaction("times", "readwrite");
    const store = tx.objectStore("times");
    return Promise.all(times.map(async (time) => store.add(time)));
  }
}

export async function fetchDatabase(dbName: DbName): Promise<Database> {
  const db = await open(dbName);
  const times = await db.getAll("times");
  const config = await db.get("config", configVersion);
  const tags = await db.getAll("tags");
  return new Database(dbName, times, tags, config);
}

export async function deleteDatabase(dbName: DbName): Promise<void> {
  try {
    await deleteDB(dbName);
  } catch (e) {
    console.error(e);
  }
}

export async function editDatabase(dbName: DbName): Promise<EditDatabase> {
  const db = await open(dbName);
  return new EditDatabase(db);
}
