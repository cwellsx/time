import './help.sass';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingProps, TransformImage } from 'react-markdown/lib/ast-to-react';

import { help, images } from '../help';

// const markdown = raw("../fetch/help.md");

type HelpProps = {
  //markdown: string;
};

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  // const markdown = props.markdown;
  const markdown = help;

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

  const transformImageUri: TransformImage = (src: string, alt: string, title: string | null) => {
    const url = images[src] ?? "";
    console.log(url);
    return url;
  };

  return (
    <div className="help">
      {/* <ReactMarkdown components={{ h2: HeadingRenderer, link: HeadingRenderer }} transformImageUri={transformImageUri}> */}
      <ReactMarkdown components={{ h2: HeadingRenderer }} transformImageUri={transformImageUri}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
