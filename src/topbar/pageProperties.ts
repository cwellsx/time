import React from 'react';

import { help, now, what } from './markdown';
import * as Icon from './icons';

type ImportedSvg = React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined }>;

export type Page = {
    href: string,
    markdown: string | undefined;
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
        markdown: undefined,
        title: "History",
        helpId: "history",
        icon: Icon.History,
    },
    {
        href: "/settings",
        markdown: undefined,
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

