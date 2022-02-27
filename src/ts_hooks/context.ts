import React from 'react';

export function useError() {
  return React.useState("");
}

type AppContextProps = {
  setError(error: string): void;
};

export const AppContext = React.createContext<AppContextProps>({
  setError: (error: string) => {},
});

export function useSetError() {
  const appContext: AppContextProps = React.useContext(AppContext);
  return appContext.setError;
}
