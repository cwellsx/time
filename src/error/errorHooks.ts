import React from "react";

/*
  functions related to SetError and AppContext
*/

export type SetError = (error: any) => void;

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
