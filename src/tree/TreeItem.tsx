import "./editTree.sass";

import React from "react";
import { useDrag, useDrop } from "react-dnd";

import type { Identifier, XYCoord } from "dnd-core";
import type { INode } from "./treeTypes";

type DragObject = {
  key: string;
  index: number;
};

type CollectedProps = {
  opacity: number;
};

type ItemProps = { node: INode; index: number; setParent: (child: string, parent: string | null) => void };

export const TreeItem: React.FunctionComponent<ItemProps> = (props: ItemProps) => {
  const { node, index, setParent } = props;

  // const itemRef = React.useRef<HTMLDivElement>(null);
  // const dragRef = React.useRef<HTMLDivElement>(null);

  // this is a heavily modified version of https://react-dnd.github.io/react-dnd/examples/sortable/simple

  const id = `tree-${node.key}`;

  const [{ handlerId }, drop] = useDrop<DragObject, void, { handlerId: Identifier | null }>({
    accept: node.type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragObject, monitor) {
      // can't be own parent
      if (node.key === item.key) return;

      // can't be parent of ancestor
      if (node.isDescendantOf(item.key)) return;

      const self = document.getElementById(id);
      const draggedOffset = monitor.getSourceClientOffset();

      if (!self || !draggedOffset) return;

      const isChild = draggedOffset.x > self.getBoundingClientRect().right;
      setParent(item.key, isChild ? node.key : node.parent);
    },
  });

  const [{ opacity }, drag, preview] = useDrag<DragObject, unknown, CollectedProps>(() => ({
    type: node.type,
    item: { key: node.key, index },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  }));

  const itemRef = React.useRef<HTMLDivElement>(null);
  drop(preview(itemRef));

  return (
    <div ref={itemRef} style={{ opacity }}>
      <div className="drag" ref={drag} id={id} />
      {node.render()}
    </div>
  );
};
