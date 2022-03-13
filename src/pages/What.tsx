import "./what.sass";

import React from "react";

import { Tabs } from "../tabs";

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
  const whatType: WhatType = state.config.whatType ?? "tags";

  const tabActions: TabAction[] = [
    { text: "Tags", action: () => state.saveWhatType("tags") },
    { text: "Tasks", action: () => state.saveWhatType("tasks") },
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

  function onNewDescription(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    const key = event.target.value;
    setDescription(key);
  }

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const tag: TagInfo = { key: key, summary: description };
    state.create(whatType, tag);
    setKey("");
    setDescription("");
  }

  const newKey = <input onChange={onNewKey} value={key} />;
  const newDescription = <input onChange={onNewDescription} value={description} />;
  const newButton = <button onClick={onSave}>Save</button>;

  const all = state.getAll(whatType);
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
      <span>{newDescription}</span>
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
