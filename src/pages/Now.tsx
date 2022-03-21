import React from "react";

import { EditorTags, OutputTags } from "../tags";
import { showWhen } from "./date";

import type { TimeStart, TimeStop } from "../model";
import type { NowState } from "../states";

type NowProps = {
  state: NowState;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const [isTagsValid, setIsTagsValid] = React.useState<boolean>(true);
  const [isTaskValid, setIsTaskValid] = React.useState<boolean>(true);
  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);

  const state = props.state;
  const config = state.config;

  const { text, time, started } = new Displayed(state);

  /*
    on start, stop, and cancel
  */

  function onStart(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const time: TimeStart = { when: Date.now(), type: "start" };
    state.saveTime(time);
  }

  function onStop(event: React.MouseEvent<HTMLButtonElement>, type: "stop" | "next"): void {
    event.preventDefault();
    if (!isTagsValid || !isTaskValid) {
      setShowValidationError(true);
      return;
    }
    const time: TimeStop = { when: Date.now(), type, note: config.note, task: config.task, tags: config.tags };
    state.saveTime(time);
  }

  function onCancel(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    state.cancelLast();
  }

  /*
    on note, tags, and task
  */

  function onComment(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    event.preventDefault();
    const comment = event.target.value || undefined;
    state.saveComment(comment);
  }

  const setOutputTags = (outputTags: OutputTags): void => {
    setIsTagsValid(outputTags.isValid);
    const tags = outputTags.tags.length ? outputTags.tags : undefined;
    state.saveTags(tags);
  };

  const setOutputTask = (outputTask: OutputTags): void => {
    setIsTaskValid(outputTask.isValid);
    const task = outputTask.tags.length ? outputTask.tags[0] : undefined;
    state.saveTask(task);
  };

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
        <button onClick={(event) => onCancel(event)} className="right">
          Cancel
        </button>
      </span>
    </div>
  );

  const isTaskRequired = config.taskRequired === "required";
  const isTagsRequired = config.tagsRequired === "required";
  const allTasks = state.getAllTasks();
  const allTags = state.getAllTags();

  const editTask =
    !isTaskRequired && !allTasks.length ? undefined : (
      <label>
        <span>Task:</span>
        <EditorTags
          inputTags={config.task ? [config.task] : []}
          result={setOutputTask}
          allTags={allTasks}
          minimum={isTaskRequired}
          maximum={1}
          canNewTag={false}
          showValidationError={showValidationError}
          hrefAllTags={"/tags"}
        />
      </label>
    );

  const editTags =
    !isTagsRequired && !allTags.length ? undefined : (
      <label>
        <span>Tags:</span>
        <EditorTags
          inputTags={config.tags || []}
          result={setOutputTags}
          allTags={allTags}
          minimum={isTagsRequired}
          maximum={undefined}
          canNewTag={false}
          showValidationError={showValidationError}
          hrefAllTags={"/tags"}
        />
      </label>
    );

  const what = !started ? undefined : (
    <React.Fragment>
      {editTask}
      {editTags}
      <label>
        <span>Comment:</span>
        <div>
          <textarea className="comment" value={config.note} onChange={onComment} />
        </div>
      </label>
    </React.Fragment>
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
