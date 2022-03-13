import React from "react";
import ReactMarkdown from "react-markdown";

// to make this work I had to add src/global.d.ts
type HelpProps = {
  markdown: string;
};

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  const markdown = props.markdown;
  return <ReactMarkdown>{markdown}</ReactMarkdown>;
};
