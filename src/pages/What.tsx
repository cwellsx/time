import './what.sass';

import React from 'react';

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

  function onNewKey(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const key = event.target.value;
    setKey(key);
  }

  const workItemTypes = [
    ["Task", "task"],
    ["Bug", "bug"],
    ["PR", "pr"],
    ["Pull Request", "pr"],
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
        setKey(split[0]);
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
    setKey("");
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
      <table>
        <tbody>
          {all.map((tagInfo) => (
            <tr key={tagInfo.key}>
              <td>{tagInfo.key}</td>
              <td>{tagInfo.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </React.Fragment>
  );

  const newKeyText = (
    <div>
      <span>New {text}:</span>
      <span>{newKey}</span>
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
        {!key ? undefined : newButtonText}
      </div>
      {showAll}
    </React.Fragment>
  );
};
