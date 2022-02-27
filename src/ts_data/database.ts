import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';

import { Time } from './model';

export type DbName = "production" | "test";

interface Schema extends DBSchema {
  times: {
    key: number;
    value: Time;
  };
}

async function open(dbName: DbName): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>(dbName, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore("times", {
        keyPath: "when",
      });
    },
  });
  return db;
}

export class Database {
  constructor(dbName: DbName, times: Time[]) {
    this.dbName = dbName;
    this.times = times;
  }
  readonly dbName: DbName;
  readonly times: Time[];
}

export class EditDatabase {
  private readonly db: IDBPDatabase<Schema>;
  constructor(db: IDBPDatabase<Schema>) {
    this.db = db;
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
  return new Database(dbName, times);
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
