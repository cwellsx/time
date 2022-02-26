import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Event } from './model';

interface Schema extends DBSchema {
  events: {
    key: number;
    value: Event;
  };
}

async function open(): Promise<IDBPDatabase<Schema>> {
  const db = await openDB<Schema>("my-db", 1, {
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

export async function fetchDatabase(): Promise<Database | undefined> {
  try {
    const db = await open();
    const events = await db.getAll("events");
    return new Database(events);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
