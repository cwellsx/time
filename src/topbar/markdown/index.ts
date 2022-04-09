import raw from 'raw.macro';

import startUrl from './start-min.png';
import stopUrl from './stop-min.png';
import tags1Url from './tags1-min.png';
import tags2Url from './tags2-min.png';
import tags3Url from './tags3-min.png';
import toolbarUrl from './toolbar-min.png';

interface Images {
  [index: string]: string | undefined;
}

export const images: Images = {
  toolbar: toolbarUrl,
  start: startUrl,
  stop: stopUrl,
  tags1: tags1Url,
  tags2: tags2Url,
  tags3: tags3Url,
};

export const toc = raw("./toc.md");
export const help = raw("./help.md");
export const now = raw("./now.md");
export const what = raw("./what.md");
export const history = raw("./history.md");
export const settings = raw("./settings.md");
