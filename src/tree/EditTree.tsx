import './editTree.sass';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { INode } from './node';

type EditTreeProps = {
  roots: INode[];
};

export const EditTree: React.FunctionComponent<EditTreeProps> = (props: EditTreeProps) => {
  const { roots } = props;

  console.log("EditTree: " + JSON.stringify(roots, ["key", "children"]));

  if (false)
    return (
      <DndProvider backend={HTML5Backend}>
        <ul className="editTree">{renderNodes(roots, 0)}</ul>
      </DndProvider>
    );
  return <ul className="editTree">{renderNodes(roots, 0)}</ul>;
};

type ItemProps = {
  node: INode;
};
export const Item: React.FunctionComponent<ItemProps> = (props: ItemProps) => {
  const { node } = props;
  console.log(`Item: ${node.key}`);
  return <div>{node.render()}</div>;
};

const renderNodes = (nodes: INode[], level: number) => {
  console.log(`renderNodes: ${level}` + JSON.stringify(nodes, ["key", "children"]));
  return nodes.map((node) => {
    return (
      <li key={node.key}>
        <Item node={node} />
        {node.children.length ? <ul>{renderNodes(node.children, level + 1)}</ul> : undefined}
      </li>
    );
  });
};
