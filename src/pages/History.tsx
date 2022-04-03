import './history.sass';

import React from 'react';

import { EditWhat, WhatIsValid } from './EditWhat';
import { aggregate } from './sums';

import type { Period, What } from "../model";
import type { HistoryState } from "../states";

type HistoryProps = {
  state: HistoryState;
};

export const History: React.FunctionComponent<HistoryProps> = (props: HistoryProps) => {
  const state = props.state;
  const periods: Period[] = state.periods;
  const rows = aggregate(periods);

  const [editingPeriod, setEditingPeriod] = React.useState<Period | undefined>(undefined);
  // unlike Now.tsx this is useState instead of userRef because on edit callback we want to re-render the Save button
  const [whatIsValid, setWhatIsValid] = React.useState<WhatIsValid>({ what: {}, isValid: false });
  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);

  const onClick: React.MouseEventHandler<HTMLTableElement> = (event: React.MouseEvent<HTMLTableElement>) => {
    if (!state.config.historyEditable) return;
    const target = event.target;
    const el = target as HTMLElement;
    if (el.tagName !== "TD" || el.className !== "editable") return;
    const row = el.parentElement;
    const timeString = row?.getAttribute("data-time");
    if (!timeString) return;
    const time = +timeString;
    const period: Period | undefined = rows
      .map<Period | undefined>((it) => it.getPeriod())
      .find((it) => it && it.stop === time);
    setEditingPeriod(period);
    setWhatIsValid({ what: period!, isValid: true });
    setShowValidationError(false);
  };

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!editingPeriod) return;
    if (!whatIsValid.isValid) {
      setShowValidationError(true);
      return;
    }
    const what: What = whatIsValid.what;
    state.editHistory(editingPeriod.stop, what);
    setEditingPeriod(undefined);
  }

  function getText(what: What | undefined): JSX.Element | undefined {
    if (!what) return undefined;
    let task: JSX.Element | undefined;
    if (what.task) {
      const description = state.getTaskDescription(what.task);
      task = description ? (
        <>
          # <abbr title={description}>{what.task}</abbr>
        </>
      ) : (
        <>
          # <span className="missingTask">{what.task}</span>
        </>
      );
    } else task = undefined;
    const tags = what.tags && what.tags.length ? `[${what.tags.join()}]` : undefined;
    const note = what.note;
    const space1 = task && (tags || note) ? " " : undefined;
    const space2 = tags && note ? " " : undefined;
    return (
      <>
        {task}
        {space1}
        {tags}
        {space2}
        {note}
      </>
    );
  }

  function getEdit(period: Period): JSX.Element {
    const saveButton = whatsEqual(editingPeriod!, whatIsValid.what) ? undefined : (
      <button onClick={onSave}>Save</button>
    );
    return (
      <>
        <div className="table">
          <EditWhat
            state={state}
            showValidationError={showValidationError}
            what={period}
            parentCallback={setWhatIsValid}
          />
        </div>
        {saveButton}
      </>
    );
  }

  return (
    <table className="history" onClick={onClick}>
      <tbody>
        {rows.map((show) => {
          const period: Period | undefined = show.getPeriod();
          const editing: boolean = !!editingPeriod && period?.stop === editingPeriod.stop;
          const showText = !editing ? getText(period) : getEdit(period!);
          const time = period?.stop;
          const editable = state.config.historyEditable && show.getClass() === "span";
          const className = editable && !editing ? "editable" : undefined;
          return (
            <tr key={show.getKey()} className={show.getClass()} data-time={time}>
              <td>{show.getId()}</td>
              <td>{formatTime(show.getMinutes())}</td>
              <td className={className}>{showText}</td>
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

function whatsEqual(x: What, y: What): boolean {
  const tagsEquals = !x.tags
    ? !y.tags
    : x.tags.length === y.tags?.length && x.tags.every((it, index) => (it = y.tags![index]));
  return x.note === y.note && x.task === y.task && tagsEquals;
}
