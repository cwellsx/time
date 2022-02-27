import React from 'react';

import { Controller, Database, fetchDatabase, getTestResults, TestResult } from '../ts_data';

type AsyncResult<T> = {
  data: T | undefined;
  reload: () => void;
};

function useAsync<T>(fetch: () => Promise<T>): AsyncResult<T> {
  const [state, setState] = React.useState<T | undefined>(undefined);
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    const invoke = async () => {
      const fetched = await fetch();
      setState(fetched);
    };
    invoke();
  }, [version]);

  const reload = () => setVersion(version + 1);

  return { data: state, reload: reload };
}

function useDatabase(): AsyncResult<Database> {
  return useAsync(async () => fetchDatabase("production"));
}

export function useTestResults(): TestResult[] | undefined {
  return useAsync(getTestResults).data;
}

export function useController(): Controller | undefined {
  const { data: database, reload } = useDatabase();

  return database ? new Controller(database, reload) : undefined;
}