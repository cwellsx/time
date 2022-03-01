import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';

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
}

async function open(dbName: DbName): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>(dbName, 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("times", {
          keyPath: "when",
        });
      }
      if (oldVersion < 2) {
        db.createObjectStore("config");
      }
    },
  });
  return db;
}

export class Database {
  constructor(dbName: DbName, times: Time[], config: Config | undefined) {
    this.dbName = dbName;
    this.times = times;
    this.config = config;
  }
  readonly dbName: DbName;
  readonly times: Time[];
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
  return new Database(dbName, times, config);
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
