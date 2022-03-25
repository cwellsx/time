import './history.sass';

import React from 'react';

import { aggregate } from './sums';

import type { Period } from "../model";
import type { HistoryState } from "../states";

type HistoryProps = {
  state: HistoryState;
};

export const History: React.FunctionComponent<HistoryProps> = (props: HistoryProps) => {
  const state = props.state;
  const periods: Period[] = state.periods;
  const rows = aggregate(periods);
  return (
    <table className="history">
      <tbody>
        {rows.map((show) => {
          return (
            <tr key={show.get_Key()} className={show.get_Class()}>
              <td>{show.get_Id()}</td>
              <td>{formatTime(show.get_Minutes())}</td>
              <td>{show.get_Text().join("\n")}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function formatTime(minutes: number) {
  // round to the nearest 5 minutes
  minutes = Math.round(minutes / 5) * 5;
  const hours = Math.floor(minutes / 60);
  const padded = String(minutes % 60).padStart(2, "0");
  return `${hours}:${padded}`;
}
