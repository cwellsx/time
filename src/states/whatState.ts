import type { Config, TagCount, TagInfo, WhatType } from "../model";

export interface WhatState {
  readonly config: Config;
  getAll(whatType: WhatType): TagInfo[];
  create(whatType: WhatType, tag: TagInfo): void;
  saveWhatType(whatType: WhatType): void;
}
