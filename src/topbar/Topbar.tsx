import "./topbar.sass";

import React from "react";
import * as ReactRouter from "react-router-dom";

import { useConfigYear } from "../io";
import { pages } from "./pageProperties";

type TopbarProps = {
  year: string | undefined;
};

export const Topbar: React.FunctionComponent<TopbarProps> = (props: TopbarProps) => {
  const { year } = props;

  useConfigYear();

  return (
    <div className="topbar">
      <div className="container">
        <ul className="icons">
          {pages.map((it) => {
            let to = it.href;
            if (to === "/history" && year) to = `/history/${year}`;
            return (
              <li key={it.title} className="icon">
                <ReactRouter.NavLink to={to} title={it.title}>
                  <it.icon width="24" height="24" />
                  <span>{it.title}</span>
                </ReactRouter.NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export type SetYear = (year: string) => void;

export function useAppYearContext(): [string | undefined, SetYear] {
  const [year, setYear] = React.useState<string | undefined>(undefined);
  return [year, setYear];
}
type AppYearContextProps = {
  setYear: SetYear;
};

export const AppYearContext = React.createContext<AppYearContextProps>({
  setYear: (year: string) => {},
});

export function useSetYear(): SetYear {
  const props: AppYearContextProps = React.useContext(AppYearContext);
  return props.setYear;
}
