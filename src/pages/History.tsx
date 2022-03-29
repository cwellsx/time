import './history.sass';

import React from 'react';

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

  const [editingTime, setEditingTime] = React.useState<number | undefined>(undefined);
  const [editingText, setEditingText] = React.useState<string | undefined>(undefined);

  const onClick: React.MouseEventHandler<HTMLTableElement> = (event: React.MouseEvent<HTMLTableElement>) => {
    if (!state.config.historyEditable) return;
    const target = event.target;
    const el = target as HTMLElement;
    if (el.tagName !== "TD" || el.className !== "editable") return;
    const row = el.parentElement;
    const time = row?.getAttribute("data-time");
    if (!time) return;
    const text = el.textContent ?? undefined;
    setEditingTime(+time);
    setEditingText(text);
  };

  function onEdit(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    const text = event.target.value || undefined;
    setEditingText(text);
  }

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!editingTime) return;
    const what: What = { note: editingText };
    state.editHistory(editingTime, what);
    setEditingTime(undefined);
  }

  function getText(what: What | undefined) {
    if (!what) return undefined;
    const result: string[] = [];
    if (what.note) result.push(what.note);
    if (what.tags && what.tags.length) result.push(`[${what.tags.join()}]`);
    let html = undefined;
    if (what.task) {
      const description = state.getTaskDescription(what.task);
      //const text = description?``
      result.push(`# `);
      html = description ? (
        <abbr title={description}>{what.task}</abbr>
      ) : (
        <span className="missingTask">{what.task}</span>
      );
    }
    const text = result.join("\n");
    return (
      <>
        {text}
        {html}
      </>
    );
  }

  return (
    <table className="history" onClick={onClick}>
      <tbody>
        {rows.map((show) => {
          const editable = state.config.historyEditable && show.getClass() === "span";
          const text = getText(show.getWhat());
          const time = show.getStop();
          const editing = editable && time && time === editingTime;
          const saveButton = editing && editingText !== text ? <button onClick={onSave}>Save</button> : undefined;
          const rows = editingText?.split("\n").length;
          const showText = !editing ? (
            text
          ) : (
            <>
              <textarea value={editingText} onChange={onEdit} rows={rows} />
              {saveButton}
            </>
          );
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
