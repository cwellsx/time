import React from "react";

import { TagInfo } from "../model";
import { Cell, EditTable, RowData } from "./EditTable";

type EditSummaryProps = {
  displayed: TagInfo[];
  saveSummary: (key: string, summary: string) => void;
  renderKey: (key: string) => React.ReactNode;
};

export const EditSummary: React.FunctionComponent<EditSummaryProps> = (props: EditSummaryProps) => {
  const { displayed, saveSummary, renderKey } = props;
  const [selected, setSelected] = React.useState<Cell | undefined>(undefined);

  if (!displayed.length) return <></>;

  function renderSummary(tagInfo: TagInfo): React.ReactNode {
    return tagInfo.summary;
  }

  const rows = displayed.map((tagInfo) => {
    const rowData: RowData = {
      key: tagInfo.key,
      cells: [renderKey(tagInfo.key), renderSummary(tagInfo)],
    };
    return rowData;
  });
  return <EditTable className="whats" onClicked={setSelected} rows={rows} />;
};
