import './editTree.sass';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type EditTreeProps = {
  nodes: INode[];
  getParent(key: string): string | null;
};

interface INode {
  key: string;
  parent: INode | null;
  children: INode[];
  render(): React.ReactNode;
}

export class NodeT<T> implements INode {
  private readonly data: T;
  private readonly renderT: (item: T) => React.ReactNode;
  readonly key: string;
  readonly parent: INode | null;
  readonly children: INode[];

  render(): React.ReactNode {
    return this.renderT(this.data);
  }

  constructor(data: T, key: string, renderT: (item: T) => React.ReactNode) {
    this.data = data;
    this.renderT = renderT;
    this.key = key;
    this.parent = null;
    this.children = [];
  }
}

export const EditSampleTree = () => {
  type Data = { key: string };
  const data: Data[] = [{ key: "foo" }, { key: "bar" }];
  const getParent = (key: string) => {
    switch (key) {
      case "foo":
        return "bar";
      default:
        return null;
    }
  };
  const render = (item: Data): React.ReactNode => item.key;
  const nodes: INode[] = data.map((data) => new NodeT(data, data.key, render));
  return <EditTree nodes={nodes} getParent={getParent} />;
};

export const EditTree: React.FunctionComponent<EditTreeProps> = (props: EditTreeProps) => {
  const { nodes, getParent } = props;

  const dictionary: { [index: string]: INode } = {};
  for (const node of nodes) dictionary[node.key] = node;

  const tree: INode[] = [];
  for (const node of nodes) {
    const parentKey = getParent(node.key);
    if (parentKey === null) tree.push(node);
    else {
      const parent = dictionary[parentKey];
      node.parent = parent;
      parent.children.push(node);
    }
  }

  return <DndProvider backend={HTML5Backend}>{renderTree(tree)}</DndProvider>;
};

const renderNodes = (nodes: INode[]) => {
  return nodes.map((node) => {
    return (
      <li>
        {node.render()}
        {node.children.length ? <ul>{renderNodes(node.children)}</ul> : undefined}
      </li>
    );
  });
};

const renderTree = (nodes: INode[]) => {
  return <ul className="editTree">{renderNodes(nodes)}</ul>;
};
