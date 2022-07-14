import './editTree.sass';

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

import type { Identifier, XYCoord } from "dnd-core";
import type { INode } from "./node";

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
      // if (!ref.current) {
      //   return;
      // }
      // const dragIndex = item.siblingIndex;
      // const hoverIndex = node.siblingIndex;
      // // Don't replace items with themselves
      // if (dragIndex === hoverIndex) {
      //   return;
      // }
      // // Determine rectangle on screen
      // const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // // Get vertical middle
      // const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // // Determine mouse position
      // const clientOffset = monitor.getClientOffset();
      // // Get pixels to the top
      // const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      // // Only perform the move when the mouse has crossed half of the items height
      // // When dragging downwards, only move when the cursor is below 50%
      // // When dragging upwards, only move when the cursor is above 50%
      // // Dragging downwards
      // if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      //   return;
      // }
      // // Dragging upwards
      // if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      //   return;
      // }
      // // Time to actually perform the action
      // moveCard(dragIndex, hoverIndex);
      // // Note: we're mutating the monitor item here!
      // // Generally it's better to avoid mutations,
      // // but it's good here for the sake of performance
      // // to avoid expensive index searches.
      // item.index = hoverIndex;
      setParent(item.key, node.key);
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
      <div className="drag" ref={drag} />
      {node.render()}
    </div>
  );
};
