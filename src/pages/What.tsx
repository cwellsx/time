import "./what.sass";

import React from "react";
import * as ReactRouter from "react-router-dom";

import { Tabs } from "../tabs";
import { SampleTree } from "../tree";
import { EditSummary } from "./EditSummary";
import { NewWhat } from "./NewWhat";

import type { WhatState } from "../states";
import type { TabAction } from "../tabs";
import type { WhatType, TagInfo } from "../model";

type WhatProps = {
  state: WhatState;
};

export const What: React.FunctionComponent<WhatProps> = (props: WhatProps) => {
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

  const all = state.getAllWhat(whatType);
  all.sort((x, y) => x.key.localeCompare(y.key));
  function saveSummary(key: string, summary: string): void {}
  function renderKey(key: string): React.ReactNode {
    if (!state.keyIsReferenced(whatType, key)) return key;
    const urlKey = whatType === "tags" ? "tag" : "task";
    const url = `/history?${urlKey}=${key}`;
    return <ReactRouter.NavLink to={url}>{key}</ReactRouter.NavLink>;
  }
  //const foo = <EditSummary displayed={all} saveSummary={saveSummary} renderKey={renderKey} />;

  const showAll = !all.length ? undefined : (
    <React.Fragment>
      <h2>Current {text}s</h2>
      <EditSummary displayed={all} saveSummary={saveSummary} renderKey={renderKey} />
      {/* <table className="whats">
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
      </table> */}
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Tabs actions={tabActions} selected={selectedTab} />
      <NewWhat whatType={whatType} state={state} text={text} />
      {showAll}
      <SampleTree />
    </React.Fragment>
  );
};
