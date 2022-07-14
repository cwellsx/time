import React from 'react';

import { EditTree } from './EditTree';
import { makeNodes } from './makeNodes';

import type { INode } from "./node";

type Data = { key: string };
type Parents = {
  [index: string]: string | undefined;
};
const render = (item: Data): React.ReactNode => item.key;

export const SampleTree: React.FunctionComponent = () => {
  const [data, setData] = React.useState<Data[]>([{ key: "foo" }, { key: "bar" }, { key: "baz" }]);
  const [parents, setParents] = React.useState<Parents>({ baz: "bar" });

  const getParent = (key: string) => {
    return parents[key] ?? null;
  };

  const setParent = (child: string, parent: string | null) => {
    const newParents = { ...parents };
    newParents[child] = parent ?? undefined;
    setParents(newParents);
  };

  function makeSampleTree(): INode[] {
    return makeNodes(
      data,
      (item) => item.key,
      render,
      getParent,
      (item) => "sampleType"
    );
  }
  return <EditTree roots={makeSampleTree()} setParent={setParent} />;
};
