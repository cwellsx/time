import React from "react";

import { useSetError } from "../error";
import HelpMarkdownUrl from "./help.md";

export function useHelp(): string | undefined {
  const [markdown, setMarkdown] = React.useState<string | undefined>(undefined);
  const setError = useSetError();
  const url = HelpMarkdownUrl;

  React.useEffect(() => {
    const invoke = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setMarkdown(text);
      } catch (e) {
        setError(e + "");
      }
    };
    invoke();
  }, []);
  return markdown;
}
