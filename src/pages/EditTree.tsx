import './editTree.sass';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type EditTreeProps<T> = {
  data: T[];
  getKey(item: T): string;
  getParent(key: string): string | null;
  render(item: T): React.ReactNode;
};

type Node<T> = {
  data: T;
  parent: Node<T> | null;
  children: Node<T>[];
};

export const EditSampleTree = () => {
  type Data = { key: string };
  const data: Data[] = [{ key: "foo" }, { key: "bar" }];
  const getKey = (item: Data) => {
    return item.key;
  };
  const getParent = (key: string) => {
    switch (key) {
      case "foo":
        return "bar";
      default:
        return null;
    }
  };
  const render = (item: Data): React.ReactNode => item.key;
  return <EditTree data={data} getKey={getKey} getParent={getParent} render={render} />;
};

// https://stackoverflow.com/questions/53958028/how-to-use-generics-in-props-in-react-in-a-functional-component
export const EditTree = <T extends object>(
  props: EditTreeProps<T> & { children?: React.ReactNode }
): React.ReactElement => {
  const { data, getKey, getParent, render } = props;

  const flat: Node<T>[] = data.map((data) => {
    return { data, parent: null, children: [] };
  });

  const dictionary: { [index: string]: Node<T> } = {};
  for (const node of flat) dictionary[getKey(node.data)] = node;

  const tree: Node<T>[] = [];
  for (const node of flat) {
    const parentKey = getParent(getKey(node.data));
    if (parentKey === null) tree.push(node);
    else {
      const parent = dictionary[parentKey];
      node.parent = parent;
      parent.children.push(node);
    }
  }

  const renderNodes = (nodes: Node<T>[]) => {
    return nodes.map((node) => {
      return (
        <li>
          {render(node.data)}
          {node.children.length ? <ul>{renderNodes(node.children)}</ul> : undefined}
        </li>
      );
    });
  };

  const renderTree = (nodes: Node<T>[]) => {
    return <ul className="editTree">{renderNodes(nodes)}</ul>;
  };

  return <DndProvider backend={HTML5Backend}>{renderTree(tree)}</DndProvider>;
};
