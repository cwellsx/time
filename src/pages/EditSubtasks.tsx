import React from "react";

import { Parents, TagCount, WhatType } from "../model";
import { WhatState } from "../states";
import { EditTree, makeTree } from "../tree";

type EditSubtasksProps = {
  whatType: WhatType;
  state: WhatState;
};

export const EditSubtasks: React.FunctionComponent<EditSubtasksProps> = (props: EditSubtasksProps) => {
  const { whatType, state } = props;

  const [parents, setParents] = React.useState<Parents>(whatType === "tasks" ? state.taskParents : state.tagParents);
  const data = whatType === "tasks" ? state.getAllTasks() : state.getAllTags();
  if (!data.length) return <></>;

  function getKey(item: TagCount): string {
    return item.key;
  }
  function render(item: TagCount): React.ReactNode {
    return item.key;
  }
  function getParent(key: string): string | null {
    return parents[key] ?? null;
  }
  function getType(item: TagCount): string {
    return whatType;
  }

  const setParent = (child: string, parent: string | null, isDrop: boolean) => {
    if (isDrop) {
      state.setParent(whatType, child, parent ?? undefined);
      return;
    }
    const newParents = { ...parents };
    if (parent) newParents[child] = parent;
    else delete newParents[child];
    setParents(newParents);
  };

  const tree = makeTree(data, getKey, render, getParent, getType);
  return <EditTree roots={tree} setParent={setParent} />;
};
