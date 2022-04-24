import React from 'react';

import { useSetError } from '../error';
import HelpMarkdownUrl from './help.md';

// to make `import from "*.md"` work I had to add src/global.d.ts

export function useHelp(): string | undefined {
  const [markdown, setMarkdown] = React.useState<string | undefined>(undefined);
  const setError = useSetError();
  const url = HelpMarkdownUrl;

  React.useEffect(() => {
    let disposed = false;
    const invoke = async () => {
      try {
        const response = await fetch(url);
        if (disposed) return;
        const text = await response.text();
        if (disposed) return;
        setMarkdown(text);
      } catch (e) {
        setError(e + "");
      }
    };
    invoke();
    return () => {
      disposed = true;
    };
  }, [url, setError]);
  return markdown;
}
