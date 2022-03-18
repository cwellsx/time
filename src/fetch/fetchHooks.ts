import React from "react";

import { useSetError } from "../appContext";
import HelpMarkdownUrl from "./help.md";

// to make `import from "*.md"` work I had to add src/global.d.ts

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
