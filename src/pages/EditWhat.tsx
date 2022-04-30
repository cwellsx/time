import React from 'react';

import { EditTags, OutputTags, ShowCount } from '../tags';
import { showDay } from './helpDate';

import type { What } from "../model";
import type { EditWhatState } from "../states";
// you could temporarily change this to enable logging, for debugging
const isLogging = false;

export type WhatIsValid = {
  what: What;
  isValid: boolean;
};

type ParentCallback = (whatIsValid: WhatIsValid) => void;

type EditWhatProps = {
  state: EditWhatState;
  what: What;
  showValidationError: boolean;
  parentCallback: ParentCallback;
};

export const EditWhat: React.FunctionComponent<EditWhatProps> = (props: EditWhatProps) => {
  const state = props.state;
  const what: What = { note: props.what.note, task: props.what.task, tags: props.what.tags };

  const outputTaskRef = React.useRef<OutputTags | undefined>(undefined);
  const outputTagsRef = React.useRef<OutputTags | undefined>(undefined);
  const noteRef = React.useRef<string | undefined>(what.note);

  if (isLogging) console.log(`EditWhat what=${JSON.stringify(what)}`);

  function callback(): void {
    const note: string | undefined = noteRef.current;
    const outputTask: OutputTags | undefined = outputTaskRef.current;
    const outputTags: OutputTags | undefined = outputTagsRef.current;
    const tags: string[] | undefined = outputTags && outputTags.tags.length ? outputTags.tags : undefined;
    const task: string | undefined = outputTask && outputTask.tags.length ? outputTask.tags[0] : undefined;
    const isTagsValid: boolean = (outputTags?.isValid ?? false) || !isEditTags;
    const isTaskValid: boolean = (outputTask?.isValid ?? false) || !isEditTask;
    const whatIsValid: WhatIsValid = {
      what: { note, tags, task },
      isValid: isTagsValid && isTaskValid,
    };
    if (isLogging) {
      console.log(`EditWhat callback note=${note}`);
      console.log(`EditWhat callback outputTags=${JSON.stringify(outputTags)}`);
      console.log(`EditWhat callback outputTask=${JSON.stringify(outputTask)}`);
      console.log(`EditWhat callback ${JSON.stringify(whatIsValid)}`);
    }
    props.parentCallback(whatIsValid);
  }

  function onComment(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    noteRef.current = event.target.value || undefined;
    callback();
  }
  const onOutputTags = (outputTags: OutputTags): void => {
    console.log(`onOutputTags ${JSON.stringify(outputTags)}`);
    outputTagsRef.current = outputTags;
    callback();
  };
  const onOutputTask = (outputTask: OutputTags): void => {
    console.log(`onOutputTask ${JSON.stringify(outputTask)}`);
    outputTaskRef.current = outputTask;
    callback();
  };

  const isTaskRequired = state.config.taskRequired === "required";
  const isTagsRequired = state.config.tagsRequired === "required";
  const allTasks = state.getAllTasks();
  const allTags = state.getAllTags();
  const isEditTask = isTaskRequired || allTasks.length !== 0;
  const isEditTags = isTagsRequired || allTags.length !== 0;

  const showTaskDate: ShowCount = (count) => showDay(new Date(count));

  const editTask = !isEditTask ? undefined : (
    <label>
      <span>Task:</span>
      <EditTags
        inputTags={what.task ? [what.task] : []}
        parentCallback={onOutputTask}
        allTags={allTasks}
        minimum={isTaskRequired}
        maximum={1}
        canNewTag={false}
        showValidationError={props.showValidationError}
        hrefAllTags={"/tags"}
        showCount={showTaskDate}
      />
    </label>
  );

  const editTags = !isEditTags ? undefined : (
    <label>
      <span>Tags:</span>
      <EditTags
        inputTags={what.tags ?? []}
        parentCallback={onOutputTags}
        allTags={allTags}
        minimum={isTagsRequired}
        maximum={undefined}
        canNewTag={false}
        showValidationError={props.showValidationError}
        hrefAllTags={"/tags"}
      />
    </label>
  );

  return (
    <React.Fragment>
      {editTask}
      {editTags}
      <label>
        <span>Comment:</span>
        <div>
          <textarea className="comment" defaultValue={what.note} onChange={onComment} />
        </div>
      </label>
    </React.Fragment>
  );
};
