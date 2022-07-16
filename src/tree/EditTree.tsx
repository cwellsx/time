import "./editTree.sass";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { TreeItem } from "./TreeItem";

import type { INode, SetParent } from "./treeTypes";

type Sibling = "root-sibling" | "no-siblings" | "middle-sibling" | "last-sibling";

function getSibling(index: number, n: number, root: boolean): Sibling {
  if (root) {
    //special cases
    if (n === 1) return "no-siblings";
    if (index === 0) return "root-sibling";
  }
  return index === n - 1 ? "last-sibling" : "middle-sibling";
}

type EditTreeProps = {
  roots: INode[];
  setParent: SetParent;
};

export const EditTree: React.FunctionComponent<EditTreeProps> = (props: EditTreeProps) => {
  const { roots, setParent } = props;

  const renderNodes = (nodes: INode[], level: number) => {
    return nodes.map((node, index) => {
      const sibling = getSibling(index, nodes.length, level === 0);
      return (
        <li key={node.key} className={sibling}>
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
