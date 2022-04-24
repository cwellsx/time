import React from 'react';

import { showWhen } from './date';
import { EditWhat, WhatIsValid } from './EditWhat';

import type { TimeStart, TimeStop } from "../model";
import type { NowState } from "../states";

type NowProps = {
  state: NowState;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const state = props.state;
  const config = state.config;

  // set isValid: true as default initial state because onWhatIsValid is called only if EditWhat displays tags or tasks
  const whatIsValidRef = React.useRef<WhatIsValid>({ what: {}, isValid: true });
  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);

  const { text, time, started } = new Displayed(state);

  function onStart(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const time: TimeStart = { when: Date.now(), type: "start" };
    state.saveTime(time);
  }

  function onStop(event: React.MouseEvent<HTMLButtonElement>, type: "stop" | "next"): void {
    event.preventDefault();
    const whatIsValid = whatIsValidRef.current;
    if (!whatIsValid.isValid) {
      setShowValidationError(true);
      return;
    }
    const { note, task, tags } = whatIsValid.what;
    const time: TimeStop = { when: Date.now(), type, note, task, tags };
    state.saveTime(time);
  }

  function onCancel(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    state.cancelLast();
  }

  function onWhatIsValid(whatIsValid: WhatIsValid): void {
    whatIsValidRef.current = whatIsValid;
    state.saveWhat(whatIsValid.what);
  }

  const timeText = !time ? undefined : (
    <div>
      <span>{text}:</span>
      <span>{time}</span>
    </div>
  );

  const startButton = started ? undefined : (
    <div>
      <span></span>
      <span>
        <button onClick={onStart}>Start</button>
      </span>
    </div>
  );

  const stopButton = !started ? undefined : (
    <div>
      <span></span>
      <span>
        <button onClick={(event) => onStop(event, "next")}>Next</button>
        <button onClick={(event) => onStop(event, "stop")}>Stop</button>
        <button onClick={onCancel} className="right">
          Cancel
        </button>
      </span>
    </div>
  );

  const what = !started ? undefined : (
    <EditWhat state={state} showValidationError={showValidationError} what={config} parentCallback={onWhatIsValid} />
  );

  return (
    <div className="table">
      {timeText}
      {startButton}
      {what}
      {stopButton}
    </div>
  );
};

class Displayed {
  constructor(state: NowState) {
    const last = state.last;
    if (!last) {
      this.started = false;
      this.time = "";
      this.text = "";
    } else {
      this.started = last.type !== "stop";
      this.text = this.started ? "Started" : "Stopped";
      this.time = showWhen(last.when);
    }
  }
  readonly started: boolean;
  readonly text: string;
  readonly time: string;
}
