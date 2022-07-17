import "./what.sass";

import React from "react";

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

  return (
    <React.Fragment>
      <Tabs actions={tabActions} selected={selectedTab} />
      <NewWhat whatType={whatType} state={state} text={text} />
      <EditSummary whatType={whatType} state={state} text={text} />
      <SampleTree />
    </React.Fragment>
  );
};
