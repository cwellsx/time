import type { Config, TagCount, TagInfo, WhatType } from "../model";

export interface WhatState {
  readonly config: Config;
  getAllWhat(whatType: WhatType): TagInfo[];
  createWhat(whatType: WhatType, tag: TagInfo): void;
  editSummary(whatType: WhatType, key: string, summary: string): void;
  saveWhatType(whatType: WhatType): void;
  keyAlreadyExists(whatType: WhatType, key: string): boolean;
  keyIsReferenced(whatType: WhatType, key: string): boolean;
}
