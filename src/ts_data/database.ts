import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';

import { Event } from './model';

export type DbName = "production" | "test";

interface Schema extends DBSchema {
  events: {
    key: number;
    value: Event;
  };
}

async function open(dbName: DbName): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>(dbName, 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore("events", {
        keyPath: "when",
      });
    },
  });
  return db;
}

export class Database {
  constructor(events: Event[]) {
    this.events = events;
  }
  readonly events: Event[];
}

export class EditDatabase {
  private readonly db: IDBPDatabase<Schema>;
  constructor(db: IDBPDatabase<Schema>) {
    this.db = db;
  }
  addEvent(event: Event): Promise<number> {
    return this.db.add("events", event);
  }
  addEvents(events: Event[]): Promise<number[]> {
    const tx = this.db.transaction("events", "readwrite");
    const store = tx.objectStore("events");
    return Promise.all(events.map(async (event) => store.add(event)));
  }
}

export async function fetchDatabase(dbName: DbName): Promise<Database> {
  const db = await open(dbName);
  const events = await db.getAll("events");
  return new Database(events);
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
