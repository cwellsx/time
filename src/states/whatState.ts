import type { Config, TagCount, TagInfo, WhatType } from "../model";

export interface WhatState {
  readonly config: Config;
  getAllWhat(whatType: WhatType): TagInfo[];
  createWhat(whatType: WhatType, tag: TagInfo): void;
  saveWhatType(whatType: WhatType): void;
  keyAlreadyExists(whatType: WhatType, key: string): boolean;
}
