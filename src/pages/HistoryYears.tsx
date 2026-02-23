import React from "react";
import * as ReactRouter from "react-router-dom";
import { useParams } from "react-router-dom";
import { HistoryState } from "../states";
import { useSetYear } from "../topbar";

type HistoryYearsProps = {
  state: HistoryState;
};

export const HistoryYears: React.FunctionComponent<HistoryYearsProps> = (props: HistoryYearsProps) => {
  const { year: selectedYear } = useParams();
  const setYear = useSetYear();
  const { state } = props;
  const periods = state.periods;
  const years: string[] = [];
  let currentYear: number | undefined = undefined;
  for (const period of periods) {
    // only consider the start date and ignore the scenario where start and end are different years
    const year = period.startYear;
    if (year !== currentYear) {
      currentYear = year;
      years.push("" + year);
    }
  }
  const links = years.map((year) => {
    const [className, to, configuredYear] = year === selectedYear ? ["year selected", ".", ""] : ["year", year, year];
    return (
      <ReactRouter.NavLink
        to={to}
        title={year}
        key={year}
        className={className}
        onClick={() => {
          state.setYear(configuredYear);
          setYear(configuredYear);
        }}
      >
        {year}
      </ReactRouter.NavLink>
    );
  });

  // convert array of elements to array of elements or whitespace
  // and ensure that even whitespace has a key by wrapping it in a Fragment
  const elements = links.flatMap((link, i) =>
    i === links.length - 1 ? [link] : [link, <React.Fragment key={`sep-${i}`}> </React.Fragment>],
  );

  return <>{elements}</>;
};
