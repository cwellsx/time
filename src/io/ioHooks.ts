import React from "react";

import { useSetError } from "../error";
import { useTesting } from "./appTestingContext";
import { Controller } from "./controller";
import { EditDatabase, editDatabase, fetchConfig, fetchDatabase, Fetched } from "./database";
import { persist } from "./persist";
import { getTestResults } from "./tests";

import type { TestResults } from "../model";
import { useSetYear } from "../topbar";

/*
  useDatabase and useTestResults have a similar structure

  in theory they could be implemented with a common subroutine which takes 'fetch' as a parameter
  - but if so the fetch function must be defined at module scope and not be defined as a lambda,
    because it's in the array of dependencies of the useEffect function
  - and definining them as separate functions means they can easily start with different use-hook calls
*/

type AsyncResult<T> = {
  data: T | undefined;
  reload: () => void;
};

function useDatabase(): AsyncResult<Fetched> {
  const [state, setState] = React.useState<Fetched | undefined>(undefined);
  const [version, setVersion] = React.useState(0);
  const testing = useTesting();
  const setError = useSetError();

  React.useEffect(() => {
    let disposed = false;
    const invoke = async () => {
      try {
        const fetched = await fetchDatabase(!testing ? "production" : "test");
        if (disposed) return;
        setState(fetched);
      } catch (e) {
        setError(e + "");
      }
    };
    invoke();

    return () => {
      disposed = true;
    };
  }, [version, setError, testing]);

  const reload = () => setVersion(version + 1);

  return { data: state, reload: reload };
}

export function useTestResults(): TestResults | undefined {
  const [state, setState] = React.useState<TestResults | undefined>(undefined);
  const setError = useSetError();

  React.useEffect(() => {
    let disposed = false;
    const invoke = async () => {
      try {
        const fetched = await getTestResults();
        if (disposed) return;
        setState(fetched);
      } catch (e) {
        setError(e + "");
      }
    };
    invoke();
    return () => {
      disposed = true;
    };
  }, [setError]);

  return state;
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

export function useConfigYear(): void {
  const setYear = useSetYear();
  const testing = useTesting();

  React.useEffect(() => {
    let disposed = false;
    async function loadConfig() {
      const config = await fetchConfig(!testing ? "production" : "test");
      if (config && config.year && !disposed) setYear(config.year);
    }
    loadConfig();
    return () => {
      disposed = true;
    };
  }, [testing, setYear]);
}
