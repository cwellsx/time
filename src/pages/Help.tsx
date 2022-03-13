import React from "react";

// to make this work I had to add src/global.d.ts
type HelpProps = {
  markdown: string;
};

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  const markdown = props.markdown;
  return <div>{markdown}</div>;
};
