import './what.sass';

import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { ErrorMessage } from '../error';
import { Tabs } from '../tabs';

import type { WhatState } from "../states";
import type { TabAction } from "../tabs";
import type { WhatType, TagInfo } from "../model";

type WhatProps = {
  state: WhatState;
};

export const What: React.FunctionComponent<WhatProps> = (props: WhatProps) => {
  const [key, setKey] = React.useState("");
  const [description, setDescription] = React.useState("");

  const state = props.state;

  const [whatType, setWhatType] = React.useState<WhatType>(state.config.whatType ?? "tags");
  const [validationErrorMessage, setValidationErrorMessage] = React.useState<string | undefined>(undefined);

  const changeWhatType = (w: WhatType) => {
    setWhatType(w);
    state.saveWhatType(w);
  };

  const tabActions: TabAction[] = [
    { text: "Tags", action: () => changeWhatType("tags") },
    { text: "Tasks", action: () => changeWhatType("tasks") },
  ];

  const [selectedTab, text] = ((whatType: WhatType) => {
    switch (whatType) {
      case undefined:
      case "tags":
        return [0, "Tag"];
      case "tasks":
        return [1, "Task"];
    }
  })(whatType);

  function setAndValidateKey(key: string) {
    key = key.trim();

    let message: string | undefined;
    const what = whatType === "tasks" ? "Task" : "Tag";
    if (!key) {
      message = undefined;
    } else if (key.indexOf(" ") != -1) {
      message = `${what} ID cannot contain whitespace ' ' (use a hyphen '-' instead).`;
    } else if (state.keyAlreadyExists(whatType, key)) {
      message = `Duplicate (this ${what} ID is already defined).`;
    } else {
      message = undefined;
    }

    setValidationErrorMessage(message);
    setKey(key);
  }

  function onNewKey(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const key = event.target.value;
    setAndValidateKey(key);
  }

  const workItemTypes = [
    ["Task", "task"],
    ["Bug", "bug"],
    ["PR", "pr"],
    ["Pull Request", "pr"],
    ["Requirement", "req"],
  ];

  function extractKey(description: string): [string, string] | undefined {
    for (const [text, prefix] of workItemTypes) {
      // "Task 42: This is a string to be tested"
      const regexp = new RegExp(`^${text}\\s*\\d+[:]?\\s*`, "i");
      const match = description.match(regexp);
      if (!match) continue;
      const length = match[0].length;
      const first = description.substring(0, length);
      const id = first.match(/\d+/);
      if (!id) throw new Error("unexpected");
      return [`${prefix}-${id[0]}`, description.substring(length)];
    }
    return undefined;
  }

  function onNewDescription(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const description = event.target.value;
    if (whatType === "tasks") {
      const split = extractKey(description);
      if (split) {
        setAndValidateKey(split[0]);
        setDescription(split[1]);
        return;
      }
    }
    setDescription(description);
  }

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const tag: TagInfo = { key: key, summary: description };
    state.createWhat(whatType, tag);
    setAndValidateKey("");
    setDescription("");
  }

  const newKey = <input onChange={onNewKey} value={key} />;
  const newDescription = <input onChange={onNewDescription} value={description} />;
  const newButton = <button onClick={onSave}>Save</button>;

  const all = state.getAllWhat(whatType);
  all.sort((x, y) => x.key.localeCompare(y.key));
  const showAll = !all.length ? undefined : (
    <React.Fragment>
      <h2>Current {text}s</h2>
      <table className="whats">
        <tbody>
          {all.map((tagInfo) => {
            const referenced = state.keyIsReferenced(whatType, tagInfo.key);
            const urlKey = whatType === "tags" ? "tag" : "task";
            const url = `/history?${urlKey}=${tagInfo.key}`;
            const key = !referenced ? tagInfo.key : <ReactRouter.NavLink to={url}>{tagInfo.key}</ReactRouter.NavLink>;
            return (
              <tr key={tagInfo.key}>
                <td>{key}</td>
                <td>{tagInfo.summary}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </React.Fragment>
  );

  const newKeyText = (
    <div>
      <span>New {text}:</span>
      <span>
        {newKey}
        <ErrorMessage errorMessage={validationErrorMessage} />
      </span>
    </div>
  );

  const newDescriptionText = (
    <div>
      <span>Description:</span>
      <span className="description">{newDescription}</span>
    </div>
  );

  const newButtonText = (
    <div>
      <span></span>
      <span>{newButton}</span>
    </div>
  );

  return (
    <React.Fragment>
      <Tabs actions={tabActions} selected={selectedTab} />
      <div className="table compact">
        {newKeyText}
        {newDescriptionText}
        {!key || validationErrorMessage ? undefined : newButtonText}
      </div>
      {showAll}
    </React.Fragment>
  );
};
