import './help.sass';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingProps, TransformImage } from 'react-markdown/lib/ast-to-react';
import * as ReactRouter from 'react-router-dom';

import { help, images, now, toc } from '../help';

type HelpProps = {
  helpId: string | undefined;
};

function getMarkdown(helpId: string | undefined): string {
  switch (helpId) {
    case "now":
      return now;
    case undefined:
    default:
      return help;
  }
}

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  const markdown = getMarkdown(props.helpId);

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

  function AnchorRenderer(
    props: React.PropsWithChildren<
      React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
    >
  ) {
    console.log("ReactRouter.NavLink");
    return <ReactRouter.NavLink to={props.href!}>{props.children}</ReactRouter.NavLink>;
  }

  const transformImageUri: TransformImage = (src: string, alt: string, title: string | null) => {
    const url = images[src] ?? "";
    // console.log(url);
    return url;
  };

  return (
    <div className="help">
      <div className="toc">
        <ReactMarkdown components={{ a: AnchorRenderer }} transformImageUri={transformImageUri}>
          {toc}
        </ReactMarkdown>
      </div>
      {/* <ReactMarkdown components={{ h2: HeadingRenderer, link: HeadingRenderer }} transformImageUri={transformImageUri}> */}
      <ReactMarkdown
        components={{
          h1: HeadingRenderer,
          h2: HeadingRenderer,
          a: AnchorRenderer,
        }}
        transformImageUri={transformImageUri}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
