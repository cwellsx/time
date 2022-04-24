import React from 'react';

export type SetError = (error: any) => void;

// called from App
export function useAppErrorContext(): [string, SetError] {
  const [error, setError] = React.useState("");
  const setAny: SetError = (e) => setError(e.toString());
  return [error, setAny];
}

type AppErrorContextProps = {
  setError: SetError;
};

export const AppErrorContext = React.createContext<AppErrorContextProps>({
  setError: (error: string) => {},
});

export function useSetError(): SetError {
  const props: AppErrorContextProps = React.useContext(AppErrorContext);
  return props.setError;
}
