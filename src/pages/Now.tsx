import React, { useState } from 'react';

import { EditorTags, OutputTags, TagCount } from '../tags';
import { showWhen } from './date';

import type { TimeStart, TimeStop } from "../model";
import type { NowState } from "../states";

type NowProps = {
  state: NowState;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const [isTagsValid, setIsTagsValid] = useState<boolean>(false);
  const [isTaskValid, setIsTaskValid] = useState<boolean>(false);

  const state = props.state;
  const config = state.config;

  const { text, time, started } = new Displayed(state);

  function onStart(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const time: TimeStart = { when: Date.now(), type: "start" };
    state.saveTime(time);
  }

  function onStop(event: React.MouseEvent<HTMLButtonElement>, type: "stop" | "next"): void {
    event.preventDefault();
    const time: TimeStop = { when: Date.now(), type, note: config.note, task: config.task, tags: config.tags };
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

  const setOutputTask = (outputTask: OutputTags): void => {
    setIsTagsValid(outputTask.isValid);
    const task: string = outputTask.tags ? outputTask.tags[0] : "";
    state.saveTask(task);
  };

  const getAllTasks = (): Promise<TagCount[]> => {
    return state.getAllTasks();
  };

  const timeText = !time ? undefined : (
    <React.Fragment>
      <div>
        <span>{text}:</span>
        <span>{time}</span>
      </div>
    </React.Fragment>
  );

  const startButton = started ? undefined : (
    <React.Fragment>
      <div>
        <span></span>
        <span>
          <button onClick={onStart}>Start</button>
        </span>
      </div>
    </React.Fragment>
  );

  const stopButton = !started ? undefined : (
    <React.Fragment>
      <div>
        <span></span>
        <span>
          <button onClick={(event) => onStop(event, "next")}>Next</button>
          <button onClick={(event) => onStop(event, "stop")}>Stop</button>
        </span>
      </div>
    </React.Fragment>
  );

  const what = !started ? undefined : (
    <React.Fragment>
      <label>
        <span>Task:</span>
        <EditorTags
          inputTags={config.task ? [config.task] : []}
          result={setOutputTask}
          getAllTags={getAllTasks}
          minimum={true}
          maximum={true}
          canNewTag={false}
          showValidationError={true}
          hrefAllTags={"/tags"}
        />
      </label>
      <label>
        <span>Tags:</span>
        <EditorTags
          inputTags={config.tags || []}
          result={setOutputTags}
          getAllTags={getAllTags}
          minimum={true}
          maximum={true}
          canNewTag={false}
          showValidationError={true}
          hrefAllTags={"/tags"}
        />
      </label>
      <label>
        <span>Comment:</span>
        <div>
          <textarea className="comment" value={config.note} onChange={onComment} />
        </div>
      </label>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <div className="table">
        {timeText}
        {startButton}
        {what}
        {stopButton}
      </div>
    </React.Fragment>
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
