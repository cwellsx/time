import React from 'react';

import { EditorTags, OutputTags } from '../tags';
import { showWhen } from './date';

import type { TimeStart, TimeStop } from "../model";
import type { NowState } from "../states";

type NowProps = {
  state: NowState;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  const state = props.state;
  const config = state.config;

  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);
  const [outputTask, setOutputTask] = React.useState<OutputTags | undefined>(undefined);
  const [outputTags, setOutputTags] = React.useState<OutputTags | undefined>(undefined);
  const [note, setNote] = React.useState<string | undefined>(config.note);

  const { text, time, started } = new Displayed(state);

  /*
    on start, stop, and cancel
  */

  function onStart(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const time: TimeStart = { when: Date.now(), type: "start" };
    state.saveTime(time);
  }

  const getTags = (): string[] | undefined => (outputTags && outputTags.tags.length ? outputTags.tags : undefined);
  const getTask = (): string | undefined => (outputTask && outputTask.tags.length ? outputTask.tags[0] : undefined);

  function onStop(event: React.MouseEvent<HTMLButtonElement>, type: "stop" | "next"): void {
    event.preventDefault();
    const isInvalid = (output: OutputTags | undefined) => output && !output.isValid;
    if (isInvalid(outputTask) || isInvalid(outputTags)) {
      setShowValidationError(true);
      return;
    }
    const time: TimeStop = { when: Date.now(), type, note, task: getTask(), tags: getTags() };
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
    // event.preventDefault();
    const comment = event.target.value || undefined;
    setNote(comment);
    state.saveComment(comment);
  }

  const onOutputTags = (outputTags: OutputTags): void => {
    setOutputTags(outputTags);
    state.saveTags(getTags());
  };

  const onOutputTask = (outputTask: OutputTags): void => {
    setOutputTask(outputTask);
    state.saveTask(getTask());
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
        <button onClick={onCancel} className="right">
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
          parentCallback={onOutputTask}
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
          inputTags={config.tags ?? []}
          parentCallback={onOutputTags}
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
          <textarea className="comment" value={note} onChange={onComment} />
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
