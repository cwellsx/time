import './history.sass';

import React from 'react';

import { useSetError } from '../error';
import { EditWhat, WhatIsValid } from './EditWhat';
import { EditWhen, WhenIsValid } from './EditWhen';
import { helpEditWhen } from './helpEditWhen';
import { aggregate } from './helpSums';

import type { Period, Time, What } from "../model";
import type { HistoryState } from "../states";
type HistoryProps = {
  state: HistoryState;
  task: string | undefined;
  tag: string | undefined;
};

type PeriodFilter = (it: Period) => boolean;

type TimeOrText = "text" | "time";

export const History: React.FunctionComponent<HistoryProps> = (props: HistoryProps) => {
  const state = props.state;
  const task = props.task;
  const tag = props.tag;
  const periods: Period[] = state.periods;
  const setError = useSetError();

  const filter: PeriodFilter | undefined = task
    ? (it: Period) => !!it.task && it.task === task
    : tag
    ? (it: Period) => !!it.tags && it.tags.some((it2) => it2 === tag)
    : undefined;
  const filtered = filter ? periods.filter(filter) : periods;

  const rows = aggregate(filtered);

  const [editingRow, setEditingRow] = React.useState<[TimeOrText, Period] | undefined>(undefined);
  // unlike Now.tsx this is useState instead of userRef because on edit callback we want to re-render the Save button
  const [whatIsValid, setWhatIsValid] = React.useState<WhatIsValid>({ what: {}, isValid: false });
  const [whenIsValid, setWhenIsValid] = React.useState<WhenIsValid>({ when: { start: 0, stop: 0 }, isValid: false });
  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);

  const editingPeriod: Period | undefined = editingRow ? editingRow[1] : undefined;

  const onClick: React.MouseEventHandler<HTMLTableElement> = (event: React.MouseEvent<HTMLTableElement>) => {
    if (!state.config.historyEditable) return;
    const target = event.target;
    const el = target as HTMLElement;
    if (el.tagName !== "TD") return;
    const row = el.parentElement;
    if (!row) return;
    if (!row.className?.includes("editable")) return;
    const timeString = row?.getAttribute("data-time");
    if (!timeString) return;
    const time = +timeString;
    const period: Period | undefined = rows
      .map<Period | undefined>((it) => it.getPeriod())
      .find((it) => it && it.stop === time);

    function getIndex(child: HTMLElement): number {
      let index = 0;
      for (
        let previous: Element | null = child.previousElementSibling;
        !!previous;
        previous = previous.previousElementSibling
      )
        ++index;
      return index;
    }

    let index = getIndex(el);
    const timeOrText: TimeOrText = index === row.childElementCount - 1 ? "text" : "time";
    setEditingRow([timeOrText, period!]);
    setWhatIsValid({ what: period!, isValid: true });
    setWhenIsValid({ when: period!, isValid: true });
    setShowValidationError(false);
  };

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

  function getEditTime(period: Period): JSX.Element {
    const findTime = (when: number): Time | undefined => state.findTime(when);
    const { min, max, isModified, getDifferences } = helpEditWhen(period, whenIsValid.when, periods, findTime);

    function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
      try {
        const { deleted, inserted } = getDifferences();
        state.editWhen(deleted, inserted);
      } catch (error) {
        setError(error);
      }
    }

    const saveButton = !whenIsValid.isValid || !isModified ? undefined : <button onClick={onSave}>Save</button>;
    return (
      <>
        <div className="table close">
          <EditWhen period={period} min={min} max={max} parentCallback={setWhenIsValid} />
        </div>
        {saveButton}
      </>
    );
  }

  function getEditText(period: Period): JSX.Element {
    function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
      if (!editingPeriod) return;
      if (!whatIsValid.isValid) {
        setShowValidationError(true);
        return;
      }
      const what: What = whatIsValid.what;
      state.editWhat(editingPeriod.stop, what);
      setEditingRow(undefined);
    }

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
          const timeOrText: TimeOrText | undefined = editingRow && editing ? editingRow[0] : undefined;
          const cells = !timeOrText ? (
            <>
              <td>{show.getId()}</td>
              <td className="time">{formatTime(show.getMinutes())}</td>
              <td>{getText(period)}</td>
            </>
          ) : timeOrText === "text" ? (
            <>
              <td>{show.getId()}</td>
              <td className="time">{formatTime(show.getMinutes())}</td>
              <td>{getEditText(period!)}</td>
            </>
          ) : (
            <>
              <td colSpan={2}>{getEditTime(period!)}</td>
              <td>{getText(period)}</td>
            </>
          );
          //const showText = !editing ? getText(period) : getEdit(period!);
          const time = period?.stop;
          const editable = state.config.historyEditable && show.getClass() === "span";
          const className = !editable ? show.getClass() : show.getClass() + " editable";
          return (
            <tr key={show.getKey()} className={className} data-time={time}>
              {cells}
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
