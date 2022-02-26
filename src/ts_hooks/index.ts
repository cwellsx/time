import React from 'react';

import { Controller, Database, fetchDatabase, getTestResults, TestResult } from '../ts_data';

function useAsync<T>(fetch: () => Promise<T | undefined>): T | undefined {
  const [state, setState] = React.useState<T | undefined>(undefined);

  React.useEffect(() => {
    const invoke = async () => {
      const fetched = await fetch();
      setState(fetched);
    };
    invoke();
  }, []);

  return state;
}

function useDatabase(): Database | undefined {
  return useAsync(fetchDatabase);
}

export function useTestResults(): TestResult[] | undefined {
  return useAsync(getTestResults);
}

export function useController(): Controller | undefined {
  const database = useDatabase();

  return database ? new Controller(database) : undefined;
}
