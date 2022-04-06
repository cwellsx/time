import './help.sass';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingProps, TransformImage } from 'react-markdown/lib/ast-to-react';
import * as ReactRouter from 'react-router-dom';

import { help, images, now } from '../help';

type HelpProps = {
  helpId: string | undefined;
};

type Page = {
  markdown: string;
  title: string;
  helpId: string | undefined;
};

const pages: Page[] = [
  {
    markdown: help,
    title: "Help",
    helpId: undefined,
  },
  {
    markdown: now,
    title: "Now",
    helpId: "now",
  },
];

function getSlug(text: string): string {
  return text.toLowerCase().replace(/\W/g, "-");
}

function getToc(page: Page): JSX.Element {
  const lines = page.markdown.split(/\r?\n/);
  const h2s = lines.filter((it) => it.startsWith("## ")).map((it) => it.substring(3));
  console.log(JSON.stringify(h2s));
  return (
    <ul>
      {pages.map((it) => {
        const hrefPage = "/help" + (it.helpId ? "/" + it.helpId : "");
        const h1Slug = getSlug(it.title);
        return (
          <li key={h1Slug}>
            {it !== page ? (
              <ReactRouter.NavLink to={hrefPage}>{it.title}</ReactRouter.NavLink>
            ) : (
              <>
                <a href={hrefPage + "#" + h1Slug}>{it.title}</a>
                {!h2s.length ? undefined : (
                  <ul>
                    {h2s.map((it) => {
                      const h2Slug = getSlug(it);
                      return (
                        <li key={h2Slug}>
                          <a href={hrefPage + "#" + h2Slug}>{it}</a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export const Help: React.FunctionComponent<HelpProps> = (props: HelpProps) => {
  const helpId = props.helpId;
  const page: Page = pages.find((it) => it.helpId == helpId) ?? pages[0];

  // [Headings are missing anchors / ids](https://github.com/remarkjs/react-markdown/issues/69)
  function HeadingRenderer(props: React.PropsWithChildren<HeadingProps>) {
    function flatten(text: any, child: any): string {
      return typeof child === "string"
        ? text + child
        : React.Children.toArray(child.props.children).reduce(flatten, text);
    }

    const children = React.Children.toArray(props.children);
    const text = children.reduce(flatten, "") as string;
    const slug = getSlug(text);

    return React.createElement("h" + props.level, { id: slug }, props.children);
  }

  console.log("Help");

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

  const content = (
    <ReactMarkdown
      components={{
        h1: HeadingRenderer,
        h2: HeadingRenderer,
        a: AnchorRenderer,
      }}
      transformImageUri={transformImageUri}
    >
      {page.markdown}
    </ReactMarkdown>
  );

  return (
    <div className="help">
      <div className="toc">{getToc(page)}</div>
      {content}
    </div>
  );
};
