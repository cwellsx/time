import React from "react";
import ReactMarkdown from "react-markdown";
import { HeadingProps } from "react-markdown/lib/ast-to-react";

type HelpProps = {
  markdown: string;
};

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  const markdown = props.markdown;

  // [Headings are missing anchors / ids](https://github.com/remarkjs/react-markdown/issues/69)
  function HeadingRenderer(props: React.PropsWithChildren<HeadingProps>) {
    function flatten(text: any, child: any): string {
      return typeof child === "string"
        ? text + child
        : React.Children.toArray(child.props.children).reduce(flatten, text);
    }

    const children = React.Children.toArray(props.children);
    const text = children.reduce(flatten, "") as string;
    const slug = text.toLowerCase().replace(/\W/g, "-");
    return React.createElement("h" + props.level, { id: slug }, props.children);
  }

  return <ReactMarkdown components={{ h2: HeadingRenderer }}>{markdown}</ReactMarkdown>;
};
