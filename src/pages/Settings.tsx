import React from "react";

import type { SettingsState } from "../states";

type SettingsProps = {
  state: SettingsState;
};

export const Settings: React.FunctionComponent<SettingsProps> = (props: SettingsProps) => {
  const state = props.state;
  //const config = state.config;

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

  return (
    <React.Fragment>
      <h2>Database</h2>
      <div className="table">{persisted}</div>
      <h2>Options</h2>
    </React.Fragment>
  );
};
