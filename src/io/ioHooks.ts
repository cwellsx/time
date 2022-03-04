import React from 'react';

import { Controller } from './controller';
import { Database, fetchDatabase, SetError } from './database';
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
  const setError = useSetError();
  return database ? new Controller(database, reload, setError) : undefined;
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
