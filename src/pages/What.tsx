import React from "react";

import { Tabs } from "../tabs";

import type { WhatState } from "../states";
import type { TabAction } from "../tabs";
import type { WhatType } from "../model";

type WhatProps = {
  state: WhatState;
};

export const What: React.FunctionComponent<WhatProps> = (props: WhatProps) => {
  const state = props.state;

  const tabActions: TabAction[] = [
    { text: "Tags", action: () => state.saveWhatType("tags") },
    { text: "Tasks", action: () => state.saveWhatType("tasks") },
  ];

  const selectedTab = ((whatType: WhatType | undefined) => {
    switch (whatType) {
      case undefined:
        return 0;
      case "tags":
        return 0;
      case "tasks":
        return 1;
    }
  })(state.config.whatType);

  return (
    <React.Fragment>
      <Tabs actions={tabActions} selected={selectedTab} />
      Hello
    </React.Fragment>
  );
};
