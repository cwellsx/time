import React from 'react';

import { Controller } from './controller';
import { Database, EditDatabase, editDatabase, fetchDatabase, SetError } from './database';
import { persist } from './persist';
import { getTestResults } from './tests';

import type { TestResult } from "../model";

/*
  functions which depend on useAsync
*/

type AsyncResult<T> = {
  data: T | undefined;
  reload: () => void;
};

function useAsync<T>(fetch: () => Promise<T>): AsyncResult<T> {
  const [state, setState] = React.useState<T | undefined>(undefined);
  const [version, setVersion] = React.useState(0);
  const setError = useSetError();

  React.useEffect(() => {
    const invoke = async () => {
      try {
        const fetched = await fetch();
        setState(fetched);
      } catch (e) {
        setError(e + "");
      }
    };
    invoke();
  }, [version, setError, fetch]);

  const reload = () => setVersion(version + 1);

  return { data: state, reload: reload };
}

// this must be at module scope, not a lambda, because it's in the array of dependencies of the useEffect function
async function fetchProductionDatabase() {
  return fetchDatabase("production");
}

function useDatabase(): AsyncResult<Database> {
  return useAsync(fetchProductionDatabase);
}

export function useTestResults(): TestResult[] | undefined {
  return useAsync(getTestResults).data;
}

export function useController(): Controller | undefined {
  const { data: database, reload } = useDatabase();
  const [once, setOnce] = React.useState<boolean>(false);
  const setError = useSetError();
  if (!database) return undefined;
  const onEditDatabase = async (): Promise<EditDatabase> => {
    // call the persist method as infrequently as possible, and not on load, because it may popup to the user
    if (!database.persisted && !once) {
      await persist();
      setOnce(true);
    }
    return editDatabase(database.dbName);
  };
  return new Controller(database, onEditDatabase, reload, setError);
}

/*
  functions related to SetError and AppContext
*/

export function useError(): [string, SetError] {
  const [error, setError] = React.useState("");
  const setAny: SetError = (e) => setError(e);
  return [error, setAny];
}

type AppContextProps = {
  setError: SetError;
};

export const AppContext = React.createContext<AppContextProps>({
  setError: (error: string) => {},
});

export function useSetError(): SetError {
  const appContext: AppContextProps = React.useContext(AppContext);
  return appContext.setError;
}
