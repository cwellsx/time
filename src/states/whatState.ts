import type { Config, Parents, TagInfo, WhatType } from "../model";
import type { EditWhatState } from "./editWhatState";

export type WhatState = EditWhatState & {
  readonly config: Config;
  readonly taskParents: Parents;
  readonly tagParents: Parents;
  getAllWhat(whatType: WhatType): TagInfo[];
  createWhat(whatType: WhatType, tag: TagInfo): void;
  editSummary(whatType: WhatType, key: string, summary: string): void;
  saveWhatType(whatType: WhatType): void;
  keyAlreadyExists(whatType: WhatType, key: string): boolean;
  keyIsReferenced(whatType: WhatType, key: string): boolean;
  setParent(whatType: WhatType, child: string, parent: string | undefined): void;
};
