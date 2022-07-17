import React from "react";
import * as ReactRouter from "react-router-dom";

import { TagInfo, WhatType } from "../model";
import { WhatState } from "../states";
import { Cell, EditTable, RowData } from "./EditTable";

type EditSummaryProps = {
  whatType: WhatType;
  text: string;
  state: WhatState;
};

export const EditSummary: React.FunctionComponent<EditSummaryProps> = (props: EditSummaryProps) => {
  const { whatType, text, state } = props;

  const [selected, setSelected] = React.useState<Cell | undefined>(undefined);
  const [summary, setSummary] = React.useState<string | undefined>(undefined);

  const all = state.getAllWhat(whatType);
  if (!all.length) return <></>;

  all.sort((x, y) => x.key.localeCompare(y.key));

  function renderKey(key: string): React.ReactNode {
    if (!state.keyIsReferenced(whatType, key)) return key;
    const urlKey = whatType === "tags" ? "tag" : "task";
    const url = `/history?${urlKey}=${key}`;
    return <ReactRouter.NavLink to={url}>{key}</ReactRouter.NavLink>;
  }

  function onClicked(clicked: Cell | undefined): void {
    setSelected(clicked);
    setSummary(undefined);
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setSummary(event.target.value);
  }

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    if (!selected || !summary) return;
    state.editSummary(whatType, selected.key, summary);
    onClicked(undefined);
  }

  function renderSummary(tagInfo: TagInfo): React.ReactNode {
    if (!selected || selected.col === 0 || selected.key != tagInfo.key) return tagInfo.summary;
    const save = summary && summary != tagInfo.summary ? <button onClick={onSave}>Save</button> : undefined;
    return (
      <>
        <input onChange={onChange} defaultValue={tagInfo.summary} />
        {save}
      </>
    );
  }

  const rows = all.map((tagInfo) => {
    const rowData: RowData = {
      key: tagInfo.key,
      cells: [renderKey(tagInfo.key), renderSummary(tagInfo)],
    };
    return rowData;
  });

  return (
    <>
      <h2>Current {text}s</h2>
      <EditTable className="whats" onClicked={onClicked} rows={rows} />
    </>
  );
};
