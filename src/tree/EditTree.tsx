import './editTree.sass';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { TreeItem } from './TreeItem';

import type { INode } from "./node";

type EditTreeProps = {
  roots: INode[];
  setParent: (child: string, parent: string | null) => void;
};
export const EditTree: React.FunctionComponent<EditTreeProps> = (props: EditTreeProps) => {
  const { roots, setParent } = props;

  const renderNodes = (nodes: INode[], level: number) => {
    return nodes.map((node, index) => {
      return (
        <li key={node.key}>
          <TreeItem node={node} index={index} setParent={setParent} />
          {node.children.length ? <ul>{renderNodes(node.children, level + 1)}</ul> : undefined}
        </li>
      );
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ul className="editTree">{renderNodes(roots, 0)}</ul>
    </DndProvider>
  );
};
