import React from "react";

import { ErrorMessage } from "../error";
import { TagInfo, WhatType } from "../model";
import { WhatState } from "../states";

type NewWhatProps = {
  whatType: WhatType;
  text: string;
  state: WhatState;
};

export const NewWhat: React.FunctionComponent<NewWhatProps> = (props: NewWhatProps) => {
  const { whatType, state, text } = props;

  const [key, setKey] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [validationErrorMessage, setValidationErrorMessage] = React.useState<string | undefined>(undefined);

  function setAndValidateKey(key: string) {
    key = key.trim();

    let message: string | undefined;
    const what = whatType === "tasks" ? "Task" : "Tag";
    if (!key) {
      message = undefined;
    } else if (key.indexOf(" ") !== -1) {
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
    <div className="table compact">
      {newKeyText}
      {newDescriptionText}
      {!key || validationErrorMessage ? undefined : newButtonText}
    </div>
  );
};
