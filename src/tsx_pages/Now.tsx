import React from 'react';

import { NowState, TimeStart } from '../ts_data';
import { showWhen } from '../ts_ui';

type NowProps = {
  state: NowState;
};

class Displayed {
  constructor(state: NowState) {
    const last = state.last;
    if (!last) {
      this.started = false;
      this.time = "";
    } else {
      this.started = last.type !== "stop";
      this.time = `${this.started ? "Started" : "Stopped"} ${showWhen(last.when)}`;
    }
  }
  readonly started: boolean;
  readonly time: string;
}

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const state = props.state;
  const { time, started } = new Displayed(state);

  function onStart(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const time: TimeStart = { when: Date.now(), type: "start" };
    state.saveTime(time);
  }

  function onComment(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    event.preventDefault();
    const comment = event.target.value;
    state.saveComment(comment);
  }

  return (
    <React.Fragment>
      {time ? <div className="time">{time}</div> : undefined}
      {!started ? <button onClick={onStart}>Start</button> : undefined}
      <label>
        Comment:
        <br />
        <textarea value={state.config?.note} onChange={onComment} />
      </label>
    </React.Fragment>
  );
};
