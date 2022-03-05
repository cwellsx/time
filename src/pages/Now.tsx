import './now.sass';

import React, { useState } from 'react';

import { EditorTags, OutputTags, TagCount } from '../tags';
import { showWhen } from './date';

import type { TimeStart } from "../model";
import type { NowState } from "../states";

type NowProps = {
  state: NowState;
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

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const [isTagsValid, setIsTagsValid] = useState<boolean>(false);

  const state = props.state;
  const { text, time, started } = new Displayed(state);

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

  const setOutputTags = (outputTags: OutputTags): void => {
    setIsTagsValid(outputTags.isValid);
    state.saveTags(outputTags.tags);
  };

  const getAllTags = (): Promise<TagCount[]> => {
    return state.getAllTags();
  };

  const timeText = !time ? undefined : (
    <React.Fragment>
      <div>
        <span>{text}:</span>
        <span>{time}</span>
      </div>
    </React.Fragment>
  );

  const openButton = started ? undefined : (
    <React.Fragment>
      <div>
        <span></span>
        <span>
          <button onClick={onStart}>Start</button>
        </span>
      </div>
    </React.Fragment>
  );

  const what = !started ? undefined : (
    <React.Fragment>
      <label>
        <span>Comment:</span>
        <div>
          <textarea className="comment" value={state.config.note} onChange={onComment} />
        </div>
      </label>
      <label>
        <span>Tags:</span>
        <EditorTags
          inputTags={state.config.tags || []}
          result={setOutputTags}
          getAllTags={getAllTags}
          minimum={true}
          maximum={true}
          canNewTag={false}
          showValidationError={true}
          hrefAllTags={"/tags"}
        />
      </label>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <div className="table">
        {timeText}
        {openButton}
        {what}
      </div>
    </React.Fragment>
  );
};
