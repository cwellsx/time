import raw from 'raw.macro';

import startUrl from './start.png';
import stopUrl from './stop.png';
import toolbarUrl from './toolbar.png';

interface Images {
  [index: string]: string | undefined;
}

export const images: Images = {
  toolbar: toolbarUrl,
  start: startUrl,
  stop: stopUrl,
};

export const help = raw("./help.md");
