import React from "react";

/*
  functions related to SetError and AppContext
*/

export type SetTesting = (testing: boolean) => void;
export type SetError = (error: any) => void;

export function useContext(): [string, SetError, boolean, SetTesting] {
  const [error, setError] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const setAny: SetError = (e) => setError(e);
  return [error, setAny, testing, setTesting];
}

type AppContextProps = {
  setError: SetError;
  testing: boolean;
  setTesting: SetTesting;
};

export const AppContext = React.createContext<AppContextProps>({
  setError: (error: string) => {},
  testing: false,
  setTesting: (testing: boolean) => {},
});

export function useSetError(): SetError {
  const appContext: AppContextProps = React.useContext(AppContext);
  return appContext.setError;
}

export function useTesting(): boolean {
  const appContext: AppContextProps = React.useContext(AppContext);
  return appContext.testing;
}

export function useSetTesting(): SetTesting {
  const appContext: AppContextProps = React.useContext(AppContext);
  return appContext.setTesting;
}
