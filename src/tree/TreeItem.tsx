import "./treeItem.sass";

import React from "react";
import { useDrag, useDrop } from "react-dnd";

import type { Identifier, XYCoord } from "dnd-core";
import type { INode, SetParent } from "./treeTypes";

type DragObject = {
  key: string;
  index: number;
};

type CollectedProps = {
  opacity: number;
};

type ItemProps = {
  node: INode;
  index: number;
  setParent: SetParent;
};

export const TreeItem: React.FunctionComponent<ItemProps> = (props: ItemProps) => {
  const { node, index, setParent } = props;

  // this is a heavily modified version of https://react-dnd.github.io/react-dnd/examples/sortable/simple

  const itemRef = React.useRef<HTMLDivElement>(null);

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

      const dropped = itemRef.current?.getBoundingClientRect();
      const dragged = monitor.getSourceClientOffset();

      if (!dropped || !dragged) return;

      const isChild = dragged.x > dropped.left + 24;

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

  drop(preview(itemRef));

  return (
    <div className="item" ref={itemRef} style={{ opacity }}>
      <div className="pad">
        <div className="drag" ref={drag} />
      </div>
      <div className="pad">
        <span className="content">{node.render()}</span>
      </div>
    </div>
  );
};
