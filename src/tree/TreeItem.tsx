import "./treeItem.sass";

import React from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";

import type { Identifier, XYCoord } from "dnd-core";
import type { INode, SetParent } from "./treeTypes";

type DragObject = {
  key: string;
  index: number;
  parent: string | null;
};

type CollectedProps = {
  opacity: number;
};

type ItemProps = {
  node: INode;
  index: number; // not currently used, could be used if we wanted to control the order of siblings
  setParent: SetParent;
};

export const TreeItem: React.FunctionComponent<ItemProps> = (props: ItemProps) => {
  const { node, index, setParent } = props;

  // this is a heavily modified version of https://react-dnd.github.io/react-dnd/examples/sortable/simple

  const itemRef = React.useRef<HTMLDivElement>(null);

  function target(item: DragObject, monitor: DropTargetMonitor<DragObject, void>, isDrop: boolean): void {
    // can't be own parent
    // can't be parent of ancestor
    if (!monitor.canDrop()) return;

    const dropped = itemRef.current?.getBoundingClientRect();
    const dragged = monitor.getSourceClientOffset();

    if (!dropped || !dragged) return;

    if (item.key == node.key) {
      // dropping on self
      setParent(item.key, node.parent, isDrop);
      return;
    }

    const isChild = dragged.x > dropped.left + 24;

    setParent(item.key, isChild ? node.key : node.parent, isDrop);
  }

  const [{ handlerId }, drop] = useDrop<DragObject, void, { handlerId: Identifier | null }>({
    accept: node.type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    canDrop(item: DragObject, monitor) {
      return !node.isDescendantOf(item.key);
    },
    hover(item: DragObject, monitor) {
      target(item, monitor, false);
    },
    drop(item: DragObject, monitor) {
      target(item, monitor, true);
    },
  });

  const [{ opacity }, drag, preview] = useDrag<DragObject, unknown, CollectedProps>(() => ({
    type: node.type,
    item: { key: node.key, index, parent: node.parent },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
    end: (item, monitor) => {
      const { key, parent } = item;
      const didDrop = monitor.didDrop();
      if (!didDrop) setParent(key, parent, false);
    },
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
