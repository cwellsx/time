import React from 'react';

export type SetTesting = (testing: boolean) => void;

// called from App
export function useAppTestingContext(): [boolean, SetTesting] {
  const [testing, setTesting] = React.useState(false);
  return [testing, setTesting];
}

type AppTestingContextProps = {
  testing: boolean;
  setTesting: SetTesting;
};

export const AppTestingContext = React.createContext<AppTestingContextProps>({
  testing: false,
  setTesting: (testing: boolean) => {},
});

export function useTesting(): boolean {
  const props: AppTestingContextProps = React.useContext(AppTestingContext);
  return props.testing;
}

export function useSetTesting(): SetTesting {
  const props: AppTestingContextProps = React.useContext(AppTestingContext);
  return props.setTesting;
}
