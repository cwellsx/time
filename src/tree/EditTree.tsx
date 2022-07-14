import './editTree.sass';

import React from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { INode } from "./node";

type EditTreeProps = {
  roots: INode[];
  setParent: (child: string, parent: string | null) => void;
};
export const EditTree: React.FunctionComponent<EditTreeProps> = (props: EditTreeProps) => {
  const { roots } = props;
  return (
    <DndProvider backend={HTML5Backend}>
      <ul className="editTree">{renderNodes(roots, 0)}</ul>
    </DndProvider>
  );
};

type ItemProps = { node: INode };
export const Item: React.FunctionComponent<ItemProps> = (props: ItemProps) => {
  const { node } = props;

  const [{ opacity }, drag, preview] = useDrag(() => ({
    type: node.type,
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  }));

  return (
    <div ref={preview} style={{ opacity }}>
      <div className="drag" ref={drag} />
      {node.render()}
    </div>
  );
};

const renderNodes = (nodes: INode[], level: number) => {
  return nodes.map((node) => {
    return (
      <li key={node.key}>
        <Item node={node} />
        {node.children.length ? <ul>{renderNodes(node.children, level + 1)}</ul> : undefined}
      </li>
    );
  });
};
