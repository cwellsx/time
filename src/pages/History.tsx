import React from "react";

import { aggregate } from "./sums";

import type { Period } from "../model";
import type { HistoryState } from "../states";

type HistoryProps = {
  state: HistoryState;
};

export const History: React.FunctionComponent<HistoryProps> = (props: HistoryProps) => {
  const state = props.state;
  const periods: Period[] = state.periods;
  const weeks = aggregate(periods);
  return <p>TBS</p>;
};
