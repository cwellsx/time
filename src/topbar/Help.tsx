import './help.sass';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingProps, TransformImage } from 'react-markdown/lib/ast-to-react';
import * as ReactRouter from 'react-router-dom';

import { images } from './markdown';
import { pages, Page } from './pageProperties';

type HelpProps = {
  helpId: string | undefined;
};

function getSlug(text: string): string {
  return text.toLowerCase().replace(/\W/g, "-");
}

function getToc(page: Page): JSX.Element {
  if (!page.markdown) return <>should not hqppen</>;
  const lines = page.markdown.split(/\r?\n/);
  const h2s = lines.filter((it) => it.startsWith("## ")).map((it) => it.substring(3));
  console.log(JSON.stringify(h2s));
  return (
    <ul>
      {pages.map((it) => {
        if (!it.markdown) return undefined;
        const hrefPage = "/help" + (it.helpId ? "/" + it.helpId : "");
        const h1Slug = getSlug(it.title);
        const h1Text = (
          <>
            {<it.icon />} {it.title}
          </>
        );
        return (
          <li key={h1Slug}>
            {it !== page ? (
              <ReactRouter.NavLink to={hrefPage}>{h1Text}</ReactRouter.NavLink>
            ) : (
              <>
                <a href={hrefPage + "#" + h1Slug}>{h1Text}</a>
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
      {page.markdown ?? "should not hqppen"}
    </ReactMarkdown>
  );

  return (
    <div className="help">
      <div className="toc">{getToc(page)}</div>
      {content}
    </div>
  );
};
