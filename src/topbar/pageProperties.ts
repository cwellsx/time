import React from 'react';

import * as Icon from './icons';
import { help, history, now, settings, what } from './markdown';

type ImportedSvg = React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined }>;

export type Page = {
  href: string;
  markdown: string | undefined;
  title: string;
  helpId: string | undefined;
  icon: ImportedSvg;
};

export type HelpPage = {
  href: string;
  markdown: string;
  title: string;
  helpId: string | undefined;
  icon: ImportedSvg;
};

export const pages: Page[] = [
  {
    href: "/",
    markdown: now,
    title: "Now",
    helpId: "now",
    icon: Icon.Now,
  },
  {
    href: "/what",
    markdown: what,
    title: "What",
    helpId: "what",
    icon: Icon.Tags,
  },
  {
    href: "/history",
    markdown: history,
    title: "History",
    helpId: "history",
    icon: Icon.History,
  },
  {
    href: "/settings",
    markdown: settings,
    title: "Settings",
    helpId: "settings",
    icon: Icon.Settings,
  },
  {
    href: "/help",
    markdown: help,
    title: "Help",
    helpId: undefined,
    icon: Icon.Help,
  },
  {
    href: "/tests",
    markdown: undefined,
    title: "Tests",
    helpId: "tests",
    icon: Icon.Tests,
  },
];

if (process.env.PUBLIC_URL) {
  pages.pop();
}

function getHelpPages(): HelpPage[] {
  const all: HelpPage[] = pages.filter((it) => !!it.markdown) as HelpPage[];
  const index = all.findIndex((it) => !it.helpId);
  const help = all[index];
  all.splice(index, 1);
  all.splice(0, 0, help);
  return all;
}

export const helpPages: HelpPage[] = getHelpPages();
