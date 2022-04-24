import './editwhen.sass';

import React from 'react';

import { ErrorMessage } from '../error';
import { Period } from '../model';
import { debugDateTime, makeDate, roundDate, showTime } from './helpDate';

const isLogging = false;

type Focus = "start" | "stop" | undefined;

export type WhenIsValid = {
  when: Period;
  isValid: boolean;
};

type ParentCallback = (whenIsValid: WhenIsValid) => void;

type EditWhenProps = {
  period: Period;
  min: number | undefined;
  max: number | undefined;
  parentCallback: ParentCallback;
};

/*
  - require a whole minute between boundaries so that a Period duration is at least one visible minute
    (though the calculated duration may be rounded down to zero)
  - calculations and validation uses Date
  - only the UI uses showTime
*/

export const EditWhen: React.FunctionComponent<EditWhenProps> = (props: EditWhenProps) => {
  const { period, min, max, parentCallback } = props;

  const startDate = new Date(period.start);
  const stopDate = new Date(period.stop);
  const startTimeOriginal = showTime(startDate);
  const stopTimeOriginal = showTime(stopDate);
  const startMinDate = min ? roundDate(min, 2) : undefined;
  const stopMaxDate = max ? roundDate(max, -2) : undefined;
  const spansMidnite = stopDate.toDateString() !== startDate.toDateString();
  const startMinTime = startMinDate ? showTime(startMinDate) : undefined;
  const stopMaxTime = stopMaxDate ? showTime(stopMaxDate) : undefined;

  const fixed: Fixed = {
    startDate,
    spansMidnite,
    startMinDate,
    stopMaxDate,
    startMinTime,
    stopMaxTime,
  };

  const [startTime, setStartTime] = React.useState(startTimeOriginal);
  const [stopTime, setStopTime] = React.useState(stopTimeOriginal);

  const [startError, setStartError] = React.useState<string | undefined>(undefined);
  const [stopError, setStopError] = React.useState<string | undefined>(undefined);
  const [focus, setFocus] = React.useState<Focus>(undefined);

  const onFocus = (focussed: "start" | "stop", isFocus: boolean): void => {
    const newFocus: Focus = isFocus ? focussed : focus === focussed ? undefined : focus;
    setFocus(newFocus);
    const { startError, stopError } = getMinMax(fixed, startTime, stopTime, newFocus);
    setStartError(startError);
    setStopError(stopError);
  };

  const onChange = (newStart: string, newStop: string): void => {
    const { startError, stopError, start, stop } = getMinMax(fixed, newStart, newStop, focus);
    setStartError(startError);
    setStopError(stopError);
    const isValid = !startError && !stopError;
    parentCallback({ when: { start: start.getTime(), stop: stop.getTime() }, isValid });
  };

  const onChangeStart = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const start = event.target.value;
    setStartTime(start);
    onChange(start, stopTime);
  };
  const onChangeStop = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const stop = event.target.value;
    setStopTime(stop);
    onChange(startTime, stop);
  };

  const { stopMinTime, startMaxTime } = getMinMax(fixed, startTime, stopTime, focus);

  return (
    <>
      <label>
        <span>Start:</span>
        <span>
          <input
            type="time"
            className={startError ? "invalid" : "valid"}
            defaultValue={startTimeOriginal}
            min={startMinTime}
            max={stopMinTime}
            onChange={onChangeStart}
            onFocus={(_event) => onFocus("start", true)}
            onBlur={(_event) => onFocus("start", false)}
          />
          <span className="validity"></span>
          <ErrorMessage errorMessage={startError} />
        </span>
      </label>
      <label>
        <span>Stop:</span>
        <span>
          <input
            type="time"
            className={stopError ? "invalid" : "valid"}
            defaultValue={stopTimeOriginal}
            min={startMaxTime}
            max={stopMaxTime}
            onChange={onChangeStop}
            onFocus={(_event) => onFocus("stop", true)}
            onBlur={(_event) => onFocus("stop", false)}
          />
          <span className="validity"></span>
          <ErrorMessage errorMessage={stopError} />
        </span>
      </label>
    </>
  );
};

type Fixed = {
  startDate: Date;
  spansMidnite: boolean;
  startMinDate: Date | undefined;
  stopMaxDate: Date | undefined;
  startMinTime: string | undefined;
  stopMaxTime: string | undefined;
};

function getMinMax(
  fixed: Fixed,
  startTime: string,
  stopTime: string,
  focus: Focus
): {
  startMaxTime: string;
  stopMinTime: string;

  startError: string | undefined;
  stopError: string | undefined;

  start: Date;
  stop: Date;
} {
  const { startDate, spansMidnite, startMinDate, stopMaxDate, startMinTime, stopMaxTime } = fixed;
  const start = makeDate(startDate, startTime, false);
  const stop = makeDate(startDate, stopTime, spansMidnite && stopTime < startTime);

  const stopMinDate = roundDate(start, 1);
  const startMaxDate = roundDate(stop, -1);
  const stopMinTime = showTime(stopMinDate);
  const startMaxTime = showTime(startMaxDate);

  function conflict(): [boolean, boolean] {
    if (stop > stopMinDate && startMaxDate > start) return [false, false]; // none
    if (stopMaxDate && start >= stopMaxDate) return [true, false]; // start
    if (startMinDate && stop <= startMinDate) return [false, true]; // stop
    if (focus) return focus === "start" ? [true, false] : [false, true]; // start or stop
    return [true, true]; // both
  }

  const startMinError = startMinDate && start < startMinDate;
  const [startMaxError, stopMinError] = conflict();
  const stopMaxError = stopMaxDate && stop > stopMaxDate;

  const startError = startMinError ? `min ${startMinTime}` : startMaxError ? `max ${startMaxTime}` : undefined;
  const stopError = stopMinError ? `min ${stopMinTime}` : stopMaxError ? `max ${stopMaxTime}` : undefined;

  if (isLogging) {
    console.log(`start ${debugDateTime(startMinDate)} ${debugDateTime(start)} ${debugDateTime(startMaxDate)}`);
    console.log(`stop ${debugDateTime(stopMinDate)} ${debugDateTime(stop)} ${debugDateTime(stopMaxDate)}`);
    console.log(`validate ${startMinError} ${startMaxError} ${stopMinError} ${stopMaxError}`);
  }

  return { startMaxTime, stopMinTime, startError, stopError, start, stop };
}
