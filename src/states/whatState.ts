import type { Config, TagCount, TagInfo, WhatType } from "../model";

export interface WhatState {
  readonly config: Config;
  getAll(what: WhatType): Promise<TagCount[]>;
  create(what: WhatType, tag: TagInfo): void;
  saveWhatType(whatType: WhatType): void;
}
