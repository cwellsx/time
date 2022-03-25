import React from 'react';

import type { RequiredType } from "../model";
import type { SettingsState, SetRequiredType } from "../states";

type SettingsProps = {
  state: SettingsState;
};

export const Settings: React.FunctionComponent<SettingsProps> = (props: SettingsProps) => {
  const state = props.state;
  const config = state.config;

  const [tagsRequired, setTagsRequired] = React.useState<string>(config.tagsRequired ?? "optional");
  const [taskRequired, setTaskRequired] = React.useState<string>(config.taskRequired ?? "optional");

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

  function getOptions(value: string, onChange: React.ChangeEventHandler<HTMLInputElement>) {
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

  const onTagsRequired: React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as RequiredType;
    setTagsRequired(value);
    state.setTagsRequired(value);
  };
  const onTaskRequired: React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as RequiredType;
    setTaskRequired(value);
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
          <span>{getOptions(tagsRequired, onTagsRequired)}</span>
        </div>
        <div>
          <span>Tasks:</span>
          <span>{getOptions(taskRequired, onTaskRequired)}</span>
        </div>
      </div>
    </>
  );
};
