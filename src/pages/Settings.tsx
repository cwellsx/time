import React from "react";

import type { RequiredType } from "../model";
import type { SettingsState, SetRequiredType } from "../states";

type SettingsProps = {
  state: SettingsState;
};

export const Settings: React.FunctionComponent<SettingsProps> = (props: SettingsProps) => {
  const state = props.state;
  const config = state.config;

  function onRetryPersist(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    state.persist();
  }

  const persistButton = <button onClick={onRetryPersist}>Retry</button>;

  const persisted = (
    <React.Fragment>
      <div>
        <span>Persisted:</span>
        <span>
          {state.persisted ? "✅" : <React.Fragment>❌ {persistButton}</React.Fragment>} {}
        </span>
      </div>
    </React.Fragment>
  );

  function getOptions(value: string | undefined, setValue: SetRequiredType) {
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value as RequiredType);
    };
    value = value ?? "optional";
    return (
      <>
        <label>
          <input type="radio" value="optional" checked={"optional" === value} onChange={onChange} /> Optional
        </label>
        <label>
          <input type="radio" value="required" checked={"required" === value} onChange={onChange} /> Required
        </label>
      </>
    );
  }

  const setTagsRequired: SetRequiredType = (value: RequiredType) => {
    state.setTagsRequired(value);
  };
  const setTaskRequired: SetRequiredType = (value: RequiredType) => {
    state.setTaskRequired(value);
  };

  return (
    <>
      <h2>Database</h2>
      <div className="table">{persisted}</div>
      <h2>Options</h2>
      <div className="table">
        <div>
          <span>Tags:</span>
          <span>{getOptions(config.tagsRequired, setTagsRequired)}</span>
        </div>
        <div>
          <span>Tasks:</span>
          <span>{getOptions(config.taskRequired, setTaskRequired)}</span>
        </div>
      </div>
    </>
  );
};
