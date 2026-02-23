import "./history.sass";

import React from "react";
import { useParams } from "react-router-dom";
import { useSetError } from "../error";
import type { Period, PeriodEx, Time, What } from "../model";
import type { HistoryState } from "../states";
import { EditHistoryWhat } from "./EditHistoryWhat";
import { EditHistoryWhen } from "./EditHistoryWhen";
import { getDifferences, getMinMax, getPeriodsEquals } from "./helpEditWhen";
import { aggregate } from "./helpHistory";
import { AllTotals, getAllTotals, Total } from "./helpTotals";

type HistoryProps = {
  state: HistoryState;
  task: string | undefined;
  tag: string | undefined;
};

type PeriodFilter = (it: Period) => boolean;

type TimeOrText = "text" | "time";

export const History: React.FunctionComponent<HistoryProps> = (props: HistoryProps) => {
  const { year } = useParams();
  const numericYear = year ? +year : undefined;

  const { state, task, tag } = props;
  const periods: PeriodEx[] = state.periods;
  const setError = useSetError();

  const filter: PeriodFilter | undefined = task
    ? (it: Period) => !!it.task && it.task === task
    : tag
      ? (it: Period) => !!it.tags && it.tags.some((it2) => it2 === tag)
      : undefined;
  let filtered = filter ? periods.filter(filter) : periods;

  if (numericYear) filtered = filtered.filter((period) => period.startYear === numericYear);

  const rows = aggregate(filtered);

  const allTotals = filter ? getAllTotals(filtered, props) : undefined;

  const [editingRow, setEditingRow] = React.useState<[TimeOrText, Period] | undefined>(undefined);

  const editingPeriod: Period | undefined = editingRow ? editingRow[1] : undefined;

  function useOutsideAlerter(ref: React.RefObject<HTMLTableElement>) {
    React.useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event?.target)) {
          setEditingRow(undefined);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const onTableClick: React.MouseEventHandler<HTMLTableElement> = (event: React.MouseEvent<HTMLTableElement>) => {
    function getClicked(el: HTMLElement): { time: number; timeOrText: TimeOrText } | undefined {
      const row = el.parentElement;
      if (!row) return;
      if (!row.className?.includes("editable")) return;
      const timeString = row?.getAttribute("data-time");
      if (!timeString) return;
      const time = +timeString;
      let index = getIndex(el);
      const timeOrText: TimeOrText = index === row.childElementCount - 1 ? "text" : "time";
      return { time, timeOrText };
    }

    if (!state.config.historyEditable) return;
    const target = event.target;
    const el = target as HTMLElement;
    if (el.tagName !== "TD") {
      // this isn't a new click but it may be a click inside the input or textArea
      return;
    }

    const clicked = getClicked(el);
    if (!clicked) {
      setEditingRow(undefined);
      return;
    }
    const { time, timeOrText } = clicked;

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

    setEditingRow([timeOrText, period!]);
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
    const minMax = getMinMax(period, periods);

    function onSave(altered: Period): void {
      try {
        const equals = getPeriodsEquals(period, altered);
        const findTime = (when: number): Time | undefined => state.findTime(when);
        const { deleted, inserted } = getDifferences(period, altered, minMax, equals, findTime);
        state.editWhen(deleted, inserted);
        setEditingRow(undefined);
      } catch (error) {
        setError(error);
      }
    }

    return <EditHistoryWhen period={period} min={minMax.min} max={minMax.max} onSave={onSave} />;
  }

  const tableRef = React.createRef<HTMLTableElement>();
  useOutsideAlerter(tableRef);

  return (
    <>
      {allTotals ? showAllTotals(allTotals, props) : undefined}
      <table className="history" onClick={onTableClick} ref={tableRef}>
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
                <td>
                  <EditHistoryWhat
                    state={state}
                    what={period!}
                    onSave={(what) => {
                      if (!editingPeriod) return;
                      state.editWhat(editingPeriod.stop, what);
                      setEditingRow(undefined);
                    }}
                  />
                </td>
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
    </>
  );
};

function formatTime(minutes: number) {
  // round to the nearest 5 minutes
  minutes = Math.round(minutes / 5) * 5;
  const hours = Math.floor(minutes / 60);
  const padded = String(minutes % 60).padStart(2, "0");
  return `${hours}:${padded}`;
}

function showAllTotals(allTotals: AllTotals, props: HistoryProps): JSX.Element {
  function getTaskText(task: string) {
    const text = props.state.getTaskDescription(task);
    return `[${task}]` + (text ? `: ${text}` : "");
  }
  function getTagText(tag: string) {
    const text = props.state.getTaskDescription(tag);
    return `[${tag}]` + (text ? `: ${text}` : "");
  }
  function showTotals(text: string, totals: Total[]): JSX.Element {
    return (
      <>
        <tr>
          <th colSpan={2}>{text}</th>
        </tr>
        {totals.map((it) => {
          return (
            <tr>
              <td>{it.text}</td>
              <td>{formatTime(it.minutes)}</td>
            </tr>
          );
        })}
      </>
    );
  }
  const title = props.task ? getTaskText(props.task) : getTagText(props.tag!);
  return (
    <fieldset>
      <legend>Totals</legend>
      <table className="totals">
        <tbody>{showTotals(title, allTotals.totals)}</tbody>
      </table>
    </fieldset>
  );
}
