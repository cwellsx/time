import React from "react";

export type Cell = {
  key: string;
  col: number;
};

export type RowData = {
  key: string;
  cells: React.ReactNode[];
  colSpans?: number[];
};

type EditTableProps = {
  className?: string;
  onClicked: (clicked: Cell | undefined) => void;
  rows: RowData[];
};

export const EditTable: React.FunctionComponent<EditTableProps> = (props: EditTableProps) => {
  const { className, onClicked, rows } = props;

  const onTableClick: React.MouseEventHandler<HTMLTableElement> = (event: React.MouseEvent<HTMLTableElement>) => {
    const target = event.target;
    const el = target as HTMLElement;
    if (el.tagName !== "TD") return;
    const row = el.parentElement;
    if (!row) return;
    const key = row.getAttribute("data-key");
    if (!key) return;
    const col = getIndex(el);
    onClicked({ key, col });
  };

  function useOutsideAlerter(ref: React.RefObject<HTMLTableElement>) {
    React.useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event?.target)) {
          onClicked(undefined);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const tableRef = React.createRef<HTMLTableElement>();
  useOutsideAlerter(tableRef);

  return (
    <table className={className} onClick={onTableClick} ref={tableRef}>
      <tbody>
        {rows.map((row) => {
          return (
            <tr key={row.key} data-key={row.key}>
              {row.cells.map((cell, index) => {
                const colSpan = row.colSpans ? row.colSpans[index] : undefined;
                return <td colSpan={colSpan}>{cell}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function getIndex(child: HTMLElement): number {
  let index = 0;
  for (
    let previous: Element | null = child.previousElementSibling;
    !!previous;
    previous = previous.previousElementSibling
  )
    ++index;
  return index;
}
