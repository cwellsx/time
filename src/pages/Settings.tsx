import React from "react";

import { useSetError } from "../error";
import { showIsoDay } from "./helpDate";

import type { RequiredType } from "../model";
import type { SettingsState } from "../states";

type SettingsProps = {
  state: SettingsState;
};

export const Settings: React.FunctionComponent<SettingsProps> = (props: SettingsProps) => {
  const state = props.state;
  const config = state.config;

  const [tagsRequired, setTagsRequired] = React.useState<string>(config.tagsRequired ?? "optional");
  const [taskRequired, setTaskRequired] = React.useState<string>(config.taskRequired ?? "optional");
  const [historyEditable, setHistoryEditable] = React.useState<boolean>(config.historyEditable ?? false);
  const setError = useSetError();

  function onRetryPersist(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    state.persist();
  }

  async function onExport(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    try {
      const options: SaveFilePickerOptions = {
        suggestedName: `time-${showIsoDay(new Date())}.json`,
        types: [
          {
            description: "Text Files",
            accept: {
              "text/plain": [".txt"],
            },
          },
        ],
      };
      const fileHandle = await window.showSaveFilePicker(options);
      const writeable = await fileHandle.createWritable();
      writeable.write(state.getDatabaseAsJson());
      writeable.close();
    } catch (e) {
      setError(e);
    }
  }

  async function onImport(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
        multiple: false,
      });

      const file = await fileHandle.getFile();
      const text = await file.text();
      await state.overwriteDatabaseAsJson(text);
    } catch (e) {
      setError(e);
    }
  }

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

  const onHistoryEditable: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;
    setHistoryEditable(checked);
    state.setHistoryEditable(checked);
  };

  return (
    <>
      <h2>Database</h2>
      <div className="table">
        <div>
          <span>Persisted:</span>
          <span>
            {state.persisted ? (
              "✅"
            ) : (
              <>
                ❌ <button onClick={onRetryPersist}>Retry</button>
              </>
            )}{" "}
            {}
          </span>
        </div>
        <div>
          <span>Exported:</span>
          <span>
            <button onClick={onExport}>Save As</button>
            <button onClick={onImport}>Import</button>
          </span>
        </div>
      </div>
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
        <div>
          <span>History:</span>
          <label>
            <input type="checkbox" checked={historyEditable} onChange={onHistoryEditable} /> Editable
          </label>
        </div>
      </div>
      <h2>Version</h2>
      <p>1.0</p>
    </>
  );
};
