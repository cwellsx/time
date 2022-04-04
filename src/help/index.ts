import raw from 'raw.macro';

import startUrl from './start-min.png';
import stopUrl from './stop-min.png';
import toolbarUrl from './toolbar-min.png';

interface Images {
  [index: string]: string | undefined;
}

export const images: Images = {
  toolbar: toolbarUrl,
  start: startUrl,
  stop: stopUrl,
};

export const toc = raw("./toc.md");
export const help = raw("./help.md");
